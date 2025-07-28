import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

export const sql = neon(process.env.DATABASE_URL)

export type User = {
  id: string
  email: string
  username: string
  password_hash: string
  avatar_url?: string
  native_language?: string
  learning_languages?: string[]
  theme: string
  is_online: boolean
  last_seen: string
  created_at: string
  updated_at: string
}

export type Conversation = {
  id: string
  name?: string
  type: "direct" | "group"
  created_by: string
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: "text" | "image" | "file" | "system"
  reply_to?: string
  edited_at?: string
  created_at: string
}

export type MessageReaction = {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}
