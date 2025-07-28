"use client"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { cn } from "../../lib/utils.js" // Assuming you have a utils.ts with cn function

export default function ChatSidebar({ conversations, selectedConversationId, onSelectConversation }) {
  return (
    <div className="flex flex-col h-full">
      {conversations.map((conversation) => (
        <div
          key={conversation._id}
          className={cn(
            "flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
            selectedConversationId === conversation._id && "bg-gray-200 dark:bg-gray-700",
          )}
          onClick={() => onSelectConversation(conversation._id)}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.participants[0]?.avatar_url || "/placeholder-user.jpg"} />
            <AvatarFallback>{conversation.name ? conversation.name[0] : "CN"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">
              {conversation.name ||
                conversation.participants
                  .map((p) => p.username)
                  .filter((name) => name !== "You") // Filter out current user if needed
                  .join(", ")}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {/* Display last message or status */}
              Last message content...
            </div>
          </div>
          {conversation.type === "direct" && conversation.participants[0]?.is_online && (
            <span className="h-2 w-2 rounded-full bg-green-500" title="Online" />
          )}
        </div>
      ))}
    </div>
  )
}
