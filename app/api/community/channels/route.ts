import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { Channel } from "@/lib/models/channel"
import { z } from "zod"

const channelSchema = z.object({
  name: z.string().min(3, "Channel name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
})

export async function GET() {
  try {
    await connectDB()
    const channels = await Channel.find().sort({ name: 1 })
    return NextResponse.json({ channels })
  } catch (error) {
    console.error("Failed to fetch channels:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = channelSchema.parse(body)

    await connectDB()

    const existingChannel = await Channel.findOne({ name: validatedData.name })
    if (existingChannel) {
      return NextResponse.json({ error: "Channel already exists" }, { status: 400 })
    }

    const channel = await Channel.create(validatedData)
    return NextResponse.json({ channel }, { status: 201 })
  } catch (error) {
    console.error("Failed to create channel:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

