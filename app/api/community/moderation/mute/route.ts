import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { z } from "zod"
import { getIO } from "@/lib/socket"

const muteSchema = z.object({
  userId: z.string().min(1),
  duration: z
    .number()
    .min(1)
    .max(60 * 24 * 7), // Max 1 week in minutes
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

    // Cannot mute admins or moderators
    if (user.isAdmin || user.isModerator) {
      return NextResponse.json({ error: "Cannot mute administrators or moderators" }, { status: 400 })
    }

    const muteExpiresAt = new Date(Date.now() + validatedData.duration * 60 * 1000)

    user.isMuted = true
    user.muteExpiresAt = muteExpiresAt
    await user.save()

    // Notify the muted user
    const io = getIO()
    io.emit("user:muted", {
      userId: user._id,
      muteExpiresAt,
    })

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

