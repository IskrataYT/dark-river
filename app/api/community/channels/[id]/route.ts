import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { Channel } from "@/lib/models/channel"
import { Message } from "@/lib/models/message"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Delete all messages in the channel
    await Message.deleteMany({ channelId: params.id })

    // Delete the channel
    await Channel.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Channel deleted successfully" })
  } catch (error) {
    console.error("Failed to delete channel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

