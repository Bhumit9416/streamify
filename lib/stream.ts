// Remove the sensitive environment variables and simplify for client-side use
export function createStreamToken(userId: string): string {
  // Token will be generated on the server and passed to client
  return `demo-token-${userId}`
}

export function getStreamClient(userId: string, token: string) {
  // Simplified client setup without sensitive keys
  return {
    user: { id: userId },
    token,
    // Add other Stream client methods as needed
  }
}
