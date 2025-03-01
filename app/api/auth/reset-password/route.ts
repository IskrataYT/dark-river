import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { verifyResetToken } from "@/lib/auth"
import { z } from "zod"

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validatedData = resetPasswordSchema.parse(body)

    await connectDB()

    // Find user with valid reset token
    const user = await User.findOne({
      resetToken: { $exists: true },
      resetTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
    }

    // Verify token
    const isValid = await verifyResetToken(validatedData.token, user.resetToken)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid reset link" }, { status: 400 })
    }

    // Update password
    user.password = validatedData.password
    user.resetToken = undefined
    user.resetTokenExpiry = undefined
    await user.save()

    return NextResponse.json({
      message: "Password reset successfully",
    })
  } catch (error: any) {
    console.error("Reset password error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

