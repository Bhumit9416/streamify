import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./store/authStore.js"
import SignInPage from "./pages/auth/SignInPage.jsx"
import SignUpPage from "./pages/auth/SignUpPage.jsx"
import ChatPage from "./pages/ChatPage.jsx"
import SettingsPage from "./pages/SettingsPage.jsx"
import HomePage from "./pages/HomePage.jsx"
import { SocketProvider } from "./contexts/SocketContext.jsx"
import { Toaster } from "./components/ui/sonner"

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/auth/signin" />
}

export default function App() {
  return (
    <Router>
      <SocketProvider>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route path="/auth/signin" element={<SignInPage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />
          <Route
            path="/chat/:conversationId?"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
        </Routes>
        <Toaster />
      </SocketProvider>
    </Router>
  )
}
