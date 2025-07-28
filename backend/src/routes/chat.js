import { Router } from "express"
import { Conversation, Message, MessageReaction } from "../config/db.js" // Import Mongoose models
import { io } from "../server.js" // Import the Socket.IO instance

const router = Router()

// @route   GET /api/chat/conversations
// @desc    Get all conversations for the authenticated user
// @access  Private
router.get("/conversations", async (req, res) => {
  try {
    const userId = req.user._id

    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "username avatar_url is_online") // Populate participant details
      .populate("created_by", "username") // Populate creator details
      .sort({ updated_at: -1 })

    res.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/chat/conversations
// @desc    Create a new conversation (direct or group)
// @access  Private
router.post("/conversations", async (req, res) => {
  const { participantIds, name, type } = req.body
  const currentUserId = req.user._id

  if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
    return res.status(400).json({ message: "Participant IDs are required" })
  }
  if (!type || !["direct", "group"].includes(type)) {
    return res.status(400).json({ message: "Conversation type must be 'direct' or 'group'" })
  }

  try {
    // Ensure current user is part of participants
    const allParticipants = Array.from(new Set([...participantIds, currentUserId.toString()]))

    // For direct chats, check if a conversation already exists
    if (type === "direct" && allParticipants.length === 2) {
      const existingConversation = await Conversation.findOne({
        type: "direct",
        participants: { $all: allParticipants, $size: 2 },
      })
      if (existingConversation) {
        return res.status(200).json(existingConversation) // Return existing direct chat
      }
    }

    const newConversation = new Conversation({
      name: type === "group" ? name : undefined,
      type,
      participants: allParticipants,
      created_by: currentUserId,
    })

    await newConversation.save()

    // Populate for response
    const populatedConversation = await newConversation.populate("participants", "username avatar_url is_online")

    // Emit to participants that a new conversation has been created
    allParticipants.forEach((pId) => {
      io.to(pId).emit("newConversation", populatedConversation)
    })

    res.status(201).json(populatedConversation)
  } catch (error) {
    console.error("Error creating conversation:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/chat/conversations/:conversationId/messages
// @desc    Get messages for a specific conversation
// @access  Private
router.get("/conversations/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user._id

    // Check if user is a participant in the conversation
    const conversation = await Conversation.findById(conversationId)
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to access this conversation" })
    }

    const messages = await Message.find({ conversation_id: conversationId })
      .populate("sender_id", "username avatar_url") // Populate sender details
      .populate("reply_to") // Populate replied message details if needed
      .sort({ created_at: 1 }) // Oldest first

    res.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/chat/conversations/:conversationId/messages
// @desc    Send a new message to a conversation
// @access  Private
router.post("/conversations/:conversationId/messages", async (req, res) => {
  const { conversationId } = req.params
  const { content, replyTo, message_type = "text" } = req.body
  const senderId = req.user._id

  if (!content) {
    return res.status(400).json({ message: "Message content is required" })
  }

  try {
    // Check if user is a participant in the conversation
    const conversation = await Conversation.findById(conversationId)
    if (!conversation || !conversation.participants.includes(senderId)) {
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

    // Update conversation's updated_at timestamp
    conversation.updated_at = new Date()
    await conversation.save()

    // Populate sender for the emitted message
    const populatedMessage = await newMessage.populate("sender_id", "username avatar_url")

    // Emit the new message to all participants in the conversation
    conversation.participants.forEach((participantId) => {
      io.to(participantId.toString()).emit("newMessage", populatedMessage)
    })

    res.status(201).json(populatedMessage)
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/chat/messages/:messageId/reactions
// @desc    Add a reaction to a message
// @access  Private
router.post("/messages/:messageId/reactions", async (req, res) => {
  const { messageId } = req.params
  const { emoji } = req.body
  const userId = req.user._id

  if (!emoji) {
    return res.status(400).json({ message: "Emoji is required" })
  }

  try {
    const message = await Message.findById(messageId)
    if (!message) {
      return res.status(404).json({ message: "Message not found" })
    }

    // Check if user is part of the conversation
    const conversation = await Conversation.findById(message.conversation_id)
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to react to this message" })
    }

    // Check if user already reacted with this emoji
    const existingReaction = await MessageReaction.findOne({
      message_id: messageId,
      user_id: userId,
      emoji,
    })

    if (existingReaction) {
      // If exists, remove it (toggle reaction)
      await existingReaction.deleteOne()
      io.to(conversation._id.toString()).emit("messageReactionRemoved", { messageId, userId, emoji })
      return res.json({ message: "Reaction removed" })
    } else {
      // If not exists, add new reaction
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
