"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { usersAPI } from "../lib/api.js"
import { useAuthStore } from "../store/authStore.js"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { HomeIcon, LogOutIcon } from "lucide-react"

export default function SettingsPage() {
  const { user, logout, setAuth } = useAuthStore()
  const navigate = useNavigate()

  const [username, setUsername] = useState(user?.username || "")
  const [email, setEmail] = useState(user?.email || "")
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "")
  const [nativeLanguage, setNativeLanguage] = useState(user?.native_language || "")
  const [learningLanguages, setLearningLanguages] = useState(user?.learning_languages?.join(", ") || "")
  const [theme, setTheme] = useState(user?.theme || "light")
  const [loading, setLoading] = useState(false)

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const langsArray = learningLanguages
        .split(",")
        .map((lang) => lang.trim())
        .filter(Boolean)
      const updateData = {
        username,
        avatar_url: avatarUrl,
        native_language: nativeLanguage,
        learning_languages: langsArray,
        theme,
      }
      const response = await usersAPI.updateProfile(updateData)
      setAuth(localStorage.getItem("authToken"), response.data.user) // Update user in store
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error(error.response?.data?.message || "Failed to update profile.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await usersAPI.signOut() // Call backend signout (optional for token-based)
      logout()
      toast.info("Logged out successfully.")
      navigate("/auth/signin")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to log out.")
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-950 p-4 justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center mb-6">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details and preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="grid gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} />
                  <AvatarFallback>{username ? username[0].toUpperCase() : "U"}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1 flex-1">
                  <Label htmlFor="avatar-url">Avatar URL</Label>
                  <Input
                    id="avatar-url"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled /> {/* Email typically not editable */}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="native-language">Native Language</Label>
                  <Input
                    id="native-language"
                    value={nativeLanguage}
                    onChange={(e) => setNativeLanguage(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="learning-languages">Learning Languages (comma-separated)</Label>
                  <Input
                    id="learning-languages"
                    value={learningLanguages}
                    onChange={(e) => setLearningLanguages(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button variant="outline" className="w-full bg-transparent" onClick={() => navigate("/chat")}>
              <HomeIcon className="mr-2 h-4 w-4" /> Go to Chat
            </Button>
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
              <LogOutIcon className="mr-2 h-4 w-4" /> Log Out
            </Button>
          </CardContent>
          <CardFooter className="text-sm text-center text-gray-500 dark:text-gray-400">
            You are signed in as {user?.username} ({user?.email}).
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
