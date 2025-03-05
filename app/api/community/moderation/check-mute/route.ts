import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { Warning } from "@/lib/models/warning"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is muted
    const isMuted = user.checkMuteStatus()

    // Get recent warnings to determine if this is a spam mute
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentWarnings = await Warning.find({
      userId: session.id,
      createdAt: { $gte: twentyFourHoursAgo },
    })
      .sort({ createdAt: -1 })
      .limit(5)

    // Check if the most recent warning is a spam warning
    const isSpamMute =
      recentWarnings.length > 0 &&
      (recentWarnings[0].detectedIssue === "spam_too_many_messages" ||
        recentWarnings[0].detectedIssue === "spam_too_fast")

    return NextResponse.json({
      isMuted,
      muteExpiresAt: user.muteExpiresAt,
      isSpamMute,
      warningsCount: recentWarnings.length,
    })
  } catch (error) {
    console.error("Failed to check mute status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

