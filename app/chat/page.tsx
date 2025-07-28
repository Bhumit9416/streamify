import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { VideoCall } from "@/components/video/video-call"

export default async function ChatPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="h-screen flex">
      <ChatSidebar />

      <div className="flex-1 flex flex-col">
        <MessageList />
        <MessageInput />
      </div>

      <VideoCall />
    </div>
  )
}
