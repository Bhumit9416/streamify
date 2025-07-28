"use client"

import { useEffect, useRef } from "react"
import { useChatStore } from "../../store/chatStore.js"
import { useAuthStore } from "../../store/authStore.js"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { cn } from "../../lib/utils.js" // Assuming you have a utils.ts with cn function

export default function MessageList() {
  const messages = useChatStore((state) => state.messages)
  const currentUser = useAuthStore((state) => state.user)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.sender_id._id === currentUser?.id
        return (
          <div
            key={message._id}
            className={cn("flex items-start gap-3", isCurrentUser ? "justify-end" : "justify-start")}
          >
            {!isCurrentUser && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender_id.avatar_url || "/placeholder-user.jpg"} />
                <AvatarFallback>{message.sender_id.username[0]}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "rounded-lg p-3 max-w-[70%]",
                isCurrentUser
                  ? "bg-blue-500 text-white dark:bg-blue-600"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
              )}
            >
              {!isCurrentUser && <div className="font-semibold text-sm mb-1">{message.sender_id.username}</div>}
              <p className="text-sm">{message.content}</p>
              <div className="text-xs text-right mt-1 opacity-75">
                {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            {isCurrentUser && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.avatar_url || "/placeholder-user.jpg"} />
                <AvatarFallback>{currentUser?.username[0]}</AvatarFallback>
              </Avatar>
            )}
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
