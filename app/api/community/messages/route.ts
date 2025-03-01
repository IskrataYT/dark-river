import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { Message } from "@/lib/models/message"
import { User } from "@/lib/models/user"
import { z } from "zod"
import { getIO } from "@/lib/socket"

const messageSchema = z.object({
  channelId: z.string().min(1),
  content: z.string().min(1, "Message cannot be empty").max(2000, "Message is too long"),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = messageSchema.parse(body)

    await connectDB()

    // Check if user is muted
    const user = await User.findById(session.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.checkMuteStatus()) {
      return NextResponse.json(
        {
          error: "You are muted",
          muteExpiresAt: user.muteExpiresAt,
        },
        { status: 403 },
      )
    }

    const message = await Message.create({
      channelId: validatedData.channelId,
      userId: session.id,
      content: validatedData.content,
    })

    // Populate user data
    const populatedMessage = await message.populate("userId", "name")

    // Transform message for socket emission
    const messageData = {
      ...populatedMessage.toObject(),
      userName: populatedMessage.userId.name,
      userId: populatedMessage.userId._id,
    }

    // Emit the message to all users in the channel
    const io = getIO()
    io.to(validatedData.channelId).emit("message:receive", messageData)

    return NextResponse.json({ message: messageData })
  } catch (error) {
    console.error("Failed to create message:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get("channelId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "25")
    const skip = (page - 1) * limit

    if (!channelId) {
      return NextResponse.json({ error: "Channel ID is required" }, { status: 400 })
    }

    await connectDB()

    const query = { channelId }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name")
      .lean()

    // Transform messages to include channelId and proper user data
    const transformedMessages = messages.map((msg) => ({
      ...msg,
      userName: msg.userId.name,
      userId: msg.userId._id,
    }))

    return NextResponse.json({
      messages: transformedMessages.reverse(),
      page,
      hasMore: messages.length === limit,
    })
  } catch (error) {
    console.error("Failed to fetch messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

