import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { UserDevice } from "@/lib/models/userDevice"
import { generateDeviceId } from "@/lib/deviceUtils"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get all devices for this user
    const devices = await UserDevice.find({ userId: session.id }).sort({ lastLogin: -1 })

    // Get current device ID
    const ip = req.ip || req.headers.get("x-forwarded-for") || "Unknown"
    const currentDeviceId = generateDeviceId(ip, session.id)

    // Map devices and mark the current one
    const mappedDevices = devices.map((device) => {
      const isCurrentDevice = device.deviceId === currentDeviceId

      return {
        _id: device._id,
        deviceName: device.deviceName,
        browser: device.browser,
        browsers: device.browsers || [{ name: device.browser, lastUsed: device.lastLogin }],
        os: device.os,
        ip: device.ip,
        location: device.location || `Location (${device.ip})`,
        lastLogin: device.lastLogin,
        isCurrentDevice,
      }
    })

    return NextResponse.json({ devices: mappedDevices })
  } catch (error) {
    console.error("Error fetching devices:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

