import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"

export const runtime = "nodejs"

export async function GET() {
  console.log("[Check-Ban API] Received ban check request")

  try {
    console.log("[Check-Ban API] Getting session...")
    const session = await getSession()

    if (!session) {
      console.log("[Check-Ban API] No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[Check-Ban API] Session found, connecting to DB...")
    await connectDB()

    console.log("[Check-Ban API] Finding user:", session.id)
    const user = await User.findById(session.id)

    if (!user) {
      console.log("[Check-Ban API] User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("[Check-Ban API] User found:", {
      id: user._id,
      isBanned: user.isBanned,
      banReason: user.banReason,
      bannedAt: user.bannedAt,
    })

    // Return ban information
    return NextResponse.json({
      isBanned: user.isBanned || false,
      banReason: user.banReason,
      bannedAt: user.bannedAt,
    })
  } catch (error) {
    console.error("[Check-Ban API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

