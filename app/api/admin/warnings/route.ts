import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { Warning } from "@/lib/models/warning"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin && !session?.isModerator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    await connectDB()

    const query = userId ? { userId } : {}
    const skip = (page - 1) * limit

    const warnings = await Warning.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email")
      .lean()

    const total = await Warning.countDocuments(query)
    const hasMore = total > skip + warnings.length

    return NextResponse.json({
      warnings,
      total,
      hasMore,
    })
  } catch (error) {
    console.error("Failed to fetch warnings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

