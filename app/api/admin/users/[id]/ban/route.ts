import { type NextRequest, NextResponse } from "next/server"
import { getSession, createToken } from "@/lib/auth"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { z } from "zod"

const banUserSchema = z.object({
  isBanned: z.boolean(),
  banReason: z.string().optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = banUserSchema.parse(body)

    await connectDB()

    // Prevent self-banning
    if (params.id === session.id) {
      return NextResponse.json({ error: "Cannot ban yourself" }, { status: 400 })
    }

    const user = await User.findById(params.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update ban status
    user.isBanned = validatedData.isBanned

    if (validatedData.isBanned) {
      user.banReason = validatedData.banReason || "Violation of terms of service"
      user.bannedAt = new Date()
    } else {
      user.banReason = null
      user.bannedAt = null
    }

    await user.save()

    // Create new session token with updated ban status
    // This is only for reference, we won't set it in the response
    const newToken = await createToken({
      id: user._id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      isBanned: user.isBanned,
    })

    // IMPORTANT: We're not setting the cookie in the response anymore
    // This prevents overwriting the admin's token

    return NextResponse.json({
      message: validatedData.isBanned ? "User banned successfully" : "User unbanned successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBanned: user.isBanned,
        banReason: user.banReason,
        bannedAt: user.bannedAt,
      },
    })
  } catch (error) {
    console.error("Ban user error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

