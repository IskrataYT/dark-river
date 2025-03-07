import { UAParser } from "ua-parser-js"
import crypto from "crypto"

export interface DeviceInfo {
  deviceId: string
  deviceName: string
  browser: string
  os: string
  location: string
}

export function generateDeviceId(ip: string, userId: string): string {
  // Create a unique device ID based primarily on IP address and user ID
  // This will consider the same IP as the same "device" regardless of browser
  const data = `${ip}|${userId}`
  return crypto.createHash("sha256").update(data).digest("hex")
}

export function getDeviceInfo(userAgent: string, ip: string, userId: string): DeviceInfo {
  const parser = new UAParser(userAgent)
  const browser = parser.getBrowser()
  const os = parser.getOS()
  const device = parser.getDevice()

  // Generate device ID based primarily on IP
  const deviceId = generateDeviceId(ip, userId)

  // Determine device name
  let deviceType = device.type || "Desktop"
  if (deviceType === "mobile") deviceType = "Mobile"
  else if (deviceType === "tablet") deviceType = "Tablet"
  else deviceType = "Desktop"

  // Create a location name based on IP
  // In a real app, you might use a geolocation service here
  const location = `Location (${ip})`

  return {
    deviceId,
    deviceName: `${deviceType} - ${os.name || "Unknown OS"}`,
    browser: browser.name ? `${browser.name} ${browser.version}` : "Unknown Browser",
    os: os.name ? `${os.name} ${os.version}` : "Unknown OS",
    location,
  }
}

