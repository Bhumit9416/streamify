import { User, Conversation, Message, MessageReaction } from "../config/db.js"

export function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    // User joins their personal room (based on their userId)
    socket.on("join", async (userId) => {
      socket.join(userId)
      console.log(`User ${userId} joined their personal room and is now online.`)

      // Update user online status
      try {
        await User.findByIdAndUpdate(userId, { is_online: true, last_seen: new Date() })
        io.emit("userStatusUpdate", { userId, isOnline: true }) // Notify all clients
      } catch (error) {
        console.error("Error updating user online status on join:", error)
      }
    })

    // Join a conversation room
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId)
      console.log(`Socket ${socket.id} joined conversation room: ${conversationId}`)
    })

    // Leave a conversation room
    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId)
      console.log(`Socket ${socket.id} left conversation room: ${conversationId}`)
    })

    // Handle new messages (server-side handling might be different if using REST API for messages)
    // This is more for real-time updates after a message is saved via REST
    socket.on("sendMessage", async (data) => {
      // Data: { conversationId, content, senderId, replyTo }
      console.log("Received sendMessage:", data)
      try {
        const newMessage = new Message({
          conversation_id: data.conversationId,
          sender_id: data.senderId,
          content: data.content,
          reply_to: data.replyTo,
          message_type: data.message_type || "text",
        })
        await newMessage.save()

        // Populate sender details for the emitted message
        const populatedMessage = await newMessage.populate("sender_id", "username avatar_url")

        // Update conversation's updated_at timestamp
        await Conversation.findByIdAndUpdate(data.conversationId, { updated_at: new Date() })

        // Emit to all participants in the conversation
        // Get participants from the conversation
        const conversation = await Conversation.findById(data.conversationId)
        if (conversation) {
          conversation.participants.forEach((participantId) => {
            io.to(participantId.toString()).emit("newMessage", populatedMessage)
          })
        }
      } catch (error) {
        console.error("Error saving or emitting message:", error)
      }
    })

    // Handle typing indicator
    socket.on("typing", (data) => {
      // Data: { conversationId, userId, isTyping }
      // Emit to others in the conversation room, excluding the sender
      socket.to(data.conversationId).emit("typing", data)
    })

    // Handle message reactions
    socket.on("reactToMessage", async (data) => {
      // Data: { messageId, userId, emoji }
      try {
        const message = await Message.findById(data.messageId)
        if (!message) return console.warn("Message not found for reaction")

        const conversation = await Conversation.findById(message.conversation_id)
        if (!conversation) return console.warn("Conversation not found for message reaction")

        const existingReaction = await MessageReaction.findOne({
          message_id: data.messageId,
          user_id: data.userId,
          emoji: data.emoji,
        })

        if (existingReaction) {
          await existingReaction.deleteOne()
          io.to(conversation._id.toString()).emit("messageReactionRemoved", {
            messageId: data.messageId,
            userId: data.userId,
            emoji: data.emoji,
          })
        } else {
          const newReaction = new MessageReaction({
            message_id: data.messageId,
            user_id: data.userId,
            emoji: data.emoji,
          })
          await newReaction.save()
          io.to(conversation._id.toString()).emit("messageReactionAdded", {
            messageId: data.messageId,
            userId: data.userId,
            emoji: data.emoji,
          })
        }
      } catch (error) {
        console.error("Error handling message reaction:", error)
      }
    })

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`Socket disconnected: ${socket.id}`)
      // In a more robust system, you'd track users by their ID not just socket ID
      // and update their status more reliably (e.g., using a heartbeat or last-seen logic)
      // For now, if a user explicitly joined their room, they might be marked offline after some time
    })
  })
}
