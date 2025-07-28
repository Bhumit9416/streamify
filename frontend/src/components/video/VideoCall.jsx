"use client"

import { useEffect, useState } from "react"
import { StreamCall, StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk"
import { streamAPI } from "../../lib/api.js"
import { useAuthStore } from "../../store/authStore.js"
import { Button } from "../ui/button"
import { PhoneCallIcon, PhoneOffIcon } from "lucide-react"
import { toast } from "sonner"

import "@stream-io/video-react-sdk/dist/css/styles.css"

export default function VideoCall({ conversationId }) {
  const { user: authUser } = useAuthStore()
  const [client, setClient] = useState(null)
  const [call, setCall] = useState(null)
  const [isCalling, setIsCalling] = useState(false)

  useEffect(() => {
    if (!authUser || !conversationId) return

    let newClient = null

    const setupClient = async () => {
      try {
        const { token, userId, apiKey, hasCredentials } = await streamAPI.getToken()

        if (!hasCredentials || !apiKey) {
          toast.warning("Stream API credentials not configured. Video calls are in demo mode.")
          return // Do not initialize client if no credentials
        }

        const streamUser = {
          id: userId,
          name: authUser.username,
          image: authUser.avatar_url || `https://getstream.io/random_svg/?id=${userId}&name=${authUser.username}`,
        }

        newClient = new StreamVideoClient({
          apiKey,
          user: streamUser,
          token,
        })
        setClient(newClient)

        const newCall = newClient.call("default", conversationId)
        await newCall.get() // Fetch call state
        setCall(newCall)
      } catch (error) {
        console.error("Error setting up Stream client or call:", error)
        toast.error("Failed to set up video call. Check Stream credentials.")
      }
    }

    setupClient()

    return () => {
      if (newClient) {
        newClient.disconnectUser()
        setClient(null)
        setCall(null)
      }
    }
  }, [authUser, conversationId])

  const startCall = async () => {
    if (call) {
      try {
        await call.join()
        setIsCalling(true)
        toast.success("Call started!")
      } catch (error) {
        console.error("Error joining call:", error)
        toast.error("Failed to start call.")
      }
    } else {
      toast.error("Video call not ready. Please wait or check configurations.")
    }
  }

  const endCall = async () => {
    if (call) {
      try {
        await call.leave()
        setIsCalling(false)
        toast.info("Call ended.")
      } catch (error) {
        console.error("Error leaving call:", error)
        toast.error("Failed to end call.")
      }
    }
  }

  if (!client || !call) {
    return (
      <div className="p-4 text-center text-gray-500">
        {process.env.STREAM_API_KEY && process.env.STREAM_API_SECRET
          ? "Initializing video call..."
          : "Video call disabled (missing Stream API keys)."}
      </div>
    )
  }

  return (
    <div className="p-4 border-t bg-white dark:bg-gray-900">
      <div className="flex justify-center gap-4">
        {!isCalling ? (
          <Button onClick={startCall} disabled={!client || !call}>
            <PhoneCallIcon className="h-5 w-5 mr-2" /> Start Video Call
          </Button>
        ) : (
          <Button onClick={endCall} variant="destructive">
            <PhoneOffIcon className="h-5 w-5 mr-2" /> End Call
          </Button>
        )}
      </div>
      {isCalling && (
        <div className="mt-4 h-64 w-full bg-black rounded-lg overflow-hidden">
          <StreamVideo client={client}>
            <StreamCall call={call}>
              {/* You would render Stream's UI components here, e.g., <CallContent /> */}
              <div className="flex items-center justify-center h-full text-white">
                Video Call Active (Stream UI components go here)
              </div>
            </StreamCall>
          </StreamVideo>
        </div>
      )}
    </div>
  )
}
