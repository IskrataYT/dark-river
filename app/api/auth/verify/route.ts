import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { OTP } from "@/lib/models/otp"
import { createToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { otpSchema } from "@/lib/validations"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validatedData = otpSchema.parse(body)
    const { email, otp } = validatedData

    await connectDB()

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: "signup",
      expiresAt: { $gt: new Date() },
    })

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    // Find and update user
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update the verified field to match what's in the User model
    user.verified = true
    await user.save()

    // Delete used OTP
    await OTP.deleteMany({ email, type: "signup" })

    // Create session token
    const token = await createToken({
      id: user._id,
      email: user.email,
      name: user.name,
      verified: true,
      isAdmin: user.isAdmin || false,
      isBanned: user.isBanned || false,
      isDonor: user.isDonor || false,
    })

    // Set cookie
    cookies().set({
      name: "session",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    })

    return NextResponse.json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verified: true,
      },
    })
  } catch (error: any) {
    console.error("Verification error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

