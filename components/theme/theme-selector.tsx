"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { useThemeStore } from "@/lib/store"
import { themes, type ThemeName } from "@/lib/themes"

export function ThemeSelector() {
  const { currentTheme, setTheme } = useThemeStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Your Theme</CardTitle>
        <CardDescription>Personalize your chat experience with one of our beautiful themes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(themes).map(([key, theme]) => (
            <div
              key={key}
              className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                currentTheme === key ? "border-primary" : "border-transparent hover:border-muted-foreground"
              }`}
              onClick={() => setTheme(key as ThemeName)}
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{theme.name}</h3>
                  {currentTheme === key && <Check className="h-4 w-4 text-primary" />}
                </div>

                {/* Theme preview */}
                <div className="space-y-2">
                  <div className={`h-6 rounded ${theme.primary}`}></div>
                  <div className="flex space-x-1">
                    <div className={`h-3 w-1/2 rounded ${theme.secondary}`}></div>
                    <div className={`h-3 w-1/2 rounded ${theme.accent}`}></div>
                  </div>
                  <div className={`h-4 rounded ${theme.background} border`}></div>
                </div>
              </div>

              {currentTheme === key && <Badge className="absolute -top-2 -right-2 bg-primary">Active</Badge>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
