import { Router } from "express"
import { streamClient } from "../config/stream.js"

const router = Router()

// @route   POST /api/stream/token
// @desc    Generate a Stream user token for the authenticated user
// @access  Private
router.post("/token", async (req, res) => {
  try {
    const userId = req.user._id.toString() // Convert ObjectId to string
    const username = req.user.username
    const avatar_url = req.user.avatar_url

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
      apiKey: process.env.STREAM_API_KEY, // Send API key to client for Stream SDK initialization
      hasCredentials: !!process.env.STREAM_API_KEY && !!process.env.STREAM_API_SECRET,
    })
  } catch (error) {
    console.error("Error generating Stream token:", error)
    res.status(500).json({ message: "Failed to generate Stream token" })
  }
})

// @route   GET /api/stream/config
// @desc    Get Stream API key and credential status
// @access  Private
router.get("/config", (req, res) => {
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
