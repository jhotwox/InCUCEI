import { useState, useEffect, useCallback, useRef } from "react"
import {
  getOrCreatePrivateChatRequest,
  getPrivateChatsRequest,
  getPrivateConversationMessagesRequest,
  sendPrivateMessageRequest,
  markPrivateChatAsReadRequest,
} from "../api/messages.api"
import { useSocket } from "../contexts/Socket.context.jsx"
import { useAuth } from "../contexts/Auth.context.jsx"

export const usePrivateChat = () => {
  const [messages, setMessages] = useState([])
  const [privateChats, setPrivateChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentConversation, setCurrentConversation] = useState(null)

  const { socket } = useSocket()
  const { user } = useAuth()

  // Obtener o crear conversación privada con otro usuario
  const getOrCreatePrivateChat = useCallback(async (otherUserId) => {
    if (!otherUserId) return

    try {
      setLoading(true)
      setError(null)

      const response = await getOrCreatePrivateChatRequest(otherUserId)
      
      if (response.data?.data?.conversation) {
        setCurrentConversation(response.data.data.conversation)
        return response.data.data.conversation
      }
    } catch (err) {
      setError(err)
      console.error("Err getOrCreatePrivateChat: ", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar mensajes de una conversación privada
  const loadPrivateConversationMessages = useCallback(async (conversationId) => {
    if (!conversationId) return

    try {
      setLoading(true)
      setError(null)

      const response = await getPrivateConversationMessagesRequest(conversationId)
      setMessages(response.data?.data || [])
    } catch (err) {
      setError(err)
      console.error("Err loadPrivateConversationMessages: ", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Enviar mensaje privado
  const sendPrivateMessage = useCallback(
    async (conversationId, content, messageType = "text") => {
      if (!conversationId) return

      try {
        setError(null)

        const response = await sendPrivateMessageRequest(conversationId, content, messageType)
        const newMessage = response.data?.data

        if (newMessage) {
          setMessages((prev) => [...prev, newMessage])
        }

        return newMessage
      } catch (err) {
        setError(err)
        console.error("Err sendPrivateMessage: ", err)
        throw err
      }
    },
    []
  )

  // Cargar conversaciones privadas
  const loadPrivateChats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getPrivateChatsRequest()
      const data = response?.data?.data || []
      setPrivateChats(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err)
      console.error("Err loadPrivateChats: ", err)
      setPrivateChats([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Marcar conversación como leída
  const markAsRead = useCallback(async (conversationId) => {
    if (!conversationId) return

    try {
      await markPrivateChatAsReadRequest(conversationId)
    } catch (err) {
      console.error("Err markAsRead: ", err)
    }
  }, [])

  // Escuchar mensajes privados por Socket.IO
  useEffect(() => {
    if (!socket) return

    const handleReceivePrivateMessage = (message) => {
      console.log("Received private message: ", message)
      setMessages((prev) => {
        const exists = prev.find((msg) => msg._id === message._id)
        if (exists) return prev
        return [...prev, message]
      })
    }

    socket.on("receivePrivateMessage", handleReceivePrivateMessage)

    return () => {
      socket.off("receivePrivateMessage", handleReceivePrivateMessage)
    }
  }, [socket])

  return {
    messages,
    privateChats,
    loading,
    error,
    currentConversation,
    getOrCreatePrivateChat,
    loadPrivateConversationMessages,
    sendPrivateMessage,
    loadPrivateChats,
    markAsRead,
  }
}
