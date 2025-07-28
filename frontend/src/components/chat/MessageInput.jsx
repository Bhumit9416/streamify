"use client"

import { useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { SendIcon } from "lucide-react"
import { useSocket } from "../../contexts/SocketContext.jsx"
import { useAuthStore } from "../../store/authStore.js"

export default function MessageInput({ conversationId }) {
  const [messageContent, setMessageContent] = useState("")
  const socket = useSocket()
  const user = useAuthStore((state) => state.user)

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (messageContent.trim() && socket && user) {
      socket.emit("sendMessage", {
        conversationId,
        content: messageContent.trim(),
        senderId: user.id, // Ensure senderId is passed
      })
      setMessageContent("")
    }
  }

  const handleTyping = (e) => {
    setMessageContent(e.target.value)
    if (socket) {
      socket.emit("typing", { conversationId, isTyping: e.target.value.length > 0 })
    }
  }

  return (
    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
      <Input placeholder="Type your message..." value={messageContent} onChange={handleTyping} className="flex-1" />
      <Button type="submit" disabled={!messageContent.trim()}>
        <SendIcon className="h-5 w-5" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  )
}
