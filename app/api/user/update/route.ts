import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { z } from "zod"

const updateProfileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .optional()
      .refine((password) => {
        if (!password) return true
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)
      }, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) return false
      return true
    },
    {
      message: "Current password is required to set a new password",
      path: ["currentPassword"],
    },
  )

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const validatedData = updateProfileSchema.parse(body)

    await connectDB()

    // Find user
    const user = await User.findById(session.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password if changing password
    if (validatedData.newPassword) {
      const isValid = await user.comparePassword(validatedData.currentPassword!)
      if (!isValid) {
        return NextResponse.json({ error: "Current access code is incorrect" }, { status: 401 })
      }
      user.password = validatedData.newPassword
    }

    // Update name
    user.name = validatedData.name
    await user.save()

    return NextResponse.json({
      message: "Profile updated successfully",
    })
  } catch (error: any) {
    console.error("Update profile error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

