"use client"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { ChatBubbleIcon, VideoIcon, GearIcon, ExitIcon } from "@radix-ui/react-icons"
import { useAuthStore } from "../store/authStore.js"
import { authAPI } from "../lib/api.js"
import { toast } from "sonner"

export default function HomePage() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = async () => {
    try {
      await authAPI.signOut()
      logout()
      toast.info("Logged out successfully.")
      navigate("/auth/signin")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to log out.")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Welcome to LanguageLink!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Connect with language learners worldwide through chat and video calls.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="h-auto py-4 text-lg" onClick={() => navigate("/chat")}>
              <ChatBubbleIcon className="w-6 h-6 mr-2" /> Start Chatting
            </Button>
            <Button className="h-auto py-4 text-lg" onClick={() => navigate("/chat")}>
              {" "}
              {/* Navigate to chat page for now */}
              <VideoIcon className="w-6 h-6 mr-2" /> Start Video Call
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 text-lg bg-transparent"
              onClick={() => navigate("/settings")}
            >
              <GearIcon className="w-6 h-6 mr-2" /> Settings
            </Button>
            <Button
              variant="ghost"
              className="h-auto py-4 text-lg text-red-500 hover:text-red-600"
              onClick={handleLogout}
            >
              <ExitIcon className="w-6 h-6 mr-2" /> Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
