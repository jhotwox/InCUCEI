import { useState, useEffect, useCallback } from "react"
import {
  sendMessageRequest,
  sendCommerceMessageRequest,
  getConversationRequest,
  getCommerceConversationRequest,
  getUserChatsRequest,
  getCommerceChatsRequest,
  markAsReadRequest,
  markCommerceAsReadRequest,
} from "../api/messages.api.js"
import { useSocket } from "../contexts/Socket.context.jsx"
import { useAuth } from "../contexts/Auth.context.jsx"

export const useMessages = () => {
  const [messages, setMessages] = useState([])
  const [chats, setChats] = useState([])
  const [commerceChats, setCommerceChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { socket } = useSocket()
  const { user } = useAuth()

  // const getRoomId = useCallback((userId1, userId2) => {
  //   return [userId1, userId2].sort().join("_")
  // }, [])

  const loadConversation = useCallback(async (commerceId) => {
    if (!commerceId) return

    try {
      setLoading(true)
      setError(null)

      const response = await getConversationRequest(commerceId)
      setMessages(response.data.data || [])
    } catch (err) {
      setError(err)
      console.error("Err loadConversation: ", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCommerceConversation = useCallback(async (commerceId, userId) => {
    if (!commerceId || !userId) return

    try {
      setLoading(true)
      setError(null)

      const response = await getCommerceConversationRequest(commerceId, userId)
      setMessages(response.data.data || [])
    } catch (err) {
      setError(err)
      console.error("Err loadCommerceConversation: ", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const sendMessage = useCallback(
    async (commerceId, content, messageType = "text") => {
      try {
        setError(null)

        const response = await sendMessageRequest(
          commerceId,
          content,
          messageType
        )
        const newMessage = response.data.data

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

  const sendCommerceMessage = useCallback(
    async (commerceId, userId, content, messageType = "text") => {
      try {
        setError(null)

        const response = await sendCommerceMessageRequest(
          commerceId,
          userId,
          content,
          messageType
        )
        const newMessage = response.data.data

        setMessages((prev) => [...prev, newMessage])

        return newMessage
      } catch (err) {
        setError(err)
        console.error("Err sendCommerceMessage: ", err)
        throw err
      }
    },
    []
  )

  const markAsRead = useCallback(
    async (commerceId) => {
      try {
        await markAsReadRequest(commerceId)

        setMessages((prev) =>
          prev.map((msg) => {
            const msgCommerceId =
              typeof msg?.commerce === "string" ? msg.commerce : msg?.commerce?._id

            if (msgCommerceId !== commerceId) return msg

            return { ...msg, isRead: true }
          })
        )
      } catch (err) {
        console.error("Err markAsRead: ", err)
      }
    },
    [user]
  )

  const markCommerceAsRead = useCallback(async (commerceId, userId) => {
    try {
      await markCommerceAsReadRequest(commerceId, userId)

      setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })))
    } catch (err) {
      console.error("Err markCommerceAsRead: ", err)
    }
  }, [])

  const loadChats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getUserChatsRequest()
      setChats(response.data.data || [])
    } catch (err) {
      setError(err)
      console.error("Err loadChats: ", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCommerceChats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getCommerceChatsRequest()
      setCommerceChats(response.data.data || [])
      console.log("[+] commerceChats: ", response.data.data)
    } catch (err) {
      setError(err)
      console.error("Err loadCommerceChats: ", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleReceiveMessage = (message) => {
      console.log("Received message: ", message)
      setMessages((prev) => {
        const incomingId = message?._id != null ? String(message._id) : null
        const exists = prev.find((msg) => {
          const msgId = msg?._id != null ? String(msg._id) : null
          if (incomingId && msgId) return msgId === incomingId

          // Fallback de-duplication if _id isn't comparable
          return (
            msg?.roomId &&
            message?.roomId &&
            msg.roomId === message.roomId &&
            msg?.content === message?.content &&
            String(msg?.createdAt) === String(message?.createdAt)
          )
        })
        if (exists) return prev
        return [...prev, message]
      })
    }

    socket.on("receiveMessage", handleReceiveMessage)

    return () => {
      socket.off("receiveMessage", handleReceiveMessage)
    }
  }, [socket])

  // useEffect(() => {
  //   if (chatUserId) {
  //     loadConversation(chatUserId)
  //   }
  // }, [chatUserId, loadConversation])

  return {
    messages,
    chats,
    commerceChats,
    loading,
    error,
    sendMessage,
    sendCommerceMessage,
    loadConversation,
    loadCommerceConversation,
    loadChats,
    loadCommerceChats,
    markAsRead,
    markCommerceAsRead,
  }
}
