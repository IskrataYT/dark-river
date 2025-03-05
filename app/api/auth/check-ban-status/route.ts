import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"

export async function POST(request: Request) {
  try {
    const { session } = await request.json()

    if (!session) {
      return NextResponse.json({ error: "No session provided" }, { status: 400 })
    }

    const payload = await verifyToken(session)

    await connectDB()
    const user = await User.findById(payload.id).select("isBanned").lean()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ isBanned: user.isBanned })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

