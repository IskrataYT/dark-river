import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { Channel } from "@/lib/models/channel"
import { z } from "zod"

const updateChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required").optional(),
  description: z.string().min(1, "Channel description is required").optional(),
})

// Update channel
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateChannelSchema.parse(body)

    await connectDB()

    // Check if channel name already exists
    if (validatedData.name) {
      const existingChannel = await Channel.findOne({
        name: validatedData.name,
        _id: { $ne: params.id },
      })
      if (existingChannel) {
        return NextResponse.json({ error: "Channel name already exists" }, { status: 400 })
      }
    }

    const channel = await Channel.findByIdAndUpdate(params.id, { $set: validatedData }, { new: true })

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 })
    }

    return NextResponse.json({ channel })
  } catch (error) {
    console.error("Failed to update channel:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete channel
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const channel = await Channel.findByIdAndDelete(params.id)

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Channel deleted successfully" })
  } catch (error) {
    console.error("Failed to delete channel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

