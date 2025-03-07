import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { EmailTemplate } from "@/lib/models/email"
import { z } from "zod"

const stageSchema = z
  .object({
    stage: z.number().min(1),
    subject: z.string().min(1),
    body: z.string().min(1),
    description: z.string().min(1),
    isActive: z.boolean().optional().default(true),
    isInitial: z.boolean().optional().default(false),
    trigger: z.string().optional(),
    nextStage: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isInitial) {
      if (!data.trigger || data.trigger.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Trigger is required for non-initial stages",
          path: ["trigger"],
        })
      }
      if (!data.nextStage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Next stage is required for non-initial stages",
          path: ["nextStage"],
        })
      }
    }
  })

// Get all stages
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const stages = await EmailTemplate.find().sort({ stage: 1 })

    return NextResponse.json({ stages })
  } catch (error) {
    console.error("Failed to fetch stages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create new stage
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = stageSchema.parse(body)

    await connectDB()

    // Check if stage number already exists
    const existingStage = await EmailTemplate.findOne({ stage: validatedData.stage })
    if (existingStage) {
      return NextResponse.json({ error: "Stage number already exists" }, { status: 400 })
    }

    const stage = await EmailTemplate.create(validatedData)
    return NextResponse.json({ stage }, { status: 201 })
  } catch (error) {
    console.error("Failed to create stage:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

