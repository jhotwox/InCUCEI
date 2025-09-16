import { useState, useEffect, useCallback } from "react"
import {
  sendMessageRequest,
  getConversationRequest,
  getUserChatsRequest,
  markAsReadRequest,
} from "../api/messages.api.jsx"
import { useSocket } from "../contexts/Socket.context.jsx"
import { useAuth } from "../contexts/Auth.context.jsx"

export const useMessages = (chatUserId = null) => {
  const [messages, setMessages] = useState([])
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { socket } = useSocket()
  const { user } = useAuth()

  const getRoomId = useCallback((userId1, userId2) => {
    return [userId1, userId2].sort().join("_")
  }, [])

  const loadConversation = useCallback(async (userId) => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const response = await getConversationRequest(userId)
      setMessages(response.data.messages || [])
    } catch (err) {
      setError(err)
      console.error("Err loadConversation: ", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadChats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getUserChatsRequest()
      setChats(response.data.chats || [])
    } catch (err) {
      setError(err)
      console.error("Err loadChats: ", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const sendMessage = useCallback(
    async (receiverId, content, messageType = "text") => {
      try {
        setError(null)

        const response = await sendMessageRequest(
          receiverId,
          content,
          messageType
        )
        const newMessage = response.data.message

        setMessages((prev) => [...prev, newMessage])
        return newMessage
      } catch (err) {
        setError(err)
        console.error("Err sendMessage: ", err)
        throw err
      }
    },
    []
  )

  const markAsRead = useCallback(
    async (roomId) => {
      try {
        await markAsReadRequest(roomId)

        setMessages((prev) =>
          prev.map((msg) =>
            msg.roomId === roomId && msg.receiver === user.id
              ? { ...msg, read: true }
              : msg
          )
        )
      } catch (err) {
        console.error("Err markAsRead: ", err)
      }
    },
    [user]
  )

  useEffect(() => {
    if (!socket) return

    const handleReceiveMessage = (message) => {
      console.log("Received message: ", message)
      setMessages((prev) => {
        const exists = prev.find((msg) => msg._id === message._id)
        if (exists) return prev
        return [...prev, message]
      })
    }

    socket.on("receiveMessage", handleReceiveMessage)

    return () => {
      socket.off("receiveMessage", handleReceiveMessage)
    }
  }, [socket])

  useEffect(() => {
    if (chatUserId) {
      loadConversation(chatUserId)
    }
  }, [chatUserId, loadConversation])

  return {
    messages,
    chats,
    loading,
    error,
    sendMessage,
    loadConversation,
    loadChats,
    markAsRead,
    getRoomId,
  }
}
