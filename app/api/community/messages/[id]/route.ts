import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { Message } from "@/lib/models/message"

// Delete message
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

    // Check if user is authorized to delete the message
    if (message.userId.toString() !== session.id && !session.isAdmin && !session.isModerator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Soft delete by marking as deleted
    message.isDeleted = true
    await message.save()

    return NextResponse.json({ message: "Message deleted successfully" })
  } catch (error) {
    console.error("Failed to delete message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

