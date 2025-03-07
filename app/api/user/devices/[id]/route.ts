import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { UserDevice } from "@/lib/models/userDevice"
import { getSession } from "@/lib/auth"

// Remove a specific device
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Ensure the device belongs to the current user
    const device = await UserDevice.findOne({
      _id: params.id,
      userId: session.id,
    })

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    await UserDevice.deleteOne({ _id: params.id })

    return NextResponse.json({ message: "Device removed successfully" })
  } catch (error) {
    console.error("Error removing device:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

