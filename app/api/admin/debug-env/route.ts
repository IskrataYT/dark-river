import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if environment variables are set
    const vercelToken = process.env.VERCEL_TOKEN
    const projectId = process.env.VERCEL_PROJECT_ID
    const teamId = process.env.VERCEL_TEAM_ID

    return NextResponse.json({
      vercelTokenSet: !!vercelToken,
      vercelTokenFirstChars: vercelToken ? vercelToken.substring(0, 4) + "..." : null,
      projectIdSet: !!projectId,
      projectId: projectId || null,
      teamIdSet: !!teamId,
      teamId: teamId || null,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

