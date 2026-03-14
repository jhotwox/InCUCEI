import { useCallback, useEffect, useState, useRef } from "react"
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
  const [mapNavigationData, setMapNavigationData] = useState(null)
  const { socket } = useSocket()
  const { user } = useAuth()
  const hasLoadedHistory = useRef(false)

  const loadChatHistory = useCallback(async () => {
    if (!user || hasLoadedHistory.current) return

    try {
      setLoadingChatHistory(true)

      const response = await loadHistory()

      // TODO: Send this in chatbotMessage.api.jsx
      const historyMessages = []
      response.data.data.forEach((msg) => {
        historyMessages.push({
          id: `${msg._id}_bot`,
          text: msg.response,
          isUser: false,
          // Asegura que el mensaje del bot sea posterior
          timestamp: new Date(new Date(msg.createdAt).getTime() + 1),
        })

        historyMessages.push({
          id: `${msg._id}_user`,
          text: msg.message,
          isUser: true,
          timestamp: new Date(msg.createdAt),
        })
      })

      setMessages(historyMessages)
      hasLoadedHistory.current = true
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
    setMessages((prev) => [userMessage, ...prev])
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
      setMessages((prev) => [errorMessage, ...prev])
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
      setMessages((prev) => [botMessage, ...prev])
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
      setMessages((prev) => [errorMessage, ...prev])
      setLoading(false)
      setIsTyping(false)
    }

    // Navegación al mapa
    const handleChatbotNavigateMap = (data) => {
      console.log("[+] Navigate to map:", data)
      setMapNavigationData(data)
    }

    socket.on("chatbotResponse", handleChatbotResponse)
    socket.on("chatbotTyping", handleChatbotTyping)
    socket.on("chatbotError", handleChatbotError)
    socket.on("chatbotNavigateMap", handleChatbotNavigateMap)

    return () => {
      socket.off("chatbotResponse", handleChatbotResponse)
      socket.off("chatbotTyping", handleChatbotTyping)
      socket.off("chatbotError", handleChatbotError)
      socket.off("chatbotNavigateMap", handleChatbotNavigateMap)
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

  const clearMapNavigation = useCallback(() => {
    setMapNavigationData(null)
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
    mapNavigationData,
    clearMapNavigation,
  }
}
