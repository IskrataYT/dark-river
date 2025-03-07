import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { UserEmailProgress } from "@/lib/models/email"
import { EmailTemplate } from "@/lib/models/emailTemplate"

const debug = {
  log: (action: string, data?: any) => {
    console.log(`[API:emails/${action}]`, {
      timestamp: new Date().toISOString(),
      ...data,
    })
  },
  error: (action: string, error: any) => {
    console.error(`[API:emails/${action}] Error:`, {
      timestamp: new Date().toISOString(),
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
            }
          : error,
    })
  },
}

export async function GET(req: NextRequest, { params }: { params: { folder: string } }) {
  debug.log("GET started", {
    folder: params.folder,
    url: req.url,
    headers: Object.fromEntries(req.headers),
  })

  try {
    const session = await getSession()
    if (!session) {
      debug.log("Unauthorized request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    debug.log("Session validated", { userId: session.id })

    const folder = params.folder
    if (folder !== "inbox" && folder !== "sent") {
      debug.log("Invalid folder requested", { folder })
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 })
    }

    try {
      await connectDB()
      debug.log("Database connected")
    } catch (error) {
      debug.error("Database connection failed", error)
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    try {
      let userProgress = await UserEmailProgress.findOne({ userId: session.id })
      debug.log("User progress found", {
        exists: !!userProgress,
        userId: session.id,
        hasInbox: userProgress?.inbox?.length,
        hasSent: userProgress?.sent?.length,
      })

      // Get the highest stage number from active templates
      const highestStage = await EmailTemplate.findOne({ isActive: true }).sort({ stage: -1 }).select("stage")

      debug.log("Highest stage check", {
        highestStage: highestStage?.stage,
        currentStage: userProgress?.currentStage,
      })

      const isLastStage = userProgress?.currentStage === highestStage?.stage

      if (!userProgress) {
        debug.log("No user progress found, creating initial progress")
        try {
          // Find initial stage
          const initialStage = await EmailTemplate.findOne({ isInitial: true, isActive: true })
          debug.log("Initial stage check", {
            found: !!initialStage,
            stage: initialStage?.stage,
          })

          if (!initialStage) {
            debug.error("No initial stage configured")
            return NextResponse.json({ error: "System not properly configured" }, { status: 500 })
          }

          // Create initial progress with initial stage message
          userProgress = await UserEmailProgress.create({
            userId: session.id,
            currentStage: initialStage.stage,
            inbox: [
              {
                subject: initialStage.subject,
                body: initialStage.body,
                sender: "admin@darkriver.site",
                recipient: session.email,
                timestamp: new Date(),
                read: false,
              },
            ],
            sent: [],
          })
          debug.log("Created new user progress", {
            userId: session.id,
            stage: initialStage.stage,
          })
        } catch (error) {
          debug.error("Failed to create initial user progress", error)
          return NextResponse.json({ error: "Failed to initialize user progress" }, { status: 500 })
        }
      }

      const emails = folder === "inbox" ? userProgress.inbox : userProgress.sent

      // Sort emails by timestamp in descending order (newest first)
      const sortedEmails = [...emails].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      debug.log("Returning emails", {
        count: sortedEmails.length,
        folder,
        firstEmailSubject: sortedEmails[0]?.subject,
        isLastStage,
      })

      return NextResponse.json({
        emails: sortedEmails.map((email: any) => ({
          id: email._id,
          subject: email.subject,
          body: email.body,
          sender: email.sender,
          recipient: email.recipient || (folder === "inbox" ? session.email : "admin@darkriver.site"),
          timestamp: email.timestamp,
          read: email.read,
        })),
        isLastStage,
      })
    } catch (error) {
      debug.error("Failed to process emails", error)
      return NextResponse.json({ error: "Failed to process emails" }, { status: 500 })
    }
  } catch (error) {
    debug.error("Unhandled error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

