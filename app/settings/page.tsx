import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { ThemeSelector } from "@/components/theme/theme-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/actions/auth"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your chat and video calling experience</p>
        </div>

        <div className="grid gap-6">
          <ThemeSelector />

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details and language preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Username</label>
                <p className="text-sm text-muted-foreground">{user.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Native Language</label>
                <p className="text-sm text-muted-foreground">{user.native_language}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Learning Languages</label>
                <p className="text-sm text-muted-foreground">
                  {user.learning_languages?.join(", ") || "None selected"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={signOut}>
                <Button type="submit" variant="destructive">
                  Sign Out
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
