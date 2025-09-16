import mongoose from "mongoose"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"
import Commerce from "../models/commerce.model.js"

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

    io.to(senderId).emit("receiveMessage", {
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

    const messages = await Message.aggregate([
      {
        $match: {
          sender: mongoose.Types.ObjectId.createFromHexString(userId),
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$commerce",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [{ $eq: ["$isRead", false] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "commerces",
          localField: "_id",
          foreignField: "_id",
          as: "commerceInfo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.sender",
          foreignField: "_id",
          as: "senderInfo",
        },
      },
      { $unwind: "$commerceInfo" },
      { $unwind: "$senderInfo" },
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
          // sender: { $ne: mongoose.Types.ObjectId.createFromHexString(userId) }, // Excluir mensajes propios
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$sender",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [{ $eq: ["$isRead", false] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "senderInfo",
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
      {
        $unwind: "$senderInfo",
      },
      {
        $unwind: "$commerceInfo",
      },
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
