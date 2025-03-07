import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { MFAFactor, MFAFactorType } from "@/lib/models/mfaFactor"
import { generateOTP, sendOTPEmail } from "@/lib/mfa"
import { z } from "zod"

const generateOTPSchema = z.object({
  userId: z.string(),
  factorId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = generateOTPSchema.parse(body)

    await connectDB()

    // Find user
    const user = await User.findById(validatedData.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find or create email factor
    let factor

    if (validatedData.factorId) {
      factor = await MFAFactor.findOne({
        _id: validatedData.factorId,
        userId: user._id,
      })
    } else {
      factor = await MFAFactor.findOne({
        userId: user._id,
        type: MFAFactorType.EMAIL,
      })
    }

    if (!factor) {
      return NextResponse.json({ error: "MFA factor not found" }, { status: 404 })
    }

    // Generate OTP
    const otp = generateOTP()

    // Save OTP as factor secret
    factor.secret = otp
    factor.updatedAt = new Date()
    await factor.save()

    // Send OTP via email
    const emailSent = await sendOTPEmail(user, otp)

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 })
    }

    return NextResponse.json({
      message: "OTP sent successfully",
    })
  } catch (error: any) {
    console.error("Generate OTP error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

