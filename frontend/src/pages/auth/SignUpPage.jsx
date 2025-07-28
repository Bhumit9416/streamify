"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { authAPI } from "../../lib/api.js"
import { useAuthStore } from "../../store/authStore.js"
import { toast } from "sonner"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [nativeLanguage, setNativeLanguage] = useState("")
  const [learningLanguages, setLearningLanguages] = useState("") // Comma separated
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const langsArray = learningLanguages
        .split(",")
        .map((lang) => lang.trim())
        .filter(Boolean)
      const response = await authAPI.signUp({
        email,
        username,
        password,
        nativeLanguage,
        learningLanguages: langsArray,
      })
      setAuth(response.data.token, response.data.user)
      toast.success("Account created successfully!")
      navigate("/chat")
    } catch (error) {
      console.error("Sign-up error:", error)
      toast.error(error.response?.data?.message || "Failed to sign up. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="john_doe"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="native-language">Native Language</Label>
              <Input
                id="native-language"
                placeholder="English"
                required
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="learning-languages">Learning Languages (comma-separated)</Label>
              <Input
                id="learning-languages"
                placeholder="Spanish, French"
                value={learningLanguages}
                onChange={(e) => setLearningLanguages(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing Up..." : "Create an account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/auth/signin" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
