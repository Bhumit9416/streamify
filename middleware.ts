import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/signin", "/auth/signup"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // If no token and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  // If token exists, verify it
  if (token) {
    const payload = verifyToken(token)

    // If token is invalid and trying to access protected route
    if (!payload && !isPublicRoute) {
      const response = NextResponse.redirect(new URL("/auth/signin", request.url))
      response.cookies.delete("auth-token")
      return response
    }

    // If valid token and trying to access auth pages, redirect to chat
    if (payload && isPublicRoute) {
      return NextResponse.redirect(new URL("/chat", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
