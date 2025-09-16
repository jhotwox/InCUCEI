import mongoose from "mongoose"

const chatbotMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: String,
      required: true,
      // Formato: user_{userId}_chatbot
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["general", "text", "image", "file"],
      default: "general",
    },
    isRead: {
      type: Boolean,
      default: true, // Los mensajes del chatbot se consideran leídos automáticamente
    },
    metadata: {
      // Información adicional como tokens usados, tiempo de respuesta, etc.
      tokensUsed: Number,
      responseTime: Number,
      geminiModel: String,
    }
  },
  {
    timestamps: true,
  }
)

// Índices para optimizar consultas
chatbotMessageSchema.index({ userId: 1, createdAt: -1 })
chatbotMessageSchema.index({ conversationId: 1, createdAt: -1 })

export default mongoose.model("ChatbotMessage", chatbotMessageSchema)