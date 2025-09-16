import { createContext, useContext, useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import { useAuth } from "./Auth.context"
import { IP } from "../constants"

const SocketContext = createContext()

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])

  const { token, user } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (token && user) {
      // Conect to socket server
      const newSocket = io(`http://${IP}:3000`, {
        transports: ["websocket"],
        autoConnect: true,
      })

      newSocket.on("connect", () => {
        console.log("Socket connected: ", newSocket.id)
        setConnected(true)

        newSocket.emit("joinUser", user.id)
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
