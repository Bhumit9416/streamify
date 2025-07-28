import { create } from "zustand"

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("authToken"),
  user: localStorage.getItem("authUser") ? JSON.parse(localStorage.getItem("authUser")) : null,
  isAuthenticated: !!localStorage.getItem("authToken"),

  setAuth: (token, user) => {
    localStorage.setItem("authToken", token)
    localStorage.setItem("authUser", JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("authUser")
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
