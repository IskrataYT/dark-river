import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { OTP } from "@/lib/models/otp"
import { createToken, rateLimit } from "@/lib/auth"
import { otpSchema } from "@/lib/validations"

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    if (!rateLimit(req)) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 })
    }

    const body = await req.json()

    // Validate input
    const validatedData = otpSchema.parse(body)

    await connectDB()

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email: validatedData.email,
      type: "signup",
      expiresAt: { $gt: new Date() },
    })

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    // Verify OTP
    if (otpRecord.otp !== validatedData.otp) {
      otpRecord.attempts += 1
      await otpRecord.save()

      if (otpRecord.attempts >= 3) {
        await otpRecord.deleteOne()
        return NextResponse.json({ error: "Too many incorrect attempts. Please request a new code." }, { status: 400 })
      }

      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    // Update user verification status
    const user = await User.findOne({ email: validatedData.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.verified = true
    await user.save()

    // Delete OTP record
    await otpRecord.deleteOne()

    // Create session
    const token = await createToken({
      id: user._id,
      email: user.email,
      name: user.name,
    })

    const response = NextResponse.json({
      message: "Email verified successfully",
    })

    // Set session cookie
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error: any) {
    console.error("Verification error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

