import { User, Conversation, Message, MessageReaction } from "../config/db.js"

export function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    // ===================== USER ONLINE STATUS =====================
    // User joins their personal room (based on userId)
    socket.on("join", async (userId) => {
      socket.join(userId)
      console.log(`User ${userId} joined personal room and is now online.`)

      try {
        await User.findByIdAndUpdate(userId, { is_online: true, last_seen: new Date() })
        io.emit("userStatusUpdate", { userId, isOnline: true })
      } catch (error) {
        console.error("Error updating user online status on join:", error)
      }
    })

    // ===================== CONVERSATION ROOMS =====================
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId)
      console.log(`Socket ${socket.id} joined conversation: ${conversationId}`)
    })

    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId)
      console.log(`Socket ${socket.id} left conversation: ${conversationId}`)
    })

    // ===================== SEND MESSAGE =====================
    socket.on("sendMessage", async (data) => {
      // Data: { conversationId, content, senderId, replyTo, message_type }
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

        const populatedMessage = await newMessage.populate("sender_id", "username avatar_url")
        await Conversation.findByIdAndUpdate(data.conversationId, { updated_at: new Date() })

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

    // ===================== TYPING INDICATOR =====================
    socket.on("typing", (data) => {
      // Data: { conversationId, userId, isTyping }
      socket.to(data.conversationId).emit("typing", data)
    })

    // ===================== MESSAGE REACTIONS =====================
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

    // ===================== DISCONNECT =====================
    socket.on("disconnect", async () => {
      console.log(`Socket disconnected: ${socket.id}`)
      // Optional: implement logic to mark user offline if needed
    })
  })
}
