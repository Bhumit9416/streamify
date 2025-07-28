"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, Smile, Mic } from "lucide-react"
import { useChatStore } from "@/lib/store"
import { sendMessage } from "@/app/actions/chat"

export function MessageInput() {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { activeConversation } = useChatStore()

  const handleSend = async () => {
    if (!message.trim() || !activeConversation || sending) return

    setSending(true)
    try {
      await sendMessage(activeConversation, message.trim())
      setMessage("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  if (!activeConversation) {
    return null
  }

  return (
    <div className="border-t p-4">
      <div className="flex items-end space-x-2">
        <div className="flex space-x-1">
          <Button size="sm" variant="ghost">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
        </div>

        <div className="flex space-x-1">
          <Button size="sm" variant="ghost">
            <Mic className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleSend} disabled={!message.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <div className="flex items-center space-x-2">
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Online</span>
        </div>
      </div>
    </div>
  )
}
