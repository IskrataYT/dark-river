import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { Channel } from "@/lib/models/channel"
import { z } from "zod"

const channelSchema = z.object({
  name: z.string().min(1, "Channel name is required"),
  description: z.string().min(1, "Channel description is required"),
})

// Get all channels
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const channels = await Channel.find().sort({ name: 1 })

    return NextResponse.json({ channels })
  } catch (error) {
    console.error("Failed to fetch channels:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create new channel
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = channelSchema.parse(body)

    await connectDB()

    // Check if channel name already exists
    const existingChannel = await Channel.findOne({ name: validatedData.name })
    if (existingChannel) {
      return NextResponse.json({ error: "Channel name already exists" }, { status: 400 })
    }

    // Add the createdBy field with the current user's ID
    // Use the session ID directly if user object is not available
    const channel = await Channel.create({
      ...validatedData,
      createdBy: session.id, // Use session.id instead of session.user.id
    })

    return NextResponse.json({ channel }, { status: 201 })
  } catch (error) {
    console.error("Failed to create channel:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

