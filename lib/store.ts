"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Message, Conversation } from "./db"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

interface ChatState {
  conversations: Conversation[]
  messages: Record<string, Message[]>
  activeConversation: string | null
  typingUsers: Record<string, string[]>
  setConversations: (conversations: Conversation[]) => void
  setMessages: (conversationId: string, messages: Message[]) => void
  addMessage: (message: Message) => void
  setActiveConversation: (id: string | null) => void
  setTypingUsers: (conversationId: string, users: string[]) => void
}

interface ThemeState {
  currentTheme: string
  setTheme: (theme: string) => void
}

interface CallState {
  activeCall: string | null
  isInCall: boolean
  setActiveCall: (callId: string | null) => void
  setIsInCall: (inCall: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    },
  ),
)

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  activeConversation: null,
  typingUsers: {},
  setConversations: (conversations) => set({ conversations }),
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),
  addMessage: (message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [message.conversation_id]: [...(state.messages[message.conversation_id] || []), message],
      },
    })),
  setActiveConversation: (id) => set({ activeConversation: id }),
  setTypingUsers: (conversationId, users) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [conversationId]: users },
    })),
}))

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: "default",
      setTheme: (theme) => set({ currentTheme: theme }),
    }),
    {
      name: "theme-storage",
    },
  ),
)

export const useCallStore = create<CallState>((set) => ({
  activeCall: null,
  isInCall: false,
  setActiveCall: (callId) => set({ activeCall: callId }),
  setIsInCall: (inCall) => set({ isInCall: inCall }),
}))
