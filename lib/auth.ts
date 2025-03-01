import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import crypto from "crypto"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function generateOTP(): Promise<string> {
  return crypto.randomInt(100000, 999999).toString()
}

export async function createToken(payload: any) {
  const token = await new SignJWT({
    ...payload,
    isAdmin: payload.isAdmin || false, // Include isAdmin in the token
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET)

  return token
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload
  } catch (err) {
    throw new Error("Invalid token")
  }
}

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get("session")?.value

  if (!token) return null

  try {
    const verified = await verifyToken(token)
    return verified
  } catch (err) {
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

