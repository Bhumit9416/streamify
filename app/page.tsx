import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Video, Globe, Users, Zap, Shield } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/chat")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">ChatLingo</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Connect. Chat. Learn.</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join the ultimate language exchange platform with real-time messaging, video calls, and a global community of
          learners.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Link href="/auth/signup">
            <Button size="lg" className="px-8">
              Start Learning Today
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button size="lg" variant="outline" className="px-8 bg-transparent">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything you need to learn languages</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Real-time Messaging</CardTitle>
              <CardDescription>
                Chat instantly with native speakers, share reactions, and practice conversations in real-time.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Video className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Video Calls</CardTitle>
              <CardDescription>
                Practice speaking with 1-on-1 or group video calls, screen sharing, and recording features.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>32 Languages</CardTitle>
              <CardDescription>
                Connect with speakers of 32+ languages and find the perfect language exchange partner.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Global Community</CardTitle>
              <CardDescription>Join a vibrant community of language learners from around the world.</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-600 mb-4" />
              <CardTitle>Beautiful Themes</CardTitle>
              <CardDescription>
                Personalize your experience with 32+ unique UI themes and customization options.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your conversations are protected with end-to-end encryption and secure authentication.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to start your language journey?</CardTitle>
            <CardDescription className="text-lg">
              Join thousands of learners already improving their language skills with ChatLingo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/signup">
              <Button size="lg" className="px-12">
                Sign Up Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-gray-900">ChatLingo</span>
            </div>
            <p className="text-gray-600">© 2024 ChatLingo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
