import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { UserEmailProgress } from "@/lib/models/email"

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { emailId } = body

    if (!emailId) {
      return NextResponse.json({ error: "Missing email ID" }, { status: 400 })
    }

    await connectDB()

    const userProgress = await UserEmailProgress.findOne({ userId: session.id })
    if (!userProgress) {
      return NextResponse.json({ error: "User progress not found" }, { status: 404 })
    }

    // Find and mark email as read
    const email = userProgress.inbox.id(emailId)
    if (email) {
      email.read = true
      await userProgress.save()
    }

    return NextResponse.json({ message: "Email marked as read" })
  } catch (error) {
    console.error("Failed to mark email as read:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

