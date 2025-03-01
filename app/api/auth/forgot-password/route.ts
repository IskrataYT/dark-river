import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { createResetToken, rateLimit } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { z } from "zod"

const schema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    if (!rateLimit(req)) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 })
    }

    const body = await req.json()

    // Validate input
    const validatedData = schema.parse(body)

    await connectDB()

    // Check if user exists
    const user = await User.findOne({ email: validatedData.email })
    if (!user) {
      // Return success message even if user doesn't exist for security
      return NextResponse.json({
        message: "If an account exists, you will receive a password reset link",
      })
    }

    // Generate reset token
    const { token, hashedToken, expiresAt } = await createResetToken()

    // Save reset token to user
    user.resetToken = hashedToken
    user.resetTokenExpiry = expiresAt
    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`

    // Send reset email
    await sendEmail(user.email, "reset-link", resetUrl)

    return NextResponse.json({
      message: "If an account exists, you will receive a password reset link",
    })
  } catch (error: any) {
    console.error("Forgot password error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

