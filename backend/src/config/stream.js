import dotenv from "dotenv"
import { StreamChat } from "stream-chat"

dotenv.config()

const STREAM_API_KEY = process.env.STREAM_API_KEY
const STREAM_API_SECRET = process.env.STREAM_API_SECRET

if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
  console.warn("Stream API Key or Secret not found. Video calling features may be limited.")
}

export const streamClient = new StreamChat(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET)

export function generateStreamToken(userId) {
  if (!STREAM_API_KEY || !STREAM_API_SECRET) {
    // Return demo token for development
    return `demo-token-${userId}`
  }

  // In production, use Stream's SDK to generate proper tokens
  // For now, return a demo token
  return `stream-token-${userId}-${Date.now()}`
}

export function getStreamConfig() {
  return {
    apiKey: STREAM_API_KEY,
    hasCredentials: !!(STREAM_API_KEY && STREAM_API_SECRET),
  }
}
