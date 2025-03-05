import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Warning } from "@/lib/models/warning"
import { User } from "@/lib/models/user"
import { getSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Check if user is admin or moderator
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure we're connected to the database
    await connectDB()

    // Aggregate warnings by user and count them
    const warningsByUser = await Warning.aggregate([
      {
        $group: {
          _id: "$userId",
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gte: 6 }, // Users with 6 or more warnings
        },
      },
      {
        $sort: { count: -1 }, // Sort by warning count descending
      },
    ])

    console.log("Warnings by user:", JSON.stringify(warningsByUser))

    if (warningsByUser.length === 0) {
      return NextResponse.json({ users: [] })
    }

    // Get user details for each high-risk user
    const userIds = warningsByUser.map((item) => item._id)

    // Find users directly from the database
    const users = await User.find({
      _id: { $in: userIds },
    })
      .select("name email")
      .lean()

    console.log("Found users:", JSON.stringify(users))

    // Combine user details with warning counts
    const highRiskUsers = warningsByUser.map((warning) => {
      const user = users.find((u) => u._id.toString() === warning._id.toString())
      return {
        _id: user?._id || warning._id,
        name: user?.name || "Unknown User",
        email: user?.email || "unknown@email.com",
        warningsCount: warning.count,
      }
    })

    return NextResponse.json({ users: highRiskUsers })
  } catch (error) {
    console.error("Error fetching high-risk users:", error)
    return NextResponse.json({ error: "Failed to fetch high-risk users", details: error.message }, { status: 500 })
  }
}

