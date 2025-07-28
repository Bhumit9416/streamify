"use server"

import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { hashPassword, verifyPassword, generateToken, setAuthCookie, clearAuthCookie } from "@/lib/auth"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const nativeLanguage = formData.get("nativeLanguage") as string
  const learningLanguages = formData.getAll("learningLanguages") as string[]

  try {
    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email} OR username = ${username}
    `

    if (existingUsers.length > 0) {
      throw new Error("User already exists")
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)

    const users = await sql`
      INSERT INTO users (email, username, password_hash, native_language, learning_languages)
      VALUES (${email}, ${username}, ${passwordHash}, ${nativeLanguage}, ${learningLanguages})
      RETURNING id, email, username, native_language, learning_languages, theme, is_online, created_at
    `

    const user = users[0]
    const token = generateToken(user.id)
    await setAuthCookie(token)

    return { success: true, user }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      throw new Error("Invalid credentials")
    }

    const user = users[0]
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      throw new Error("Invalid credentials")
    }

    // Update user online status
    await sql`
      UPDATE users SET is_online = true, last_seen = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `

    const token = generateToken(user.id)
    await setAuthCookie(token)

    return { success: true, user: { ...user, is_online: true } }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function signOut() {
  await clearAuthCookie()
  redirect("/auth/signin")
}
