import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { createToken } from "@/lib/auth"
import { signInSchema } from "@/lib/validations"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validatedData = signInSchema.parse(body)

    await connectDB()

    // Find user
    const user = await User.findOne({ email: validatedData.email })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is verified - using the correct field name from the User model
    if (!user.verified) {
      return NextResponse.json({ error: "Please verify your email first" }, { status: 401 })
    }

    // Verify password
    const isValid = await user.comparePassword(validatedData.password)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session with all necessary user properties
    const token = await createToken({
      id: user._id,
      email: user.email,
      name: user.name,
      verified: user.verified,
      isAdmin: user.isAdmin,
      isBanned: user.isBanned,
      isDonor: user.isDonor,
    })

    const response = NextResponse.json({
      message: "Signed in successfully",
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
    console.error("Sign in error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

