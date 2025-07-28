import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import dotenv from "dotenv"
import { createServer } from "http"
import { Server } from "socket.io"
import rateLimit from "express-rate-limit"

import connectDB from "./config/db.js"
import authRoutes from "./routes/auth.js"
import chatRoutes from "./routes/chat.js"
import userRoutes from "./routes/users.js"
import { authenticateToken } from "./middleware/auth.js"
import { setupSocketHandlers } from "./socket/handlers.js"
import streamRoutes from "./routes/stream.js"

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})

const PORT = process.env.PORT || 5001

// Connect to MongoDB
connectDB()

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
)
app.use(morgan("combined"))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(limiter)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/chat", authenticateToken, chatRoutes)
app.use("/api/users", authenticateToken, userRoutes)
app.use("/api/stream", authenticateToken, streamRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Socket.IO setup
setupSocketHandlers(io)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`)
})

export { io }
