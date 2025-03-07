import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { Message } from "@/lib/models/message"
import { User } from "@/lib/models/user"
import { Warning } from "@/lib/models/warning"
import { detectToxicity, shouldMuteUser, detectSpam } from "@/lib/toxicity-detection"
import { z } from "zod"
import { rateLimiter } from "@/lib/rate-limiter"

const messageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
  channelId: z.string().min(1, "Channel ID is required"),
})

// Get messages for a channel
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get("channelId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    if (!channelId) {
      return NextResponse.json({ error: "Channel ID is required" }, { status: 400 })
    }

    await connectDB()

    const skip = (page - 1) * limit
    const messages = await Message.find({ channelId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name")
      .lean()

    const total = await Message.countDocuments({ channelId })
    const hasMore = total > skip + messages.length

    return NextResponse.json({
      messages: messages.map((msg) => ({
        ...msg,
        userName: msg.userId.name,
      })),
      hasMore,
    })
  } catch (error) {
    console.error("Failed to fetch messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create new message
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = messageSchema.parse(body)

    await connectDB()

    // Check if user is muted
    const user = await User.findById(session.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.checkMuteStatus()) {
      return NextResponse.json(
        {
          error: "Вие сте заглушени",
          muteExpiresAt: user.muteExpiresAt,
        },
        { status: 403 },
      )
    }

    // ADD SPAM DETECTION HERE
    const spamResult = detectSpam(session.id)
    if (spamResult.isSpam) {
      try {
        // Create a warning for spam
        await Warning.create({
          userId: session.id,
          message: validatedData.content,
          detectedIssue: spamResult.reason === "too_many_messages" ? "spam_too_many_messages" : "spam_too_fast",
          toxicityScore: 0.9, // High score for spam
          issuedBy: "system",
        })

        // Mark user as warned in rate limiter
        rateLimiter.markWarned(session.id)

        // Check if user should be muted based on recent warnings
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const recentWarnings = await Warning.countDocuments({
          userId: session.id,
          createdAt: { $gte: twentyFourHoursAgo },
        })

        // Determine mute duration based on warning count
        let muteExpiresAt
        let muteMessage

        if (shouldMuteUser(recentWarnings, true)) {
          if (recentWarnings >= 3) {
            // 24 hour mute for repeat offenders
            muteExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
            muteMessage = "Вие сте заглушени за 24 часа поради многократни нарушения на правилата за спам."
          } else {
            // 5 minute mute for first-time spam
            muteExpiresAt = new Date(Date.now() + 5 * 60 * 1000)
            muteMessage = "Вие сте заглушени за 5 минути поради изпращане на съобщения твърде бързо."
          }

          user.isMuted = true
          user.muteExpiresAt = muteExpiresAt
          await user.save()

          return NextResponse.json(
            {
              error: muteMessage,
              muteExpiresAt,
              spamDetails: {
                reason: spamResult.reason,
                explanation:
                  spamResult.reason === "too_many_messages"
                    ? "Изпратихте твърде много съобщения за кратък период от време."
                    : "Изпращате съобщения твърде бързо.",
              },
            },
            { status: 403 },
          )
        }
      } catch (warningError) {
        console.error("Failed to create spam warning:", warningError)
      }

      return NextResponse.json(
        {
          error: "Моля, забавете изпращането на съобщения.",
          spamDetails: {
            reason: spamResult.reason,
            explanation:
              spamResult.reason === "too_many_messages"
                ? "Изпратихте твърде много съобщения за кратък период от време."
                : "Изпращате съобщения твърде бързо.",
          },
          warningIssued: true,
        },
        { status: 429 },
      )
    }

    // Check message for toxicity with robust error handling
    let toxicityResult
    try {
      toxicityResult = await detectToxicity(validatedData.content)
    } catch (error) {
      console.error("Toxicity detection failed:", error)
      // Continue with message sending if toxicity detection fails
      toxicityResult = {
        isToxic: false,
        toxicityScore: 0,
        category: "грешка",
        explanation: "Неуспешен анализ на съобщението",
      }
    }

    if (toxicityResult.isToxic) {
      try {
        // Create a warning for the user
        await Warning.create({
          userId: session.id,
          message: validatedData.content,
          detectedIssue: toxicityResult.category,
          toxicityScore: toxicityResult.toxicityScore,
          issuedBy: "system",
        })

        // Check if user should be muted based on recent warnings
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const recentWarnings = await Warning.countDocuments({
          userId: session.id,
          createdAt: { $gte: twentyFourHoursAgo },
        })

        if (shouldMuteUser(recentWarnings)) {
          // Mute the user for 24 hours
          const muteExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
          user.isMuted = true
          user.muteExpiresAt = muteExpiresAt
          await user.save()

          return NextResponse.json(
            {
              error:
                "Вашето съобщение съдържа неподходящо съдържание. Бяхте заглушени за 24 часа поради множество нарушения.",
              muteExpiresAt,
              toxicityDetails: toxicityResult,
            },
            { status: 403 },
          )
        }
      } catch (warningError) {
        console.error("Failed to create warning:", warningError)
        // Continue with rejection but don't create a warning if that fails
      }

      return NextResponse.json(
        {
          error: "Вашето съобщение съдържа неподходящо съдържание и не беше изпратено.",
          toxicityDetails: toxicityResult,
          warningIssued: true,
        },
        { status: 400 },
      )
    }

    const message = await Message.create({
      ...validatedData,
      userId: session.id,
    })

    // Return the message with the user's name
    return NextResponse.json(
      {
        ...message.toJSON(),
        userName: user.name, // Include the actual username
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to create message:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

