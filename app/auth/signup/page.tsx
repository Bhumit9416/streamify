import Link from "next/link"
import { SignUpForm } from "@/components/auth/signup-form"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Join Our Community</h1>
          <p className="text-gray-600 mt-2">Connect with language learners from around the world</p>
        </div>

        <SignUpForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-green-600 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
