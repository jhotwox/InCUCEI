import mongoose from "mongoose"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType = "text" } = req.body
    const senderId = req.user.id

    // Create roomId beetween two users
    const roomId = [senderId, receiverId].sort().join("_")

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      messageType,
      roomId,
    })

    await message.save()
    await message.populate(["sender", "receiver"], "email")

    // Emit message to receiver using Socket.io
    const io = req.app.get("io")
    io.to(roomId).emit("receiveMessage", {
      _id: message._id,
      sender: message.sender,
      receiver: message.receiver,
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
    const { userId } = req.params
    const currentUserId = req.user.id

    const roomId = [currentUserId, userId].sort().join("_")

    const messages = await Message.find({ roomId })
      .populate("sender", "email")
      .populate("receiver", "email")
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
          $or: [
            { sender: mongoose.Types.ObjectId.createFromHexString(userId) },
            { receiver: mongoose.Types.ObjectId.createFromHexString(userId) },
          ],
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
                    { $eq: ["$receiver", mongoose.Types.ObjectId.createFromHexString(userId)] },
                    { $eq: ["$isRead", false] },
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
          from: "users",
          localField: "lastMessage.sender",
          foreignField: "_id",
          as: "senderInfo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.receiver",
          foreignField: "_id",
          as: "receiverInfo",
        },
      },
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

export const markAsRead = async (req, res) => {
  try {
    const { roomId } = req.params
    const userId = req.user.id

    await Message.updateMany(
      {
        roomId,
        receiver: userId,
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
