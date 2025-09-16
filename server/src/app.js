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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Socket.io setup
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Middlewares
app.use(cors({ origin: true, credentials: true }))
app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())

app.set("io", io)

// Routes
app.use("/files", express.static(path.join(__dirname, "files")))
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))
app.use("/api", userRoutes)
app.use("/api", fileRoutes)
app.use("/api", messageRoutes)
app.use("/api", commerceRoutes)

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id)

  // User 
  socket.on("joinUser", (userId) => {
    socket.join(userId)
    console.log(`User ${userId} joined room`)
  })

  // Room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId)
    console.log(`User joined room ${roomId}`)
  })

  // sendMessage
  socket.on("sendMessage", (data) => {
    const { roomId, message } = data
    socket.to(roomId).emit("receiveMessage", message)
    console.log(`Message sent to room ${roomId}`)
  })
  
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId)
    console.log(`User left room ${roomId}`)
  })

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id)
  })
})

export { server, io }
export default app
