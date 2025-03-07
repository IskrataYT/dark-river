import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { OTP } from "@/lib/models/otp"
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
    const validatedData = resetPasswordSchema.parse(body)

    await connectDB()

    // Find OTP record
    const otpRecord = await OTP.findOne({
      otp: validatedData.token,
      type: "reset",
      expiresAt: { $gt: new Date() },
    })

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Find and update user
    const user = await User.findOne({ email: otpRecord.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update password
    user.password = validatedData.password
    await user.save()

    // Delete OTP record
    await otpRecord.deleteOne()

    return NextResponse.json({
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

