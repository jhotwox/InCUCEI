import { createContext, useContext, useEffect, useRef, useState } from "react"
import { AppState } from "react-native"
import { io } from "socket.io-client"
import { useAuth } from "./Auth.context"
import { usePushNotifications } from "../hooks/usePushNotifications"



const SocketContext = createContext()

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])

  const { token, user } = useAuth()
  const socketRef = useRef(null)

  usePushNotifications({ enabled: Boolean(token && user), userId: user?.id })

  useEffect(() => {
    if (token && user) {
      // Conect to socket server
      const socketUrl = `${process.env.EXPO_PUBLIC_SERVER_IP}`
      const newSocket = io(socketUrl, {
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
      })

      newSocket.on("connect", () => {
        console.log("Socket connected: ", newSocket.id)
        setConnected(true)

        newSocket.emit("joinUser", String(user.id))
      })

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected")
        setConnected(false)
      })

      newSocket.on("connectError", (err) => {
        console.log("Socket connect error: ", err)
        setConnected(false)
      })

      socketRef.current = newSocket
      setSocket(newSocket)

      return () => {
        newSocket.close()
        setConnected(false)
        setSocket(null)
        console.log("Socket disconnected on cleanup")
      }
    } else {
      if (socketRef.current) {
        socketRef.current.close()
        setConnected(false)
        setSocket(null)
        console.log("Socket disconnected due to no token or user")
      }
    }
  }, [token, user])

  useEffect(() => {
    if (!socket || !connected || !user?.id) return

    const sendState = (nextState) => {
      const state = nextState === "active" ? "active" : "background"
      socket.emit("appState", { state })
    }

    // Send initial state
    sendState(AppState.currentState)

    const subscription = AppState.addEventListener("change", sendState)
    return () => {
      subscription?.remove?.()
    }
  }, [socket, connected, user?.id])

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit("joinRoom", roomId)
      console.log(`Joined room: ${roomId}`)
    }
  }

  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit("leaveRoom", roomId)
      console.log(`Left room: ${roomId}`)
    }
  }

  const sendMessage = (roomId, message) => {
    if (socket) {
      socket.emit("sendMessage", { roomId, message })
      console.log(`Message sent to room ${roomId}: `, message)
    }
  }

  const value = {
    socket,
    connected,
    onlineUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
  }

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}
