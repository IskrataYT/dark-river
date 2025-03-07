import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { OTP } from "@/lib/models/otp"
import { User } from "@/lib/models/user"
import { generateOTP } from "@/lib/auth"
import { sendEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    await connectDB()

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email, type: "signup" })

    // Generate and save new OTP
    const otp = await generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await OTP.create({
      email,
      otp,
      type: "signup",
      expiresAt: otpExpiry,
    })

    // Send verification email
    await sendEmail(email, "verification", otp)

    return NextResponse.json({
      message: "Verification code resent to your email",
    })
  } catch (error: any) {
    console.error("Resend OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

