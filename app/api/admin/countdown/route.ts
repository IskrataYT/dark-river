import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { Countdown } from "@/lib/models/countdown"

// Get all countdowns or active countdown
export async function GET() {
  try {
    await connectDB()

    // First try to get an active countdown
    let countdown = await Countdown.findOne({ isActive: true }).sort({ createdAt: -1 })

    // If no active countdown, get the most recent one
    if (!countdown) {
      countdown = await Countdown.findOne().sort({ createdAt: -1 })
    }

    return NextResponse.json({ countdown })
  } catch (error) {
    console.error("Failed to fetch countdown:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create a new countdown
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate the date
    try {
      const dateObj = new Date(body.endTime)
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
      }
    } catch (e) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }

    await connectDB()

    // If this countdown is active, deactivate all others
    if (body.isActive) {
      await Countdown.updateMany({}, { $set: { isActive: false } })
    }

    const countdown = new Countdown({
      endTime: body.endTime,
      message: body.message,
      isActive: body.isActive,
      createdBy: session.id,
      updatedBy: session.id,
    })

    await countdown.save()

    return NextResponse.json({ countdown })
  } catch (error) {
    console.error("Failed to create countdown:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

