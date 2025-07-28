"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { signUp } from "@/app/actions/auth"
import { useAuthStore } from "@/lib/store"

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
]

export function SignUpForm() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [nativeLanguage, setNativeLanguage] = useState("")
  const [learningLanguages, setLearningLanguages] = useState<string[]>([])
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)

  async function handleSubmit(formData: FormData) {
    if (!nativeLanguage) {
      setError("Please select your native language")
      return
    }

    setLoading(true)
    setError("")

    // Add language selections to form data
    formData.set("nativeLanguage", nativeLanguage)
    learningLanguages.forEach((lang) => formData.append("learningLanguages", lang))

    try {
      const result = await signUp(formData)

      if (result.success) {
        setUser(result.user)
        router.push("/chat")
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleLearningLanguageChange = (languageCode: string, checked: boolean) => {
    if (checked) {
      setLearningLanguages([...learningLanguages, languageCode])
    } else {
      setLearningLanguages(learningLanguages.filter((lang) => lang !== languageCode))
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Join our language exchange community</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="Enter your email" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" required placeholder="Choose a username" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Create a password"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Native Language</Label>
            <Select value={nativeLanguage} onValueChange={setNativeLanguage} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select your native language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Languages you want to learn</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {languages
                .filter((lang) => lang.code !== nativeLanguage)
                .map((lang) => (
                  <div key={lang.code} className="flex items-center space-x-2">
                    <Checkbox
                      id={lang.code}
                      checked={learningLanguages.includes(lang.code)}
                      onCheckedChange={(checked) => handleLearningLanguageChange(lang.code, checked as boolean)}
                      disabled={loading}
                    />
                    <Label htmlFor={lang.code} className="text-sm">
                      {lang.name}
                    </Label>
                  </div>
                ))}
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
