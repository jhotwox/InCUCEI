import express from "express"
import morgan from "morgan"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"
import http from "http"
import { Server } from "socket.io"

import userRoutes from "./routes/auth.routes.js"
import fileRoutes from "./routes/file.routes.js"
import messageRoutes from "./routes/message.routes.js"
import commerceRoutes from "./routes/commerce.routes.js"
import chatbotRoutes from "./routes/chatbot.routes.js"
import { GeminiService } from "./services/gemini/index.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Socket.io setup
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Middlewares
app.use(cors({ origin: true, credentials: true }))
app.use(morgan("dev"))
app.use(express.json())
// app.use(express.json({ limit: "10mb" }))
// app.use(express.urlencoded({ limit: "10mb", extended: true }))
app.use(cookieParser())

app.set("io", io)

// Routes
app.use("/files", express.static(path.join(__dirname, "files")))

app.use("/api", userRoutes)
app.use("/api/file/", fileRoutes)
app.use("/api", messageRoutes)
app.use("/api", commerceRoutes)
app.use("/api", chatbotRoutes)

io.on("connection", (socket) => {
  // #region Chatbot Messages
  socket.on("chatbotMessage", async (data) => {
    console.log(`🤖 Chatbot message from ${socket.id}`)

    // Emitir evento interno para que el controlador lo procese
    // O simplemente enviar confirmación de recibido
    socket.emit("chatbotMessageReceived", {
      status: "received",
      timestamp: new Date(),
    })
  })

  // #region Commerce messsages
  console.log("a user connected:", socket.id)

  // User
  socket.on("joinUser", (userId) => {
    socket.join(userId)
    console.log(`🏠 User ${userId} joined personal room`)
  })

  // Room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId)
    console.log(`💬 User joined chat room: ${roomId}`)
  })

  // sendMessage
  socket.on("sendMessage", (data) => {
    const { roomId, message } = data
    socket.to(roomId).emit("receiveMessage", message)
    console.log(`📨 Message sent to room: ${roomId}`)
  })

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId)
    console.log(`👋 User left room: ${roomId}`)
  })

  socket.on("markAsRead", (data) => {
    const { roomId, messageIds } = data
    socket.to(roomId).emit("messagesRead", { roomId, messageIds })
    console.log(`✅ Messages in room ${roomId} marked as read`)
  })

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id)
  })
})

export { server, io }
export default app
