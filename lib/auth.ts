import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import crypto from "crypto"

const key = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function generateOTP(): Promise<string> {
  return crypto.randomInt(100000, 999999).toString()
}

export async function createToken(payload: any) {
  const token = await new SignJWT({
    ...payload,
    isAdmin: payload.isAdmin || false,
    isBanned: payload.isBanned || false,
    isDonor: payload.isDonor || false,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(key)

  return token
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    console.error("[Auth] Decrypt error:", error)
    throw error
  }
}

export async function verifyToken(token: string) {
  try {
    return await decrypt(token)
  } catch (error) {
    console.error("[Auth] Token verification failed:", error)
    throw new Error("Invalid token")
  }
}

export async function getSession() {
  try {
    const session = cookies().get("session")?.value
    if (!session) return null
    return await verifyToken(session)
  } catch (error) {
    console.error("[Auth] Get session error:", error)
    return null
  }
}

export function rateLimit(req: NextRequest) {
  const ip = req.ip ?? "127.0.0.1"
  const rateLimit = new Map<string, { count: number; timestamp: number }>()

  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 5 // max requests per window

  const requestCount = rateLimit.get(ip)

  if (!requestCount) {
    rateLimit.set(ip, { count: 1, timestamp: now })
    return true
  }

  if (now - requestCount.timestamp > windowMs) {
    rateLimit.set(ip, { count: 1, timestamp: now })
    return true
  }

  if (requestCount.count >= maxRequests) {
    return false
  }

  requestCount.count++
  return true
}

export async function createResetToken() {
  const token = crypto.randomBytes(32).toString("hex")
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  return { token, hashedToken, expiresAt }
}

export async function verifyResetToken(token: string, hashedToken: string) {
  const computedHash = crypto.createHash("sha256").update(token).digest("hex")
  return computedHash === hashedToken
}

// Export both the individual functions and a default auth object
const auth = {
  generateOTP,
  createToken,
  encrypt,
  decrypt,
  verifyToken,
  getSession,
  rateLimit,
  createResetToken,
  verifyResetToken,
}

export { auth }
export default auth

