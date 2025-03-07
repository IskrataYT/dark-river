import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { UserDevice } from "@/lib/models/userDevice"
import { createToken } from "@/lib/auth"
import { verifyBackupCode } from "@/lib/mfa"
import { getDeviceInfo } from "@/lib/deviceUtils"
import { sendEmail } from "@/lib/email"
import { z } from "zod"

const backupCodeSchema = z.object({
  userId: z.string(),
  code: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = backupCodeSchema.parse(body)

    await connectDB()

    // Find user
    const user = await User.findById(validatedData.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify backup code
    const isValid = await verifyBackupCode(user._id.toString(), validatedData.code)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid backup code" }, { status: 400 })
    }

    // Get device information
    const userAgent = req.headers.get("user-agent") || "Unknown"
    const ip = req.ip || req.headers.get("x-forwarded-for") || "Unknown"
    const deviceInfo = getDeviceInfo(userAgent, ip, user._id.toString())

    // Register the new device
    await UserDevice.create({
      userId: user._id,
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      ip: ip,
      location: deviceInfo.location,
      browsers: [{ name: deviceInfo.browser, lastUsed: new Date() }],
      lastLogin: new Date(),
    })

    // Send email notification about new location login
    try {
      await sendEmail(user.email, "new-device-login", {
        subject: "Security Alert: New Location Login",
        body: "New location login detected",
        deviceName: deviceInfo.deviceName,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ip: ip,
        location: deviceInfo.location,
        time: new Date().toLocaleString(),
      })
    } catch (emailError) {
      console.error("Failed to send login notification email:", emailError)
      // Continue with login even if email fails
    }

    // Create session token
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
      message: "Backup code verification successful",
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
    console.error("Backup code verification error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

