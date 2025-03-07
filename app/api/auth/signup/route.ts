import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { OTP } from "@/lib/models/otp"
import { generateOTP } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { signUpSchema } from "@/lib/validations"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validatedData = signUpSchema.parse(body)

    await connectDB()

    // Check if user exists
    const existingUser = await User.findOne({ email: validatedData.email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Create user
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
    })

    // Generate and save OTP
    const otp = await generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await OTP.create({
      email: user.email,
      otp,
      type: "signup",
      expiresAt: otpExpiry,
    })

    // Send verification email
    await sendEmail(user.email, "verification", otp)

    return NextResponse.json({
      message: "Verification code sent to your email",
      email: user.email,
    })
  } catch (error: any) {
    console.error("Signup error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

