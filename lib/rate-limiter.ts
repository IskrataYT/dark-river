// A simple in-memory rate limiter to prevent spam
// In production, you might want to use Redis or another distributed solution

type UserRateLimit = {
  messages: number
  firstMessageTime: number
  lastMessageTime: number
  isWarned: boolean
}

class RateLimiter {
  private userLimits: Map<string, UserRateLimit> = new Map()
  private readonly MESSAGE_LIMIT = 5 // Max messages
  private readonly TIME_WINDOW = 10 * 1000 // 10 seconds
  private readonly MIN_MESSAGE_INTERVAL = 500 // 0.5 seconds between messages
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hour

  constructor() {
    // Cleanup old entries periodically
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL)
  }

  public check(userId: string): { isSpamming: boolean; reason?: string } {
    const now = Date.now()
    const userLimit = this.userLimits.get(userId) || {
      messages: 0,
      firstMessageTime: now,
      lastMessageTime: 0,
      isWarned: false,
    }

    // Check if messages are sent too quickly
    if (now - userLimit.lastMessageTime < this.MIN_MESSAGE_INTERVAL) {
      return { isSpamming: true, reason: "sending_too_fast" }
    }

    // Check if too many messages in the time window
    if (userLimit.messages >= this.MESSAGE_LIMIT && now - userLimit.firstMessageTime < this.TIME_WINDOW) {
      return { isSpamming: true, reason: "too_many_messages" }
    }

    // Update user limit
    if (now - userLimit.firstMessageTime > this.TIME_WINDOW) {
      // Reset if outside time window
      userLimit.messages = 1
      userLimit.firstMessageTime = now
    } else {
      userLimit.messages++
    }

    userLimit.lastMessageTime = now
    this.userLimits.set(userId, userLimit)

    return { isSpamming: false }
  }

  public markWarned(userId: string): void {
    const userLimit = this.userLimits.get(userId)
    if (userLimit) {
      userLimit.isWarned = true
      this.userLimits.set(userId, userLimit)
    }
  }

  public reset(userId: string): void {
    this.userLimits.delete(userId)
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [userId, userLimit] of this.userLimits.entries()) {
      if (now - userLimit.lastMessageTime > this.TIME_WINDOW * 6) {
        this.userLimits.delete(userId)
      }
    }
  }
}

// Export a singleton instance
export const rateLimiter = new RateLimiter()

