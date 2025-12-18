import { useCallback, useEffect, useState } from "react"
import { useSocket } from "../contexts/Socket.context.jsx"
import { useAuth } from "../contexts/Auth.context"
import axios from "../api/axios"
import {
  loadHistory,
  deleteHistory,
  sendMessage as sendMessageRequest,
} from "../api/chatbotMessage.api.js"

export default () => {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingChatHistory, setLoadingChatHistory] = useState(false)
  const { socket } = useSocket()
  const { user } = useAuth()

  const loadChatHistory = useCallback(async () => {
    if (!user) return

    try {
      setLoadingChatHistory(true)

      const response = await loadHistory()

      // TODO: Send this in chatbotMessage.api.jsx
      const historyMessages = []
      response.data.data.forEach((msg) => {
        historyMessages.push({
          id: `${msg._id}_user`,
          text: msg.message,
          isUser: true,
          timestamp: new Date(msg.createdAt),
        })

        historyMessages.push({
          id: `${msg._id}_bot`,
          text: msg.response,
          isUser: false,
          timestamp: new Date(new Date(msg.createdAt).getTime() + 1), // Asegura que el mensaje del bot sea posterior
        })
      })

      historyMessages.sort((a, b) => a.timestamp - b.timestamp)

      console.log(
        "[+] Loaded chat history:",
        historyMessages.length,
        "messages"
      )
      setMessages(historyMessages)
    } catch (err) {
      console.error("Error loading chat history:", err)
    } finally {
      setLoadingChatHistory(false)
    }
  }, [user])

  useEffect(() => {
    loadChatHistory()
  }, [loadChatHistory])

  const sendMessage = useCallback(async (message, type = "general") => {
    if (!message.trim()) return

    // Agregar mensaje del usuario inmediatamente
    const tempId = `${Date.now()}_${Math.random()}`
    const userMessage = {
      id: tempId,
      text: message.trim(),
      isUser: true,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      // TODO: Do this petition in chatbotMessage.api.jsx

      // Send message via HTTP - the response will arrive via Socket.IO
      await axios.post("/chatbot/message", { message, type })
    } catch (error) {
      console.error("Error sending chatbot message:", error)
      setLoading(false)

      // Agregar mensaje de error
      const errorId = `${Date.now()}_${Math.random()}`
      const errorMessage = {
        id: errorId,
        text: "Error al enviar mensaje. Intenta de nuevo",
        isUser: false,
        isError: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }, [])

  // Escuchar eventos del chatbot
  useEffect(() => {
    if (!socket || !user) return

    // Respuesta del chatbot
    const handleChatbotResponse = (data) => {
      const botMessage = {
        id: data.messageId || `${Date.now()}_bot`,
        text: data.message,
        isUser: false,
        timestamp: new Date(data.timestamp),
      }
      setMessages((prev) => [...prev, botMessage])
      setLoading(false)
      setIsTyping(false)
    }

    // Indicator de "escribiendo..."
    const handleChatbotTyping = (data) => {
      setIsTyping(data.isTyping)
      if (!data.isTyping) setLoading(false)
    }

    // Error del chatbot
    const handleChatbotError = (data) => {
      const errorMessage = {
        id: `${Date.now()}_error`,
        text: data.message,
        isUser: false,
        isError: true,
        timestamp: new Date(data.timestamp),
      }
      setMessages((prev) => [...prev, errorMessage])
      setLoading(false)
      setIsTyping(false)
    }

    socket.on("chatbotResponse", handleChatbotResponse)
    socket.on("chatbotTyping", handleChatbotTyping)
    socket.on("chatbotError", handleChatbotError)

    return () => {
      socket.off("chatbotResponse", handleChatbotResponse)
      socket.off("chatbotTyping", handleChatbotTyping)
      socket.off("chatbotError", handleChatbotError)
    }
  }, [socket, user])

  const deleteHistory = useCallback(async () => {
    await deleteHistory().catch(console.error)
    setMessages([])
    setIsTyping(false)
    setLoading(false)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setIsTyping(false)
    setLoading(false)
  }, [])

  return {
    messages,
    sendMessage,
    loading,
    isTyping,
    loadingChatHistory,
    loadChatHistory,
    deleteHistory,
    clearMessages,
  }
}
