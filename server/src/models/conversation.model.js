import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    // Tipo de conversación: 'user-commerce' o 'user-user'
    type: {
      type: String,
      enum: ['user-commerce', 'user-user'],
      required: true,
    },
    // Participante 1 (siempre es un usuario)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Para chats usuario-comercio
    commerce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commerce',
      default: null,
    },
    // Último mensaje
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    // Contador de mensajes sin leer por usuario
    unreadCounts: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    // Room ID para Socket.IO
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
)

// Índices
conversationSchema.index({ type: 1, participants: 1 })
conversationSchema.index({ commerce: 1 })
conversationSchema.index({ roomId: 1 })

export default mongoose.model('Conversation', conversationSchema)
