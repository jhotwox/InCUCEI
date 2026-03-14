import { GeminiService } from "../services/gemini/index.js"
import ChatbotMessage from "../models/chatbotMessage.model.js"

const geminiService = new GeminiService()

export const sendChatbotMessage = async (req, res) => {
  const startTime = Date.now()

  try {
    const { message, type = "general" } = req.body
    const userId = req.user?.id

    console.log(`🤖 Processing chatbot message for user ${userId}`)

    const io = req.app.get("io")

    if (userId) {
      io.to(userId).emit("chatbotTyping", {
        isTyping: true,
        timestamp: new Date(),
      })
    }

    const conversationId = `user_${userId}_chatbot`

    const recentMessages = await ChatbotMessage.find({ conversationId, userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("message response createdAt")

    const text = await geminiService.generateResponse(
      message,
      userId,
      recentMessages.reverse()
    )
    console.log("Text: ", text)

    const responseTime = Date.now() - startTime

    // Verificar si la respuesta es una acción especial (navegación al mapa)
    let navigationAction = null
    let displayText = text

    try {
      const parsed = JSON.parse(text)
      if (parsed.action === "navigate_to_map" && parsed.success) {
        navigationAction = parsed
        // Usar el mensaje generado por Gemini si está disponible
        displayText = parsed.generatedMessage || parsed.message
      }
      console.log("Display text: ", displayText);
      console.log("navigation action: ", navigationAction);
    } catch (e) {
      console.log("[-] chatbot controller: ", e);
      // No es JSON, es texto normal
    }

    const chatBotMessage = new ChatbotMessage({
      userId,
      conversationId,
      message,
      response: displayText,
      messageType: type,
      metadata: {
        responseTime,
        geminiModel: geminiService.modelName,
        ...(navigationAction && { navigationAction })
      },
    })

    await chatBotMessage.save()

    if (userId) {
      // Si hay acción de navegación, enviar evento especial
      if (navigationAction) {
        io.to(userId).emit("chatbotNavigateMap", {
          placeId: navigationAction.placeId,
          placeName: navigationAction.placeName,
          placeType: navigationAction.placeType,
          coordinates: navigationAction.coordinates,
          timestamp: new Date(),
        })
      }

      io.to(userId).emit("chatbotResponse", {
        message: displayText,
        timestamp: new Date(),
        type,
        messageId: chatBotMessage._id,
      })
    }

    io.to(userId).emit("chatbotTyping", {
      isTyping: false,
      timestamp: new Date(),
    })

    return res.json({
      message: "Response generated and sended via socket",
      status: true,
    })
  } catch (err) {
    console.error("❌ chatbot controller error:", err)

    const io = req.app.get("io")
    if (req.user?.id) {
      io.to(req.user?.id).emit("chatbotError", {
        message: "Error procesando tu solicitud",
        timestamp: new Date(),
      })
    }

    io.to(req.user.id).emit("chatbotTyping", {
      isTyping: false,
      timestamp: new Date(),
    })

    return res.status(500).json({
      message: "Error processing chatbot request",
      status: false,
    })
  }
}

export const getChatbotHistory = async (req, res) => {
  try {
    const userId = req.user?.id
    const { limit = 50, page = 1 } = req.query

    const conversationId = `user_${userId}_chatbot`

    const messages = await ChatbotMessage.find({ conversationId, userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select("message response messageType createdAt metadata")

    const totalMessages = await ChatbotMessage.countDocuments({
      conversationId,
      userId,
    })

    console.log("returning messages...")
    return res.json({
      message: "Chatbot history retrieved",
      data: messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / parseInt(limit)),
        totalMessages,
        hasNextPage: parseInt(page) * parseInt(limit) < totalMessages,
        hasPrevPage: parseInt(page) > 1,
      },
      status: true,
    })
  } catch (err) {
    console.log("getchatbothistory Error: ", err)
    console.error("Error in getChatbotHistory: ", err)
    return res.status(500).json({
      message: "Error retrieving chatbot history",
      status: false,
    })
  }
}

export const deleteChatbotHistory = async (req, res) => {
  try {
    const userId = req.user?.id
    const conversationId = `user_${userId}_chatbot`

    const result = await ChatbotMessage.deleteMany({ conversationId, userId })

    return res.json({
      message: "Chatbot history deleted",
      deletedCount: result.deletedCount,
      status: true,
    })
  } catch (err) {
    console.error("Error in deleteChatbotHistory: ", err)
    return res.status(500).json({
      message: "Error deleting chatbot history",
      status: false,
    })
  }
}
