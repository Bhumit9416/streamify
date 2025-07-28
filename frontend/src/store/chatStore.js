import { create } from "zustand"

export const useChatStore = create((set) => ({
  conversations: [],
  messages: [],
  selectedConversationId: null,

  setConversations: (conversations) => set({ conversations }),
  addConversation: (newConversation) =>
    set((state) => ({
      conversations: [newConversation, ...state.conversations.filter((c) => c._id !== newConversation._id)],
    })),
  setMessages: (messages) => set({ messages }),
  addMessage: (newMessage) =>
    set((state) => ({
      messages: [...state.messages, newMessage],
      // Optionally update the conversation's last message/timestamp
      conversations: state.conversations.map((conv) =>
        conv._id === newMessage.conversation_id ? { ...conv, updated_at: newMessage.created_at } : conv,
      ),
    })),
  setSelectedConversation: (conversationId) => set({ selectedConversationId: conversationId }),
  updateUserStatus: (userId, isOnline) =>
    set((state) => ({
      conversations: state.conversations.map((conv) => ({
        ...conv,
        participants: conv.participants.map((p) => (p._id === userId ? { ...p, is_online: isOnline } : p)),
      })),
    })),
}))
