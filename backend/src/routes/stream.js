import { Router } from "express"
import { streamClient } from "../config/stream.js"
import { authenticateToken } from "../middleware/auth.js"

const router = Router()

// ===================== GENERATE STREAM TOKEN =====================
router.post("/token", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id.toString()
    const username = req.user.username || `user-${userId}`
    const avatar_url = req.user.avatar_url || ""

    // Create or update Stream user
    await streamClient.upsertUser({
      id: userId,
      name: username,
      image: avatar_url,
    })

    const token = streamClient.createToken(userId)

    res.json({
      token,
      userId,
      apiKey: process.env.STREAM_API_KEY, 
      hasCredentials: !!process.env.STREAM_API_KEY && !!process.env.STREAM_API_SECRET,
    })
  } catch (error) {
    console.error("Error generating Stream token:", error)
    res.status(500).json({ message: "Failed to generate Stream token" })
  }
})

// ===================== GET STREAM CONFIG =====================
router.get("/config", authenticateToken, (req, res) => {
  try {
    res.json({
      apiKey: process.env.STREAM_API_KEY,
      hasCredentials: !!process.env.STREAM_API_KEY && !!process.env.STREAM_API_SECRET,
    })
  } catch (error) {
    console.error("Error getting Stream config:", error)
    res.status(500).json({ message: "Failed to get Stream config" })
  }
})

export default router
