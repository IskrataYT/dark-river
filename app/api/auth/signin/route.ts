import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { UserDevice } from "@/lib/models/userDevice"
import { createToken } from "@/lib/auth"
import { signInSchema } from "@/lib/validations"
import { getDeviceInfo } from "@/lib/deviceUtils"
import { sendEmail } from "@/lib/email"
import { MFAFactor, MFAFactorStatus } from "@/lib/models/mfaFactor"
import { getAvailableMFAMethods } from "@/lib/mfa"

// Modify the POST function to check for MFA
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

    // Get device information
    const userAgent = req.headers.get("user-agent") || "Unknown"
    const ip = req.ip || req.headers.get("x-forwarded-for") || "Unknown"
    const deviceInfo = getDeviceInfo(userAgent, ip, user._id.toString())

    // Check if this IP-based device is already registered for this user
    const existingDevice = await UserDevice.findOne({
      userId: user._id,
      deviceId: deviceInfo.deviceId,
    })

    // Check if MFA is enabled and this is a new device
    if (user.mfaEnabled && !existingDevice) {
      // Get MFA factors
      const factors = await MFAFactor.find({
        userId: user._id,
        status: MFAFactorStatus.VERIFIED,
      })

      if (factors.length > 0) {
        // Get available MFA methods
        const methods = await getAvailableMFAMethods(user._id)

        // Return MFA required response with available methods
        return NextResponse.json(
          {
            mfaRequired: true,
            userId: user._id.toString(),
            factors: factors.map((factor) => ({
              id: factor._id.toString(),
              type: factor.type,
            })),
            methods,
          },
          { status: 200 },
        )
      }
    }

    if (!existingDevice) {
      // This is a new location/IP, create a record and send notification
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
    } else {
      // This is a known location, but check if it's a new browser
      const existingBrowser = existingDevice.browsers.find((b) => b.name === deviceInfo.browser)

      if (!existingBrowser) {
        // New browser at known location, add it to the list
        existingDevice.browsers.push({ name: deviceInfo.browser, lastUsed: new Date() })
      } else {
        // Update last used time for this browser
        existingBrowser.lastUsed = new Date()
      }

      // Update last login time and IP (in case of dynamic IPs)
      existingDevice.lastLogin = new Date()
      existingDevice.ip = ip
      await existingDevice.save()
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

