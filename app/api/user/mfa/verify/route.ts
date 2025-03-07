import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { MFAFactor, MFAFactorType, MFAFactorStatus } from "@/lib/models/mfaFactor"
import { verifyTOTP } from "@/lib/mfa"
import { z } from "zod"

const verifySchema = z.object({
  factorId: z.string(),
  code: z.string().min(6).max(6),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = verifySchema.parse(body)

    await connectDB()

    // Find user
    const user = await User.findById(session.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find MFA factor
    const factor = await MFAFactor.findOne({
      _id: validatedData.factorId,
      userId: user._id,
    })

    if (!factor) {
      return NextResponse.json({ error: "MFA factor not found" }, { status: 404 })
    }

    let isValid = false

    if (factor.type === MFAFactorType.TOTP) {
      // Verify TOTP code
      isValid = await verifyTOTP(factor.secret, validatedData.code)
    } else if (factor.type === MFAFactorType.EMAIL) {
      // Verify email OTP (direct comparison)
      isValid = factor.secret === validatedData.code
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    // Update factor status to verified
    factor.status = MFAFactorStatus.VERIFIED
    factor.lastUsedAt = new Date()
    await factor.save()

    // Enable MFA for the user
    user.mfaEnabled = true
    await user.save()

    return NextResponse.json({
      message: "MFA factor verified successfully",
    })
  } catch (error: any) {
    console.error("MFA verification error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

