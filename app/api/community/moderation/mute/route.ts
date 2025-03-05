import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { z } from "zod"

const muteSchema = z.object({
  userId: z.string().min(1),
  duration: z.number().min(1).max(10080), // Max 1 week in minutes
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin && !session?.isModerator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = muteSchema.parse(body)

    await connectDB()

    const user = await User.findById(validatedData.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate mute expiry
    const muteExpiresAt = new Date(Date.now() + validatedData.duration * 60 * 1000)

    // Update user mute status
    user.isMuted = true
    user.muteExpiresAt = muteExpiresAt
    await user.save()

    return NextResponse.json({
      message: "User muted successfully",
      muteExpiresAt,
    })
  } catch (error) {
    console.error("Failed to mute user:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

