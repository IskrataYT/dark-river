import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { MFAFactor } from "@/lib/models/mfaFactor"
import { BackupCode } from "@/lib/models/backupCode"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Find user
    const user = await User.findById(session.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get MFA factors
    const factors = await MFAFactor.find({ userId: user._id })

    // Get backup codes (only if MFA is enabled)
    let backupCodes = []
    if (user.mfaEnabled) {
      const codes = await BackupCode.find({ userId: user._id, used: false })
      backupCodes = codes.map((code) => {
        // Format as XXXX-XXXX-XXXX-XXXX-XXXX
        const formattedCode = code.code.match(/.{1,4}/g)?.join("-") || code.code
        return formattedCode
      })
    }

    return NextResponse.json({
      mfaEnabled: user.mfaEnabled,
      factors,
      backupCodes,
    })
  } catch (error: any) {
    console.error("MFA status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

