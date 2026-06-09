import express from "express"
import morgan from "morgan"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"
import http from "http"
import { Server } from "socket.io"
import { createAdapter } from "@socket.io/redis-adapter"
import { createClient } from "redis"

import userRoutes from "./routes/auth.routes.js"
import fileRoutes from "./routes/file.routes.js"
import messageRoutes from "./routes/message.routes.js"
import commerceRoutes from "./routes/commerce.routes.js"
import chatbotRoutes from "./routes/chatbot.routes.js"
import { GeminiService } from "./services/gemini/index.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// In-memory presence store: userId -> { sockets: Set<string>, state: 'active'|'background', updatedAt: Date }
const presence = new Map()

// Socket.io setup
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Socket.IO Redis adapter (required for multi-replica deployments)
const getRedisClientOptionsFromEnv = () => {
  const url = process.env.REDIS_URL
  if (url) return { url }

  const host = process.env.REDIS_HOST || process.env.REDISHOST
  const portRaw = process.env.REDIS_PORT || process.env.REDISPORT
  if (!host || !portRaw) return null

  const port = Number(portRaw)
  if (!Number.isFinite(port)) return null

  const username = process.env.REDIS_USERNAME || process.env.REDIS_USER
  const password = process.env.REDIS_PASSWORD || process.env.REDISPASSWORD

  return {
    socket: { host, port },
    ...(username ? { username } : {}),
    ...(password ? { password } : {}),
  }
}

const redisClientOptions = getRedisClientOptionsFromEnv()
if (redisClientOptions) {
  try {
    const pubClient = createClient(redisClientOptions)
    const subClient = pubClient.duplicate()

    pubClient.on("error", (err) => console.error("[redis] pubClient error:", err))
    subClient.on("error", (err) => console.error("[redis] subClient error:", err))

    await pubClient.connect()
    await subClient.connect()

    io.adapter(createAdapter(pubClient, subClient))
    console.log("✅ Socket.IO Redis adapter enabled")
  } catch (err) {
    console.error(
      "❌ Failed to enable Socket.IO Redis adapter. Multi-replica rooms/events will NOT work until Redis is configured correctly.",
      err
    )
  }
} else {
  console.log("ℹ️ Socket.IO Redis adapter disabled (no REDIS_URL/REDIS_HOST present)")
}

// Middlewares
app.use(cors({ origin: true, credentials: true }))
app.use(morgan("dev"))
app.use(express.json())
// app.use(express.json({ limit: "10mb" }))
// app.use(express.urlencoded({ limit: "10mb", extended: true }))
app.use(cookieParser())

app.set("io", io)
app.set("presence", presence)

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

  const upsertPresence = (userId, updater) => {
    const existing = presence.get(userId) || {
      sockets: new Set(),
      state: "active",
      updatedAt: new Date(),
    }

    updater(existing)
    existing.updatedAt = new Date()
    presence.set(userId, existing)
  }

  // User
  socket.on("joinUser", (userId) => {
    socket.join(userId)
    socket.data.userId = userId

    upsertPresence(userId, (p) => {
      p.sockets.add(socket.id)
    })
    console.log(`🏠 User ${userId} joined personal room`)
  })

  socket.on("appState", (data) => {
    const userId = socket.data.userId
    if (!userId) return

    const rawState = typeof data?.state === "string" ? data.state : "active"
    const state = rawState === "active" ? "active" : "background"

    upsertPresence(userId, (p) => {
      p.state = state
    })
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
    const userId = socket.data.userId
    if (userId && presence.has(userId)) {
      const entry = presence.get(userId)
      entry.sockets.delete(socket.id)
      entry.updatedAt = new Date()

      if (entry.sockets.size === 0) {
        presence.delete(userId)
      } else {
        presence.set(userId, entry)
      }
    }
    console.log("❌ User disconnected:", socket.id)
  })
})

export { server, io }
export default app
