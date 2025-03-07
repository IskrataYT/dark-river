import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { EmailTemplate } from "@/lib/models/email"
import { z } from "zod"

const updateStageSchema = z
  .object({
    stage: z.number().min(1).optional(),
    subject: z.string().min(1).optional(),
    body: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
    isInitial: z.boolean().optional(),
    trigger: z.string().optional(),
    nextStage: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isInitial === false) {
      if (data.trigger !== undefined && data.trigger.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Trigger is required for non-initial stages",
          path: ["trigger"],
        })
      }
      if (data.nextStage === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Next stage is required for non-initial stages",
          path: ["nextStage"],
        })
      }
    }
  })

// Update stage
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateStageSchema.parse(body)

    await connectDB()
    const stage = await EmailTemplate.findByIdAndUpdate(params.id, { $set: validatedData }, { new: true })

    if (!stage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 })
    }

    return NextResponse.json({ stage })
  } catch (error) {
    console.error("Failed to update stage:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete stage
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const stage = await EmailTemplate.findByIdAndDelete(params.id)

    if (!stage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Stage deleted successfully" })
  } catch (error) {
    console.error("Failed to delete stage:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

