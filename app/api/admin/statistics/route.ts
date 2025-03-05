import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { Message } from "@/lib/models/message"
import { Note } from "@/lib/models/note"
import { Warning } from "@/lib/models/warning"
import { UserEmailProgress } from "@/lib/models/userEmailProgress"

// Helper function to fetch Vercel Analytics data
async function fetchVercelAnalytics() {
  try {
    // This would be replaced with actual Vercel API calls in production
    // For now, we'll return simulated data
    return {
      performance: {
        lcp: { average: 1250, p75: 1800 }, // Largest Contentful Paint in ms
        fid: { average: 15, p75: 35 }, // First Input Delay in ms
        cls: { average: 0.08, p75: 0.12 }, // Cumulative Layout Shift
        ttfb: { average: 180, p75: 250 }, // Time to First Byte in ms
        fcp: { average: 950, p75: 1300 }, // First Contentful Paint in ms
      },
      pageViews: {
        total: 12450,
        unique: 3200,
        lastWeek: 2800,
      },
      topPages: [
        { path: "/", views: 4500 },
        { path: "/terminal", views: 2800 },
        { path: "/community", views: 1950 },
        { path: "/notes", views: 1200 },
        { path: "/profile", views: 950 },
      ],
      bounceRate: 42, // percentage
      avgSessionDuration: 320, // seconds
    }
  } catch (error) {
    console.error("Error fetching Vercel analytics:", error)
    return null
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get date ranges
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    // Run queries in parallel for better performance
    const [
      totalUsers,
      activeUsers,
      totalMessages,
      messagesLastWeek,
      totalNotes,
      totalDonors,
      totalWarnings,
      bannedUsers,
      mutedUsers,
      registrationsLastWeek,
      // Additional queries
      averageMessagesPerUserData,
      topActiveUsers,
      stageCompletions,
      // Message activity by hour
      messagesByHour,
      // Enhanced stage progress data
      stageProgressionOverTime,
      // Enhanced user retention data
      userRetentionByAge,
      // Average time in each stage
      averageTimeInStage,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastActive: { $gte: sevenDaysAgo } }),
      Message.countDocuments({ isDeleted: false }),
      Message.countDocuments({ createdAt: { $gte: sevenDaysAgo }, isDeleted: false }),
      Note.countDocuments(),
      User.countDocuments({ isDonor: true }),
      Warning.countDocuments(),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ isMuted: true }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      // Calculate average messages per user
      Message.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $group: { _id: null, average: { $avg: "$count" } } },
      ]),
      // Get top 5 most active users
      Message.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
        { $project: { _id: 0, name: { $arrayElemAt: ["$user.name", 0] }, messageCount: "$count" } },
      ]),
      // Get stage completion data
      UserEmailProgress.aggregate([{ $group: { _id: "$currentStage", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      // Get message activity by hour
      Message.aggregate([
        { $match: { isDeleted: false } },
        { $project: { hour: { $hour: "$createdAt" } } },
        { $group: { _id: "$hour", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      // Stage progression over time (last 90 days)
      UserEmailProgress.aggregate([
        {
          $match: {
            updatedAt: { $gte: ninetyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              stage: "$currentStage",
              month: { $month: "$updatedAt" },
              day: { $dayOfMonth: "$updatedAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.month": 1, "_id.day": 1 } },
      ]),
      // User retention by account age
      User.aggregate([
        {
          $project: {
            accountAgeInDays: {
              $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60 * 24],
            },
            isActive: {
              $cond: [{ $gte: ["$lastActive", sevenDaysAgo] }, 1, 0],
            },
          },
        },
        {
          $bucket: {
            groupBy: "$accountAgeInDays",
            boundaries: [0, 7, 30, 90, 180, 365, Number.POSITIVE_INFINITY],
            default: "other",
            output: {
              count: { $sum: 1 },
              activeCount: { $sum: "$isActive" },
            },
          },
        },
      ]),
      // Average time spent in each stage
      UserEmailProgress.aggregate([
        {
          $match: {
            currentStage: { $gt: 1 }, // Only users who have progressed beyond stage 1
          },
        },
        {
          $project: {
            stage: "$currentStage",
            timeInStage: {
              $divide: [
                { $subtract: [new Date(), "$updatedAt"] },
                1000 * 60 * 60 * 24, // Convert to days
              ],
            },
          },
        },
        {
          $group: {
            _id: "$stage",
            avgDays: { $avg: "$timeInStage" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

    // Fetch Vercel analytics data
    const vercelAnalytics = await fetchVercelAnalytics()

    // Calculate derived statistics
    const averageMessagesPerUser =
      averageMessagesPerUserData.length > 0 ? Math.round(averageMessagesPerUserData[0].average * 10) / 10 : 0

    // Process stage completion data
    const stageCompletionRates = stageCompletions.map((stage) => ({
      stage: stage._id,
      completionRate: Math.round((stage.count / totalUsers) * 100),
    }))

    // Process message activity by hour
    const hourlyActivity = Array(24).fill(0)
    messagesByHour.forEach((item) => {
      hourlyActivity[item._id] = item.count
    })

    // Calculate user retention rate (active users / total users)
    const userRetentionRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0

    // Process user retention by account age
    const retentionByAge = userRetentionByAge.map((bucket) => {
      const ageRange =
        bucket._id === "other"
          ? "Unknown"
          : bucket._id === 0
            ? "< 7 days"
            : bucket._id === 7
              ? "7-30 days"
              : bucket._id === 30
                ? "1-3 months"
                : bucket._id === 90
                  ? "3-6 months"
                  : "6+ months"

      return {
        ageRange,
        retentionRate: Math.round((bucket.activeCount / bucket.count) * 100),
      }
    })

    // Process average time in stage
    const timeInStage = averageTimeInStage.map((stage) => ({
      stage: stage._id,
      avgDays: Math.round(stage.avgDays * 10) / 10,
    }))

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalMessages,
      messagesLastWeek,
      totalNotes,
      totalDonors,
      totalWarnings,
      bannedUsers,
      mutedUsers,
      registrationsLastWeek,
      // Derived statistics
      userRetentionRate,
      averageMessagesPerUser,
      topActiveUsers,
      stageCompletionRates,
      hourlyActivity,
      // Enhanced statistics
      retentionByAge,
      timeInStage,
      // Vercel analytics
      performance: vercelAnalytics?.performance,
      pageViews: vercelAnalytics?.pageViews,
      topPages: vercelAnalytics?.topPages,
      bounceRate: vercelAnalytics?.bounceRate,
      avgSessionDuration: vercelAnalytics?.avgSessionDuration,
    })
  } catch (error) {
    console.error("Failed to fetch statistics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

