"use client"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import io from "socket.io-client"
import { useAuthStore } from "../store/authStore.js"
import { useChatStore } from "../store/chatStore.js"
import { toast } from "sonner"

const SocketContext = createContext(null)

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const { user, isAuthenticated, logout } = useAuthStore()
  const { addMessage, addConversation, updateUserStatus, setSelectedConversation } = useChatStore()
  const latestUser = useRef(user) // Use ref for latest user to avoid stale closures

  useEffect(() => {
    latestUser.current = user
  }, [user])

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

    const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:5001", {
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem("authToken"), // Send JWT for authentication if needed on connect
      },
    })

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id)
      newSocket.emit("join", latestUser.current.id) // Join personal room on connect
      toast.success("Connected to chat server.")
    })

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected")
      toast.info("Disconnected from chat server. Reconnecting...")
    })

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message)
      if (err.message === "Authentication error") {
        toast.error("Authentication error. Please sign in again.")
        logout()
      } else {
        toast.error(`Socket connection error: ${err.message}`)
      }
    })

    newSocket.on("newMessage", (message) => {
      console.log("New message received:", message)
      addMessage(message)
      // If the message is for the currently selected conversation, scroll to bottom.
      // Else, show notification for the new message.
    })

    newSocket.on("newConversation", (conversation) => {
      console.log("New conversation received:", conversation)
      addConversation(conversation)
      // Optionally, if it's a direct message, auto-select it or show a notification
      if (conversation.type === "direct" && conversation.participants.some((p) => p._id === latestUser.current.id)) {
        // You might want to automatically switch to this conversation or notify
        toast.info(
          `New direct message from ${conversation.participants.find((p) => p._id !== latestUser.current.id)?.username || "Someone"}`,
        )
      }
    })

    newSocket.on("userStatusUpdate", ({ userId, isOnline }) => {
      console.log(`User ${userId} is ${isOnline ? "online" : "offline"}`)
      updateUserStatus(userId, isOnline)
    })

    newSocket.on("messageReactionAdded", ({ messageId, userId, emoji }) => {
      console.log(`Reaction added to message ${messageId} by ${userId}: ${emoji}`)
      // Implement logic to update reaction in chatStore.messages
    })

    newSocket.on("messageReactionRemoved", ({ messageId, userId, emoji }) => {
      console.log(`Reaction removed from message ${messageId} by ${userId}: ${emoji}`)
      // Implement logic to remove reaction in chatStore.messages
    })

    newSocket.on("typing", ({ conversationId, userId, isTyping }) => {
      // Handle typing indicator in UI
      console.log(`User ${userId} is ${isTyping ? "typing" : "not typing"} in ${conversationId}`)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      newSocket.off("connect")
      newSocket.off("disconnect")
      newSocket.off("connect_error")
      newSocket.off("newMessage")
      newSocket.off("newConversation")
      newSocket.off("userStatusUpdate")
      newSocket.off("messageReactionAdded")
      newSocket.off("messageReactionRemoved")
      newSocket.off("typing")
    }
  }, [isAuthenticated, user, logout, addMessage, addConversation, updateUserStatus])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
