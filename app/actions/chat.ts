"use server"

import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getConversations() {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const conversations = await sql`
    SELECT DISTINCT c.*, 
           CASE 
             WHEN c.type = 'direct' THEN (
               SELECT u.username 
               FROM conversation_participants cp2 
               JOIN users u ON u.id = cp2.user_id 
               WHERE cp2.conversation_id = c.id AND cp2.user_id != ${user.id}
               LIMIT 1
             )
             ELSE c.name
           END as display_name
    FROM conversations c
    JOIN conversation_participants cp ON cp.conversation_id = c.id
    WHERE cp.user_id = ${user.id}
    ORDER BY c.updated_at DESC
  `

  return conversations
}

export async function getMessages(conversationId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  // Verify user is part of conversation
  const participants = await sql`
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = ${conversationId} AND user_id = ${user.id}
  `

  if (participants.length === 0) {
    throw new Error("Access denied")
  }

  const messages = await sql`
    SELECT m.*, 
           u.username as sender_username,
           u.avatar_url as sender_avatar,
           json_agg(
             json_build_object(
               'emoji', mr.emoji,
               'user_id', mr.user_id,
               'username', ru.username
             )
           ) FILTER (WHERE mr.id IS NOT NULL) as reactions
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    LEFT JOIN message_reactions mr ON mr.message_id = m.id
    LEFT JOIN users ru ON ru.id = mr.user_id
    WHERE m.conversation_id = ${conversationId}
    GROUP BY m.id, u.username, u.avatar_url
    ORDER BY m.created_at ASC
  `

  return messages
}

export async function sendMessage(conversationId: string, content: string, replyTo?: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const messages = await sql`
    INSERT INTO messages (conversation_id, sender_id, content, reply_to)
    VALUES (${conversationId}, ${user.id}, ${content}, ${replyTo || null})
    RETURNING *
  `

  // Update conversation timestamp
  await sql`
    UPDATE conversations SET updated_at = CURRENT_TIMESTAMP
    WHERE id = ${conversationId}
  `

  revalidatePath("/chat")
  return messages[0]
}

export async function createConversation(participantIds: string[], name?: string, type: "direct" | "group" = "direct") {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const conversations = await sql`
    INSERT INTO conversations (name, type, created_by)
    VALUES (${name || null}, ${type}, ${user.id})
    RETURNING *
  `

  const conversation = conversations[0]

  // Add participants
  const allParticipants = [user.id, ...participantIds]
  for (const participantId of allParticipants) {
    await sql`
      INSERT INTO conversation_participants (conversation_id, user_id)
      VALUES (${conversation.id}, ${participantId})
    `
  }

  revalidatePath("/chat")
  return conversation
}

export async function addReaction(messageId: string, emoji: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  try {
    await sql`
      INSERT INTO message_reactions (message_id, user_id, emoji)
      VALUES (${messageId}, ${user.id}, ${emoji})
      ON CONFLICT (message_id, user_id, emoji) DO NOTHING
    `
  } catch (error) {
    // Handle duplicate reactions gracefully
  }

  revalidatePath("/chat")
}

export async function removeReaction(messageId: string, emoji: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  await sql`
    DELETE FROM message_reactions 
    WHERE message_id = ${messageId} AND user_id = ${user.id} AND emoji = ${emoji}
  `

  revalidatePath("/chat")
}
