import axios from "axios"
import { useAuthStore } from "../store/authStore.js"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = "/auth/signin"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  signIn: (email, password) => api.post("/auth/signin", { email, password }),

  signUp: (data) => api.post("/auth/signup", data),

  signOut: () => api.post("/auth/signout"),
}

// Chat API
export const chatAPI = {
  getConversations: () => api.get("/chat/conversations"),

  getMessages: (conversationId) => api.get(`/chat/conversations/${conversationId}/messages`),

  sendMessage: (conversationId, content, replyTo) =>
    api.post(`/chat/conversations/${conversationId}/messages`, { content, replyTo }),

  addReaction: (messageId, emoji) => api.post(`/chat/messages/${messageId}/reactions`, { emoji }),

  createConversation: (data) => api.post("/chat/conversations", data),
}

// Users API
export const usersAPI = {
  getProfile: () => api.get("/users/me"),

  updateProfile: (data) => api.put("/users/me", data),

  searchUsers: (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
}

// Stream API endpoints
export const streamAPI = {
  getToken: async () => {
    const response = await api.post("/stream/token")
    return response.data
  },

  getConfig: async () => {
    const response = await api.get("/stream/config")
    return response.data
  },
}
