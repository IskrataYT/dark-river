import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { UserEmailProgress, EmailTemplate } from "@/lib/models/email"

const debug = {
  log: (action: string, data?: any) => {
    console.log(`[API:emails/send/${action}]`, {
      timestamp: new Date().toISOString(),
      ...data,
    })
  },
  error: (action: string, error: any) => {
    console.error(`[API:emails/send/${action}] Error:`, {
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

export async function POST(req: NextRequest) {
  debug.log("POST started", {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers),
  })

  try {
    const session = await getSession()
    if (!session) {
      debug.log("Unauthorized request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    debug.log("Session validated", { userId: session.id })

    let body
    try {
      body = await req.json()
    } catch (error) {
      debug.error("Failed to parse request body", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    debug.log("Request body parsed", {
      hasSubject: !!body.subject,
      bodyLength: body.body?.length,
    })

    const { subject, body: emailBody } = body

    if (!subject?.trim() || !emailBody?.trim()) {
      debug.log("Missing required fields", {
        subject: !!subject,
        body: !!emailBody,
      })
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })
    }

    try {
      await connectDB()
      debug.log("Database connected")
    } catch (error) {
      debug.error("Database connection failed", error)
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Get user progress
    let userProgress
    try {
      userProgress = await UserEmailProgress.findOne({ userId: session.id })
      debug.log("User progress found", {
        exists: !!userProgress,
        userId: session.id,
        currentStage: userProgress?.currentStage,
      })
    } catch (error) {
      debug.error("Failed to fetch user progress", error)
      return NextResponse.json({ error: "Failed to fetch user progress" }, { status: 500 })
    }

    if (!userProgress) {
      debug.log("Creating initial user progress")
      try {
        // Find initial stage
        const initialStage = await EmailTemplate.findOne({
          isInitial: true,
          isActive: true,
        })
        debug.log("Initial stage check", {
          found: !!initialStage,
          stage: initialStage?.stage,
        })

        if (!initialStage) {
          return NextResponse.json({ error: "No initial stage configured" }, { status: 500 })
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

    // Add email to sent folder
    try {
      userProgress.sent.push({
        subject,
        body: emailBody,
        sender: session.email,
        recipient: "admin@darkriver.site",
        timestamp: new Date(),
        read: true,
      })

      debug.log("Added email to sent folder")

      // Determine the next stage
      const nextStageNumber = (userProgress.currentStage || 0) + 1

      // Fetch the next stage template
      const nextTemplate = await EmailTemplate.findOne({
        stage: nextStageNumber,
        isActive: true,
      })

      debug.log("Next template details", {
        nextStage: nextStageNumber,
        templateFound: !!nextTemplate,
        trigger: nextTemplate?.trigger,
        subject: nextTemplate?.subject,
        bodyLength: nextTemplate?.body?.length,
      })

      if (!nextTemplate) {
        debug.log("No next stage template found. Assuming final stage.")
        // Save progress without advancing
        await userProgress.save()

        return NextResponse.json({
          message: "Email sent successfully. You have reached the final stage.",
          emailId: userProgress.sent[userProgress.sent.length - 1]._id,
          triggerFound: false,
          isLastStage: true,
        })
      }

      // Use the trigger from the next stage template
      const trigger = nextTemplate.trigger

      if (trigger) {
        debug.log("Checking trigger in email body", {
          emailBody: emailBody.substring(0, 100) + "...", // First 100 chars
          trigger: trigger,
          currentStage: userProgress.currentStage,
        })

        const triggerPhrase = trigger.trim().toLowerCase()
        const userResponse = emailBody.trim().toLowerCase()

        const triggerFound = userResponse.includes(triggerPhrase)
        debug.log("Trigger check", {
          triggerFound,
          trigger: triggerPhrase,
        })

        if (triggerFound) {
          debug.log("Trigger matched, progressing stage", {
            from: userProgress.currentStage,
            to: nextTemplate.stage,
          })

          // Add artificial delay before progressing
          debug.log("Adding delay before stage progression")
          await new Promise((resolve) => setTimeout(resolve, 3000))
          debug.log("Delay completed, proceeding with stage progression")

          // Progress to next stage
          userProgress.currentStage = nextTemplate.stage

          // Add new stage email to inbox
          debug.log("Adding next stage email", {
            stage: nextTemplate.stage,
          })

          userProgress.inbox.push({
            subject: nextTemplate.subject,
            body: nextTemplate.body,
            sender: "admin@darkriver.site",
            recipient: session.email,
            timestamp: new Date(),
            read: false,
          })

          // Save progress
          debug.log("Saving progress", {
            currentStage: userProgress.currentStage,
            inboxCount: userProgress.inbox.length,
            sentCount: userProgress.sent.length,
            lastInboxMessage: userProgress.inbox[userProgress.inbox.length - 1]?.subject,
          })
          await userProgress.save()

          return NextResponse.json({
            message: "Email sent successfully. New message received.",
            emailId: userProgress.sent[userProgress.sent.length - 1]._id,
            triggerFound: true,
            isLastStage: false,
          })
        } else {
          debug.log("Trigger not found, no stage progression")

          // Save the sent email
          await userProgress.save()

          return NextResponse.json({
            message: "Email sent successfully. Try adjusting your response to progress.",
            emailId: userProgress.sent[userProgress.sent.length - 1]._id,
            triggerFound: false,
            isLastStage: false,
          })
        }
      } else {
        debug.log("No trigger set for next stage")

        // Save progress without advancing
        await userProgress.save()

        return NextResponse.json({
          message: "Email sent successfully.",
          emailId: userProgress.sent[userProgress.sent.length - 1]._id,
          isLastStage: false,
        })
      }
    } catch (error) {
      debug.error("Failed to process email", error)
      return NextResponse.json({ error: "Failed to process email" }, { status: 500 })
    }
  } catch (error) {
    debug.error("Unhandled error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

