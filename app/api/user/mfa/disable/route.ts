import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { MFAFactor } from "@/lib/models/mfaFactor"
import { z } from "zod"

const disableMFASchema = z.object({
  password: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = disableMFASchema.parse(body)

    await connectDB()

    // Find user
    const user = await User.findById(session.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify password
    const isValid = await user.comparePassword(validatedData.password)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Delete all MFA factors
    await MFAFactor.deleteMany({ userId: user._id })

    // Disable MFA for the user
    user.mfaEnabled = false
    await user.save()

    return NextResponse.json({
      message: "MFA disabled successfully",
    })
  } catch (error: any) {
    console.error("MFA disable error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

