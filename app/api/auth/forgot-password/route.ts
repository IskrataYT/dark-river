import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { OTP } from "@/lib/models/otp"
import { generateOTP, rateLimit } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { z } from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    if (!rateLimit(req)) {
      return NextResponse.json({ error: "Too many password reset attempts. Please try again later." }, { status: 429 })
    }

    const body = await req.json()
    const validatedData = forgotPasswordSchema.parse(body)

    await connectDB()

    // Find user
    const user = await User.findOne({ email: validatedData.email })
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a reset link shortly.",
      })
    }

    // Generate and save OTP
    const otp = await generateOTP()
    const otpExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await OTP.create({
      email: user.email,
      otp,
      type: "reset",
      expiresAt: otpExpiry,
    })

    // Send reset email
    await sendEmail(user.email, "reset-link", `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${otp}`)

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a reset link shortly.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

