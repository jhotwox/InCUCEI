import { Router } from "express"
import { authRequired } from "../middlewares/validateToken.js"
import {
  sendChatbotMessage,
  getChatbotHistory,
  deleteChatbotHistory
} from "../controller/chatbot.controller.js"

const router = Router()

router.post("/chatbot/message", authRequired, sendChatbotMessage)

router.get("/chatbot/history", authRequired, getChatbotHistory)

router.delete("/chatbot/history", authRequired, deleteChatbotHistory)

export default router