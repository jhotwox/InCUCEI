import { GeminiService } from "../services/gemini/index.js"
import { RasaService } from "../services/rasa.service.js"
import ChatbotMessage from "../models/chatbotMessage.model.js"
import User from "../models/user.model.js"

const geminiService = new GeminiService()
const rasaService = new RasaService()

export const sendChatbotMessage = async (req, res) => {
  const startTime = Date.now()

  // botType can be "gemini" or "rasa", default to "gemini" for backward compatibility
  try {
    const { message, type = "general", botType = "gemini" } = req.body
    const userId = req.user?.id

    console.log(`🤖 Processing chatbot message for user ${userId} using ${botType}`)

    const io = req.app.get("io")

    if (userId) {
      io.to(userId).emit("chatbotTyping", {
        isTyping: true,
        timestamp: new Date(),
      })
    }

    const conversationId = `user_${userId}_chatbot`
    let displayText = ""
    let navigationAction = null
    let metadata = {}

    if (botType === "rasa") {
      // --- Rasa Logic ---
      const user = await User.findById(userId)
      const firstName = user?.name ? user.name.split(" ")[0] : "Estudiante"
      
      const slots = {
        user_name: user?.name || "Usuario",
        first_name: firstName,
        career_code: user?.career || null,
      }

      const rasaResponses = await rasaService.sendMessage(message, userId, slots)
      console.log(`[DEBUG] Rasa responses for user ${userId}:`, JSON.stringify(rasaResponses, null, 2))
      
      // Rasa can return multiple messages. We join them but deduplicate if they are too similar.
      if (rasaResponses && rasaResponses.length > 0) {
        const uniqueTexts = []
        for (const r of rasaResponses) {
          if (!r.text) continue
          
          const trimmed = r.text.trim()
          // Basic deduplication
          if (uniqueTexts.length > 0) {
            const last = uniqueTexts[uniqueTexts.length - 1]
            if (trimmed === last || (trimmed.length > 5 && last.includes(trimmed))) {
              console.log(`[DEBUG] Skipping duplicate Rasa response: "${trimmed}"`)
              continue
            }
          }
          uniqueTexts.push(trimmed)
        }
        displayText = uniqueTexts.join("\n\n")
        console.log(`[DEBUG] Joined Rasa responses: "${displayText}"`)
        
        // Check for custom actions/metadata in the first response that has it
        for (const r of rasaResponses) {
          const m = r.metadata || r.custom || {}
          if (m.action === "navigate_to_map") {
            navigationAction = m
          }
          if (Object.keys(m).length > 0) {
            metadata = { ...metadata, ...m }
          }
        }
        
        // console.log(`[DEBUG] Rasa metadata: "${rasaResponses.map(r => r.metadata).filter(m => m)}"`)
        // console.log(`[DEBUG] Rasa custom: "${rasaResponses.map(r => r.custom).filter(m => m)}"`)
      } else {
        displayText = "No recibí respuesta de Rasa."
      }

      // Sync career back to user model if it was detected by Rasa
      const slots_from_rasa = await rasaService.getSlots(`user_${userId}`)
      // console.log(`[DEBUG] Rasa slots for user ${userId}:`, JSON.stringify(slots_from_rasa))
      
      if (slots_from_rasa && slots_from_rasa.career_code) {
        const detectedCareer = slots_from_rasa.career_code.toUpperCase()
        if (!user.career || user.career !== detectedCareer) {
          console.log(`[DEBUG] Updating user career to: ${detectedCareer}`)
          user.career = detectedCareer
          await user.save()
        }
      }
    } else {
      // --- Gemini Logic (Existing) ---
      const recentMessages = await ChatbotMessage.find({ conversationId, userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("message response createdAt")

      const user = await User.findById(userId)
      const { text, inferredCareer } = await geminiService.generateResponse(
        message,
        userId,
        recentMessages.reverse()
      )
      console.log("Text: ", text)
      displayText = text

      // Sync career back to user model if it was detected/inferred by Gemini
      if (inferredCareer && (!user.career || user.career !== inferredCareer)) {
        user.career = inferredCareer
        await user.save()
      }

      try {
        const parsed = JSON.parse(text)
        if (parsed.action === "navigate_to_map" && parsed.success) {
          navigationAction = parsed
          displayText = parsed.generatedMessage || parsed.message
        }
      } catch (e) {
        // No es JSON, es texto normal
      }
      
      metadata = {
        geminiModel: geminiService.modelName,
        ...(navigationAction && { navigationAction })
      }
    }

    const responseTime = Date.now() - startTime

    const chatBotMessage = new ChatbotMessage({
      userId,
      conversationId,
      message,
      response: displayText,
      messageType: type,
      metadata: {
        responseTime,
        botType,
        ...metadata
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
        botType,
      })
    }

    io.to(userId).emit("chatbotTyping", {
      isTyping: false,
      timestamp: new Date(),
    })

    return res.json({
      message: "Response generated and sended via socket",
      status: true,
      botType,
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

    if (req.user?.id) {
      io.to(req.user.id).emit("chatbotTyping", {
        isTyping: false,
        timestamp: new Date(),
      })
    }

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
