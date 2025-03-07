import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { Countdown } from "@/lib/models/countdown"
import { z } from "zod"

// Update the updateCountdownSchema to be more flexible with datetime formats
const updateCountdownSchema = z.object({
  endTime: z
    .string()
    .refine(
      (val) => {
        try {
          // Check if it's a valid date
          return !isNaN(new Date(val).getTime())
        } catch (e) {
          return false
        }
      },
      { message: "Invalid date format" },
    )
    .optional(),
  message: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
})

// Update countdown
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateCountdownSchema.parse(body)

    await connectDB()

    // Add debug logging
    console.log("Updating countdown:", {
      id: params.id,
      data: validatedData,
    })

    const countdown = await Countdown.findByIdAndUpdate(
      params.id,
      {
        ...validatedData,
        updatedBy: session.id,
      },
      { new: true },
    )

    if (!countdown) {
      return NextResponse.json({ error: "Countdown not found" }, { status: 404 })
    }

    // Log the updated countdown
    console.log("Updated countdown:", {
      id: countdown._id,
      isActive: countdown.isActive,
      endTime: countdown.endTime,
    })

    return NextResponse.json({ countdown })
  } catch (error) {
    console.error("Failed to update countdown:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete countdown
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Add debug logging
    console.log("Deleting countdown:", params.id)

    const countdown = await Countdown.findByIdAndDelete(params.id)

    if (!countdown) {
      return NextResponse.json({ error: "Countdown not found" }, { status: 404 })
    }

    console.log("Deleted countdown successfully:", params.id)

    return NextResponse.json({ message: "Countdown deleted successfully" })
  } catch (error) {
    console.error("Failed to delete countdown:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

