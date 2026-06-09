import mongoose from "mongoose"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"
import Commerce from "../models/commerce.model.js"
import {
  sendExpoPushNotifications,
  toExpoMessages,
} from "../services/push/expoPush.service.js"

const shouldSendPushForUser = (presenceStore, userId) => {
  if (!presenceStore || !userId) return true
  const entry = presenceStore.get(userId)
  if (!entry) return true // offline
  return entry.state === "background"
}

const pushBodyForMessage = ({ messageType, content }) => {
  if (messageType === "text") return content
  return "Nuevo mensaje"
}

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { commerceId, content, messageType = "text" } = req.body
    const senderId = req.user.id

    // Validate coommerce existence
    const commerce = await Commerce.findById(commerceId)
    if (!commerce) {
      return res.status(404).json({
        message: "Commerce not found",
        status: false,
      })
    }

    // Create roomId beetween two users
    const roomId = `user_${senderId}_commerce_${commerceId}`

    const message = new Message({
      sender: senderId,
      commerce: commerceId,
      content,
      messageType,
      roomId,
    })

    await message.save()
    await message.populate([
      { path: "sender", select: "email name" },
      { path: "commerce", select: "name userId" },
    ])

    // Emit message to receiver using Socket.io
    const io = req.app.get("io")

    const receiverId = commerce.userId?.toString?.()

    const payload = {
      _id: message._id,
      sender: message.sender,
      commerce: message.commerce,
      content: message.content,
      messageType: message.messageType,
      isRead: message.isRead,
      roomId: message.roomId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,

    }

    if (receiverId) {
      io.to(receiverId).emit("receiveMessage", payload)

      const presenceStore = req.app.get("presence")
      const presenceEntry = presenceStore?.get?.(receiverId)
      const shouldPush =
        receiverId.toString() !== senderId.toString() &&
        shouldSendPushForUser(presenceStore, receiverId)

      if (shouldPush) {
        const receiverUser = await User.findById(receiverId)
          .select("expoPushTokens")
          .lean()

        const tokens = receiverUser?.expoPushTokens || []
        console.log("[push] sendMessage -> receiver", {
          receiverId,
          roomId,
          tokenCount: tokens.length,
          presence: presenceEntry
            ? {
                state: presenceEntry.state,
                sockets: presenceEntry.sockets?.size,
                updatedAt: presenceEntry.updatedAt,
              }
            : null,
        })
        const messages = toExpoMessages({
          tokens,
          title: message?.sender?.name || "Nuevo mensaje",
          body: pushBodyForMessage({ messageType, content }),
          data: {
            type: "message",
            roomId,
            commerceId,
            senderId,
          },
        })

        const tickets = await sendExpoPushNotifications(messages)
        if (Array.isArray(tickets)) {
          const ok = tickets.filter((t) => t?.status === "ok").length
          const err = tickets.filter((t) => t?.status === "error").length
          console.log("[push] tickets summary", { ok, err })
        }
      } else {
        console.log("[push] skipped sendMessage", {
          receiverId,
          roomId,
          reason: presenceEntry ? `presence:${presenceEntry.state}` : "offline?",
        })
      }
    }

    return res.status(201).json({
      message: "Message sent successfully",
      data: message,
      status: true,
    })
  } catch (err) {
    console.error("[-] Send message error: ", err)
    return res.status(500).json({
      message: "Internal server error",
      err: err.message,
      status: false,
    })
  }
}

export const getConversation = async (req, res) => {
  try {
    const { commerceId } = req.params
    const currentUserId = req.user.id

    const roomId = `user_${currentUserId}_commerce_${commerceId}`

    const messages = await Message.find({ roomId })
      .populate("sender", "email name")
      .populate("commerce", "name userId")
      .sort({ createdAt: 1 }) // Sort by creation date ascending
      .limit(50) // Limit to last 50 messages

    return res.json({
      messages: "Conversation fetched successfully",
      data: messages,
      status: true,
    })
  } catch (err) {
    console.error("[-] Get conversation error: ", err)
    return res.status(500).json({
      message: "Internal server error",
      err: err.message,
      status: false,
    })
  }
}

export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id

    const userObjectId = mongoose.Types.ObjectId.createFromHexString(userId)
    const roomIdRegex = new RegExp(`^user_${userId}_commerce_`)

    const messages = await Message.aggregate([
      {
        $match: {
          roomId: { $regex: roomIdRegex },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$commerce",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isRead", false] },
                    { $ne: ["$sender", userObjectId] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "commerces",
          localField: "lastMessage.commerce",
          foreignField: "_id",
          as: "commerceInfo",
        },
      },
      { $unwind: "$commerceInfo" },
    ])

    return res.json({
      message: "User chats fetched successfully",
      data: messages,
      status: true,
    })
  } catch (err) {
    console.error("[-] Get user chats error: ", err)
    return res.status(500).json({
      message: "Internal server error",
      err: err.message,
      status: false,
    })
  }
}

// Get chats for commerce owner (messages sent to their commerce)
export const getCommerceChats = async (req, res) => {
  try {
    const userId = req.user.id
    const userObjectId = mongoose.Types.ObjectId.createFromHexString(userId)

    // Encontrar el comercio del usuario
    const userCommerce = await Commerce.findOne({ userId })
    if (!userCommerce) {
      return res.status(404).json({
        message: "No tienes un comercio registrado",
        status: false,
      })
    }

    const messages = await Message.aggregate([
      {
        $match: {
          commerce: userCommerce._id,
          // sender: { $ne: userObjectId }, //Solo mostrar mensajes donde el sender no sea el dueño del comercio
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$roomId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isRead", false] },
                    { $ne: ["$sender", userObjectId] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          roomId: { $first: "$roomId" }, // Obtener el roomId para luego extraer el userId del cliente
        },
      },
      {
        $addFields: {
          chatUserIdStr: { $arrayElemAt: [{ $split: ["$roomId", "_"] }, 1] }, // Extraer el userId del cliente del roomId
        },
      },
      {
        $lookup: {
          from: "users",
          let: { chatUserIdStr: "$chatUserIdStr" }, // Usar $let para pasar el chatUserIdStr al pipeline de $lookup
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    { $toString: "$_id" }, // Convertir _id a string para comparar con chatUserIdStr
                    "$$chatUserIdStr",
                  ],
                },
              },
            },
          ],
          as: "senderInfo",
        },
      },
      { $unwind: "$senderInfo" },
      {
        $lookup: {
          from: "commerces",
          localField: "lastMessage.commerce",
          foreignField: "_id",
          as: "commerceInfo",
        },
      },
      { $unwind: "$commerceInfo" },
    ])

    return res.json({
      message: "Commerce chats fetched successfully",
      data: messages,
      status: true,
    })
  } catch (err) {
    console.error("[-] Get commerce chats error: ", err)
    return res.status(500).json({
      message: "Internal server error",
      err: err.message,
      status: false,
    })
  }
}

export const markAsRead = async (req, res) => {
  try {
    const { commerceId } = req.params
    const userId = req.user.id

    const roomId = `user_${userId}_commerce_${commerceId}`

    await Message.updateMany(
      {
        roomId,
        isRead: false,
      },
      { isRead: true }
    )

    return res.json({
      message: "Messages marked as read",
      status: true,
    })
  } catch (err) {
    console.error("[-] Mark as read error: ", err)
    return res.status(500).json({
      message: "Internal server error",
      err: err.message,
      status: false,
    })
  }
}

// Send a message as commerce owner to a specific user
export const sendCommerceMessage = async (req, res) => {
  try {
    const { commerceId, userId, content, messageType = "text" } = req.body
    const senderId = req.user.id

    const commerce = await Commerce.findById(commerceId)
    if (!commerce) {
      return res.status(404).json({
        message: "Commerce not found",
        status: false,
      })
    }

    if (commerce.userId.toString() !== senderId.toString()) {
      return res.status(403).json({
        message: "No autorizado para enviar mensajes de este comercio",
        status: false,
      })
    }

    const targetUser = await User.findById(userId)
    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      })
    }

    const roomId = `user_${userId}_commerce_${commerceId}`

    const message = new Message({
      sender: senderId,
      commerce: commerceId,
      content,
      messageType,
      roomId,
    })

    await message.save()
    await message.populate([
      { path: "sender", select: "email name" },
      { path: "commerce", select: "name userId" },
    ])

    const io = req.app.get("io")
    io.to(userId).emit("receiveMessage", {
      _id: message._id,
      sender: message.sender,
      commerce: message.commerce,
      content: message.content,
      messageType: message.messageType,
      isRead: message.isRead,
      roomId: message.roomId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    })

    const presenceStore = req.app.get("presence")
    const presenceEntry = presenceStore?.get?.(userId)
    const shouldPush =
      userId.toString() !== senderId.toString() &&
      shouldSendPushForUser(presenceStore, userId)

    if (shouldPush) {
      const receiverUser = await User.findById(userId)
        .select("expoPushTokens")
        .lean()

      const tokens = receiverUser?.expoPushTokens || []
      console.log("[push] sendCommerceMessage -> receiver", {
        userId,
        roomId,
        tokenCount: tokens.length,
        presence: presenceEntry
          ? {
              state: presenceEntry.state,
              sockets: presenceEntry.sockets?.size,
              updatedAt: presenceEntry.updatedAt,
            }
          : null,
      })
      const messages = toExpoMessages({
        tokens,
        title: commerce?.name || "Nuevo mensaje",
        body: pushBodyForMessage({ messageType, content }),
        data: {
          type: "message",
          roomId,
          commerceId,
          senderId,
        },
      })

      const tickets = await sendExpoPushNotifications(messages)
      if (Array.isArray(tickets)) {
        const ok = tickets.filter((t) => t?.status === "ok").length
        const err = tickets.filter((t) => t?.status === "error").length
        console.log("[push] tickets summary", { ok, err })
      }
    } else {
      console.log("[push] skipped sendCommerceMessage", {
        userId,
        roomId,
        reason: presenceEntry ? `presence:${presenceEntry.state}` : "offline?",
      })
    }

    return res.status(201).json({
      message: "Message sent successfully",
      data: message,
      status: true,
    })
  } catch (err) {
    console.error("[-] Send commerce message error: ", err)
    return res.status(500).json({
      message: "Internal server error",
      err: err.message,
      status: false,
    })
  }
}

export const getCommerceConversation = async (req, res) => {
  try {
    const { commerceId, userId } = req.params
    const currentUserId = req.user.id

    const commerce = await Commerce.findById(commerceId)
    if (!commerce) {
      return res.status(404).json({
        message: "Commerce not found",
        status: false,
      })
    }

    if (commerce.userId.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        message: "No autorizado para ver esta conversación",
        status: false,
      })
    }

    const roomId = `user_${userId}_commerce_${commerceId}`

    const messages = await Message.find({ roomId })
      .populate("sender", "email name")
      .populate("commerce", "name userId")
      .sort({ createdAt: 1 })
      .limit(50)

    return res.json({
      messages: "Conversation fetched successfully",
      data: messages,
      status: true,
    })
  } catch (err) {
    console.error("[-] Get commerce conversation error: ", err)
    return res.status(500).json({
      message: "Internal server error",
      err: err.message,
      status: false,
    })
  }
}

export const markCommerceAsRead = async (req, res) => {
  try {
    const { commerceId, userId } = req.params
    const currentUserId = req.user.id

    const commerce = await Commerce.findById(commerceId)
    if (!commerce) {
      return res.status(404).json({
        message: "Commerce not found",
        status: false,
      })
    }

    if (commerce.userId.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        message: "No autorizado",
        status: false,
      })
    }

    const roomId = `user_${userId}_commerce_${commerceId}`
    await Message.updateMany({ roomId, isRead: false }, { isRead: true })

    return res.json({
      message: "Messages marked as read",
      status: true,
    })
  } catch (err) {
    console.error("[-] Mark commerce as read error: ", err)
    return res.status(500).json({
      message: "Internal server error",
      err: err.message,
      status: false,
    })
  }
}
