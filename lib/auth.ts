import { cookies } from "next/headers"
import { sql, type User } from "./db"

// Simple hash function for demo purposes
export async function hashPassword(password: string): Promise<string> {
  // In a real app, use a proper hashing library
  // For demo purposes, we'll use a simple approach
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "salt")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hashedPassword
}

export function generateToken(userId: string): string {
  // Simple token generation for demo
  const payload = { userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 } // 7 days
  return btoa(JSON.stringify(payload))
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp < Date.now()) {
      return null // Token expired
    }
    return { userId: payload.userId }
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const users = await sql`
      SELECT * FROM users WHERE id = ${payload.userId}
    `

    return (users[0] as User) || null
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}
