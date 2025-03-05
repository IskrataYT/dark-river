import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { rateLimiter } from "@/lib/rate-limiter"
import { z } from "zod"

const resetSchema = z.object({
  userId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin && !session?.isModerator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = resetSchema.parse(body)

    // Reset the rate limiter for this user
    rateLimiter.reset(validatedData.userId)

    return NextResponse.json({
      message: "Rate limit reset successfully",
    })
  } catch (error) {
    console.error("Failed to reset rate limit:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

