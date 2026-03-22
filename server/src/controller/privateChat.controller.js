import mongoose from "mongoose"
import Message from "../models/message.model.js"
import Conversation from "../models/conversation.model.js"
import User from "../models/user.model.js"

/**
 * Obtener o crear una conversación privada usuario-usuario
 */
export const getOrCreatePrivateConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const { otherUserId } = req.params

    if (currentUserId === otherUserId) {
      return res.status(400).json({
        message: "No puedes chatear contigo mismo",
        status: false,
      })
    }

    // Verificar que el otro usuario existe
    const otherUser = await User.findById(otherUserId)
    if (!otherUser) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        status: false,
      })
    }

    // Generar un roomId consistente (ordenar IDs para que sea el mismo independientemente del orden)
    const userIds = [currentUserId, otherUserId].sort()
    const roomId = `user_${userIds[0]}_user_${userIds[1]}`

    // Buscar o crear conversación
    let conversation = await Conversation.findOne({ roomId })

    if (!conversation) {
      conversation = new Conversation({
        type: "user-user",
        participants: [currentUserId, otherUserId],
        roomId,
      })
      await conversation.save()
    }

    return res.json({
      message: "Conversación obtenida",
      data: {
        conversation: {
          _id: conversation._id,
          roomId: conversation.roomId,
          type: conversation.type,
          participants: conversation.participants,
          otherUser: {
            _id: otherUser._id,
            name: otherUser.name,
            email: otherUser.email,
            profileUrl: otherUser.profileUrl,
          },
        },
      },
      status: true,
    })
  } catch (err) {
    console.error("[-] Get/Create private conversation error:", err)
    return res.status(500).json({
      message: "Error en el servidor",
      status: false,
    })
  }
}

/**
 * Obtener conversaciones privadas del usuario
 */
export const getPrivateConversations = async (req, res) => {
  try {
    const userId = req.user.id

    const conversations = await Conversation.find({
      type: "user-user",
      participants: userId,
    })
      .populate({
        path: "participants",
        match: { _id: { $ne: userId } },
        select: "name email profileUrl",
      })
      .populate("lastMessage")
      .sort({ updatedAt: -1 })

    const formattedConversations = conversations.map((conv) => ({
      _id: conv._id,
      roomId: conv.roomId,
      type: conv.type,
      otherUser: conv.participants[0], // Solo el otro usuario
      lastMessage: conv.lastMessage,
      unreadCount: conv.unreadCounts?.get(userId) || 0,
    }))

    return res.json({
      message: "Conversaciones privadas obtenidas",
      data: formattedConversations,
      status: true,
    })
  } catch (err) {
    console.error("[-] Get private conversations error:", err)
    return res.status(500).json({
      message: "Error en el servidor",
      status: false,
    })
  }
}

/**
 * Obtener mensajes de una conversación privada
 */
export const getPrivateConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const currentUserId = req.user.id

    // Verificar que la conversación existe y el usuario es participante
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({
        message: "Conversación no encontrada",
        status: false,
      })
    }

    if (!conversation.participants.includes(mongoose.Types.ObjectId.createFromHexString(currentUserId))) {
      return res.status(403).json({
        message: "No tienes permiso para acceder a esta conversación",
        status: false,
      })
    }

    // Obtener mensajes
    const messages = await Message.find({
      conversationId: conversationId,
    })
      .populate("sender", "email name profileUrl")
      .sort({ createdAt: 1 })
      .limit(50)

    return res.json({
      message: "Mensajes obtenidos",
      data: messages,
      status: true,
    })
  } catch (err) {
    console.error("[-] Get private conversation messages error:", err)
    return res.status(500).json({
      message: "Error en el servidor",
      status: false,
    })
  }
}

/**
 * Enviar mensaje en conversación privada
 */
export const sendPrivateMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType = "text" } = req.body
    const senderId = req.user.id

    // Verificar que la conversación existe
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({
        message: "Conversación no encontrada",
        status: false,
      })
    }

    if (!conversation.participants.includes(mongoose.Types.ObjectId.createFromHexString(senderId))) {
      return res.status(403).json({
        message: "No tienes permiso para enviar mensajes en esta conversación",
        status: false,
      })
    }

    // Crear mensaje
    const message = new Message({
      sender: senderId,
      conversationId: conversationId,
      content,
      messageType,
      roomId: conversation.roomId,
    })

    await message.save()
    await message.populate("sender", "email name profileUrl")

    // Actualizar último mensaje de la conversación
    conversation.lastMessage = message._id
    await conversation.save()

    // Resetear contador de no leídos para el remitente
    conversation.unreadCounts.set(senderId, 0)
    await conversation.save()

    // Emitir por Socket.IO
    const io = req.app.get("io")
    io.to(conversation.roomId).emit("receivePrivateMessage", {
      _id: message._id,
      conversationId: message.conversationId,
      sender: message.sender,
      content: message.content,
      messageType: message.messageType,
      isRead: message.isRead,
      createdAt: message.createdAt,
    })

    return res.status(201).json({
      message: "Mensaje enviado",
      data: message,
      status: true,
    })
  } catch (err) {
    console.error("[-] Send private message error:", err)
    return res.status(500).json({
      message: "Error en el servidor",
      status: false,
    })
  }
}

/**
 * Marcar conversación como leída
 */
export const markPrivateConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params
    const currentUserId = req.user.id

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({
        message: "Conversación no encontrada",
        status: false,
      })
    }

    // Marcar todos los mensajes del usuario como leídos
    await Message.updateMany(
      {
        conversationId: conversationId,
        sender: { $ne: currentUserId },
        isRead: false,
      },
      { isRead: true }
    )

    // Resetear contador
    conversation.unreadCounts.set(currentUserId, 0)
    await conversation.save()

    return res.json({
      message: "Conversación marcada como leída",
      status: true,
    })
  } catch (err) {
    console.error("[-] Mark as read error:", err)
    return res.status(500).json({
      message: "Error en el servidor",
      status: false,
    })
  }
}
