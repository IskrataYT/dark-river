import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { z } from "zod"
import { getIO } from "@/lib/socket"

const unmuteSchema = z.object({
  userId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin && !session?.isModerator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = unmuteSchema.parse(body)

    await connectDB()

    const user = await User.findById(validatedData.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.isMuted = false
    user.muteExpiresAt = null
    await user.save()

    // Notify the unmuted user
    const io = getIO()
    io.emit("user:unmuted", { userId: user._id })

    return NextResponse.json({ message: "User unmuted successfully" })
  } catch (error) {
    console.error("Failed to unmute user:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

