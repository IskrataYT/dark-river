import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Countdown } from "@/lib/models/countdown"

export async function GET() {
  try {
    await connectDB()

    // Make sure we're only fetching active countdowns
    const countdown = await Countdown.findOne({ isActive: true }).sort({ createdAt: -1 })

    // Add debug logging
    console.log(
      "Fetched countdown:",
      countdown
        ? {
            id: countdown._id,
            isActive: countdown.isActive,
            endTime: countdown.endTime,
          }
        : "No active countdown found",
    )

    return NextResponse.json({ countdown })
  } catch (error) {
    console.error("Failed to fetch countdown:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

