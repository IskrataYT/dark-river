import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { MFAFactor, MFAFactorType, MFAFactorStatus } from "@/lib/models/mfaFactor"
import { generateTOTP, setupEmailOTP, generateBackupCodes, saveBackupCodes } from "@/lib/mfa"
import { z } from "zod"
import { BackupCode } from "@/lib/models/backupCode"

const setupSchema = z.object({
  type: z.enum([MFAFactorType.EMAIL, MFAFactorType.TOTP]),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = setupSchema.parse(body)

    await connectDB()

    // Find user
    const user = await User.findById(session.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (validatedData.type === MFAFactorType.EMAIL) {
      // Setup email OTP
      const factor = await setupEmailOTP(user._id)

      // Enable MFA for the user if not already enabled
      if (!user.mfaEnabled) {
        user.mfaEnabled = true
        await user.save()
      }

      // Generate backup codes if they don't exist
      const backupCodesCount = await BackupCode.countDocuments({ userId: user._id })
      if (backupCodesCount === 0) {
        const codes = generateBackupCodes()
        await saveBackupCodes(user._id, codes)
      }

      return NextResponse.json({
        factorId: factor._id,
        message: "Email OTP setup successful",
      })
    } else if (validatedData.type === MFAFactorType.TOTP) {
      // Check if user already has a TOTP factor
      const existingFactor = await MFAFactor.findOne({
        userId: user._id,
        type: MFAFactorType.TOTP,
      })

      if (existingFactor) {
        return NextResponse.json({ error: "TOTP factor already exists", factorId: existingFactor._id }, { status: 400 })
      }

      // Generate new TOTP secret
      const { secret, uri, qrCode } = await generateTOTP(user.email)

      // Create new MFA factor
      const factor = await MFAFactor.create({
        userId: user._id,
        type: MFAFactorType.TOTP,
        status: MFAFactorStatus.UNVERIFIED,
        secret,
      })

      return NextResponse.json({
        factorId: factor._id,
        secret,
        uri,
        qrCode,
      })
    }
  } catch (error: any) {
    console.error("MFA setup error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

