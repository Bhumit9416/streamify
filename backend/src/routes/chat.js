import { Router } from "express"
import { Conversation, Message, MessageReaction } from "../config/db.js"
import { io } from "../server.js"
import { authenticateToken } from "../middleware/auth.js"

const router = Router()

// ===================== GET CONVERSATIONS =====================
router.get("/conversations", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id

    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "username avatar_url is_online")
      .populate("created_by", "username")
      .sort({ updated_at: -1 })

    res.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// ===================== CREATE CONVERSATION =====================
router.post("/conversations", authenticateToken, async (req, res) => {
  const { participantIds, name, type } = req.body
  const currentUserId = req.user._id.toString()

  if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
    return res.status(400).json({ message: "Participant IDs are required" })
  }
  if (!type || !["direct", "group"].includes(type)) {
    return res.status(400).json({ message: "Conversation type must be 'direct' or 'group'" })
  }

  try {
    const allParticipants = Array.from(new Set([...participantIds.map(id => id.toString()), currentUserId]))

    // For direct chats, check if conversation exists
    if (type === "direct" && allParticipants.length === 2) {
      const existingConversation = await Conversation.findOne({
        type: "direct",
        participants: { $all: allParticipants, $size: 2 },
      })
      if (existingConversation) return res.status(200).json(existingConversation)
    }

    const newConversation = new Conversation({
      name: type === "group" ? name : undefined,
      type,
      participants: allParticipants,
      created_by: currentUserId,
    })

    await newConversation.save()
    const populatedConversation = await newConversation.populate("participants", "username avatar_url is_online")

    // Emit to all participants
    allParticipants.forEach(pId => {
      io.to(pId).emit("newConversation", populatedConversation)
    })

    res.status(201).json(populatedConversation)
  } catch (error) {
    console.error("Error creating conversation:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// ===================== GET MESSAGES =====================
router.get("/conversations/:conversationId/messages", authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user._id.toString()

    const conversation = await Conversation.findById(conversationId)
    if (!conversation || !conversation.participants.map(id => id.toString()).includes(userId)) {
      return res.status(403).json({ message: "Not authorized to access this conversation" })
    }

    const messages = await Message.find({ conversation_id: conversationId })
      .populate("sender_id", "username avatar_url")
      .populate("reply_to")
      .sort({ created_at: 1 })

    res.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// ===================== SEND MESSAGE =====================
router.post("/conversations/:conversationId/messages", authenticateToken, async (req, res) => {
  const { conversationId } = req.params
  const { content, replyTo, message_type = "text" } = req.body
  const senderId = req.user._id.toString()

  if (!content) return res.status(400).json({ message: "Message content is required" })

  try {
    const conversation = await Conversation.findById(conversationId)
    if (!conversation || !conversation.participants.map(id => id.toString()).includes(senderId)) {
      return res.status(403).json({ message: "Not authorized to send messages in this conversation" })
    }

    const newMessage = new Message({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      message_type,
      reply_to: replyTo || undefined,
    })

    await newMessage.save()

    // Update conversation timestamp
    conversation.updated_at = new Date()
    await conversation.save()

    const populatedMessage = await newMessage.populate("sender_id", "username avatar_url")

    conversation.participants.forEach(pId => {
      io.to(pId.toString()).emit("newMessage", populatedMessage)
    })

    res.status(201).json(populatedMessage)
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// ===================== REACTIONS =====================
router.post("/messages/:messageId/reactions", authenticateToken, async (req, res) => {
  const { messageId } = req.params
  const { emoji } = req.body
  const userId = req.user._id.toString()

  if (!emoji) return res.status(400).json({ message: "Emoji is required" })

  try {
    const message = await Message.findById(messageId)
    if (!message) return res.status(404).json({ message: "Message not found" })

    const conversation = await Conversation.findById(message.conversation_id)
    if (!conversation || !conversation.participants.map(id => id.toString()).includes(userId)) {
      return res.status(403).json({ message: "Not authorized to react to this message" })
    }

    const existingReaction = await MessageReaction.findOne({
      message_id: messageId,
      user_id: userId,
      emoji,
    })

    if (existingReaction) {
      await existingReaction.deleteOne()
      io.to(conversation._id.toString()).emit("messageReactionRemoved", { messageId, userId, emoji })
      return res.json({ message: "Reaction removed" })
    } else {
      const newReaction = new MessageReaction({
        message_id: messageId,
        user_id: userId,
        emoji,
      })
      await newReaction.save()
      io.to(conversation._id.toString()).emit("messageReactionAdded", { messageId, userId, emoji })
      return res.status(201).json(newReaction)
    }
  } catch (error) {
    console.error("Error adding/removing reaction:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
