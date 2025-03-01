import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { Message } from "@/lib/models/message"
import { getIO } from "@/lib/socket"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const message = await Message.findById(params.id)
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Check if user is admin/moderator or message owner
    if (!session.isAdmin && !session.isModerator && message.userId.toString() !== session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    message.isDeleted = true
    message.content = "[Message deleted]"
    await message.save()

    // Notify clients about the deleted message
    const io = getIO()
    io.to(message.channelId.toString()).emit("message:delete", { messageId: message._id })

    return NextResponse.json({ message: "Message deleted successfully" })
  } catch (error) {
    console.error("Failed to delete message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

