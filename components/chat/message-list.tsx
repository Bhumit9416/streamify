"use client"

import { useState, useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Heart, Smile, ThumbsUp, Reply } from "lucide-react"
import { useChatStore, useAuthStore } from "@/lib/store"
import { getMessages, addReaction, removeReaction } from "@/app/actions/chat"
import type { Message } from "@/lib/db"

interface MessageWithDetails extends Message {
  sender_username: string
  sender_avatar?: string
  reactions?: Array<{
    emoji: string
    user_id: string
    username: string
  }>
}

export function MessageList() {
  const [messages, setMessages] = useState<MessageWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { activeConversation } = useChatStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (activeConversation) {
      loadMessages()
    }
  }, [activeConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    if (!activeConversation) return

    setLoading(true)
    try {
      const data = await getMessages(activeConversation)
      setMessages(data as MessageWithDetails[])
    } catch (error) {
      console.error("Failed to load messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const message = messages.find((m) => m.id === messageId)
      const existingReaction = message?.reactions?.find((r) => r.emoji === emoji && r.user_id === user?.id)

      if (existingReaction) {
        await removeReaction(messageId, emoji)
      } else {
        await addReaction(messageId, emoji)
      }

      // Reload messages to get updated reactions
      await loadMessages()
    } catch (error) {
      console.error("Failed to handle reaction:", error)
    }
  }

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground">Select a conversation to start chatting</h3>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === user?.id
          const reactionCounts =
            message.reactions?.reduce(
              (acc, reaction) => {
                acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
                return acc
              },
              {} as Record<string, number>,
            ) || {}

          return (
            <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[70%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
                {!isOwnMessage && (
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={message.sender_avatar || "/placeholder.svg"} />
                    <AvatarFallback>{message.sender_username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}

                <div className={`space-y-1 ${isOwnMessage ? "mr-2" : ""}`}>
                  {!isOwnMessage && (
                    <p className="text-xs text-muted-foreground font-medium">{message.sender_username}</p>
                  )}

                  <div
                    className={`rounded-lg px-3 py-2 ${
                      isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>

                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleReaction(message.id, "👍")}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleReaction(message.id, "❤️")}
                      >
                        <Heart className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleReaction(message.id, "😊")}
                      >
                        <Smile className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Reply className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {Object.keys(reactionCounts).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(reactionCounts).map(([emoji, count]) => (
                        <Badge
                          key={emoji}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-accent"
                          onClick={() => handleReaction(message.id, emoji)}
                        >
                          {emoji} {count}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
