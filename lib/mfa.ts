import * as OTPAuth from "otpauth"
import QRCode from "qrcode"
import crypto from "crypto"
import { sendEmail } from "@/lib/email"
import { MFAFactor, MFAFactorType, MFAFactorStatus } from "@/lib/models/mfaFactor"
import { BackupCode } from "@/lib/models/backupCode"

// Generate TOTP for authenticator apps
export async function generateTOTP(email: string) {
  // Create a new TOTP object
  const totp = new OTPAuth.TOTP({
    issuer: "Dark River",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  })

  // Get the secret
  const secret = totp.secret.base32

  // Generate URI for QR code
  const uri = totp.toString()

  // Generate QR code as data URL
  const qrCode = await QRCode.toDataURL(uri)

  return { secret, uri, qrCode }
}

// Verify TOTP code
export async function verifyTOTP(secret: string, token: string) {
  // Create a new TOTP object
  const totp = new OTPAuth.TOTP({
    issuer: "Dark River",
    label: "User",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  })

  // Verify the token
  const delta = totp.validate({ token })

  // Delta will be null if the token is invalid
  // Otherwise, it will be the time step difference
  return delta !== null
}

// Generate a random 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via email
export async function sendOTPEmail(user: any, otp: string): Promise<boolean> {
  try {
    await sendEmail(user.email, "mfa-otp", { otp })
    return true
  } catch (error) {
    console.error("Failed to send OTP email:", error)
    return false
  }
}

// Generate backup codes
export function generateBackupCodes(count = 10) {
  const codes = []
  for (let i = 0; i < count; i++) {
    // Generate a random 10-character code (5 groups of 4 characters)
    const code = crypto.randomBytes(10).toString("hex").toUpperCase()
    // Format as XXXX-XXXX-XXXX-XXXX-XXXX
    const formattedCode = code.match(/.{1,4}/g)?.join("-") || code
    codes.push(formattedCode)
  }
  return codes
}

// Save backup codes for a user
export async function saveBackupCodes(userId: string, codes: string[]) {
  // Delete existing backup codes
  await BackupCode.deleteMany({ userId })

  // Create new backup codes
  const backupCodes = codes.map((code) => ({
    userId,
    code: code.replace(/-/g, ""), // Store without dashes
    used: false,
  }))

  await BackupCode.insertMany(backupCodes)
  return codes
}

// Verify a backup code
export async function verifyBackupCode(userId: string, code: string) {
  // Remove dashes from the code
  const cleanCode = code.replace(/-/g, "")

  // Find the backup code
  const backupCode = await BackupCode.findOne({
    userId,
    code: cleanCode,
    used: false,
  })

  if (!backupCode) {
    return false
  }

  // Mark the code as used
  backupCode.used = true
  backupCode.usedAt = new Date()
  await backupCode.save()

  return true
}

// Setup email OTP factor
export async function setupEmailOTP(userId: string) {
  // Check if email factor already exists
  const existingFactor = await MFAFactor.findOne({
    userId,
    type: MFAFactorType.EMAIL,
  })

  if (existingFactor) {
    return existingFactor
  }

  // Create a new email factor
  const factor = await MFAFactor.create({
    userId,
    type: MFAFactorType.EMAIL,
    status: MFAFactorStatus.VERIFIED, // Email is verified by default
    secret: crypto.randomBytes(32).toString("hex"), // Just a placeholder
  })

  return factor
}

// Get available MFA methods for a user
export async function getAvailableMFAMethods(userId: string) {
  const factors = await MFAFactor.find({
    userId,
    status: MFAFactorStatus.VERIFIED,
  })

  const methods = {
    email: factors.some((f) => f.type === MFAFactorType.EMAIL),
    totp: factors.some((f) => f.type === MFAFactorType.TOTP),
    backupCodes: (await BackupCode.countDocuments({ userId, used: false })) > 0,
  }

  return methods
}

