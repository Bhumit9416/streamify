import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined.");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;

// =====================
// Mongoose Schemas & Models
// =====================
import { Schema, model } from "mongoose";

// User Schema
const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    avatar_url: { type: String, default: "" },
    native_language: { type: String, default: "" },
    learning_languages: [{ type: String }],
    theme: { type: String, default: "light" },
    is_online: { type: Boolean, default: false },
    last_seen: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const User = model("User", UserSchema);

// Conversation Schema
const ConversationSchema = new Schema(
  {
    name: { type: String, default: "" },
    type: { type: String, required: true, enum: ["direct", "group"] },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const Conversation = model("Conversation", ConversationSchema);

// Message Schema
const MessageSchema = new Schema(
  {
    conversation_id: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    message_type: { type: String, required: true, enum: ["text", "image", "file", "system"], default: "text" },
    reply_to: { type: Schema.Types.ObjectId, ref: "Message", default: null },
    edited_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const Message = model("Message", MessageSchema);

// MessageReaction Schema
const MessageReactionSchema = new Schema(
  {
    message_id: { type: Schema.Types.ObjectId, ref: "Message", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const MessageReaction = model("MessageReaction", MessageReactionSchema);
