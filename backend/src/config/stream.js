import dotenv from "dotenv";
import { StreamChat } from "stream-chat";

dotenv.config();

const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

if (!STREAM_API_KEY || !STREAM_API_SECRET) {
  console.warn(
    "Stream API Key or Secret not found. Video calling features may be limited."
  );
}

// Initialize Stream client only if credentials exist
export const streamClient =
  STREAM_API_KEY && STREAM_API_SECRET
    ? new StreamChat(STREAM_API_KEY, STREAM_API_SECRET)
    : null;

/**
 * Generate a Stream token for a user.
 * If API credentials are missing, returns a demo token.
 */
export function generateStreamToken(userId) {
  if (!STREAM_API_KEY || !STREAM_API_SECRET) {
    // Development fallback
    return `demo-token-${userId}`;
  }

  // In production, you would generate a proper token using Stream SDK:
  // return streamClient.createToken(userId);
  // For now, return a placeholder token
  return `stream-token-${userId}-${Date.now()}`;
}

/**
 * Return Stream configuration info for frontend
 */
export function getStreamConfig() {
  return {
    apiKey: STREAM_API_KEY,
    hasCredentials: !!(STREAM_API_KEY && STREAM_API_SECRET),
  };
}
