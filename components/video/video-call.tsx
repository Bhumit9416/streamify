import { streamApi } from "@/lib/api"

const initializeStream = async () => {
  try {
    const streamData = await streamApi.getToken()

    if (!streamData.hasCredentials) {
      console.warn("Stream credentials not configured - using demo mode")
    }

    // Use the server-generated token and config
    const client = getStreamClient(streamData.userId, streamData.token)
    // Continue with Stream setup...
  } catch (error) {
    console.error("Failed to initialize Stream:", error)
  }
}
