"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Video, Phone } from "lucide-react"
import { useChatStore, useAuthStore } from "@/lib/store"
import { getConversations } from "@/app/actions/chat"
import type { Conversation } from "@/lib/db"

interface ConversationWithDetails extends Conversation {
  display_name: string
  last_message?: string
  unread_count?: number
}

export function ChatSidebar() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { activeConversation, setActiveConversation } = useChatStore()
  const { user } = useAuthStore()

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const data = await getConversations()
      setConversations(data as ConversationWithDetails[])
    } catch (error) {
      console.error("Failed to load conversations:", error)
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.display_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="w-80 border-r bg-background flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                activeConversation === conversation.id ? "bg-accent" : ""
              }`}
              onClick={() => setActiveConversation(conversation.id)}
            >
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage
                  src={`/placeholder.svg?height=40&width=40&text=${conversation.display_name?.[0] || "C"}`}
                />
                <AvatarFallback>{conversation.display_name?.[0] || "C"}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate">{conversation.display_name || "Unnamed Chat"}</h3>
                  <div className="flex items-center space-x-1">
                    {conversation.type === "group" && (
                      <Badge variant="secondary" className="text-xs">
                        Group
                      </Badge>
                    )}
                    {conversation.unread_count && conversation.unread_count > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.last_message || "No messages yet"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <div className="flex space-x-1">
            <Button size="sm" variant="ghost">
              <Video className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
