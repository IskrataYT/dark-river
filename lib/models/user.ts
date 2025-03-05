import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isModerator: {
      type: Boolean,
      default: false,
    },
    isMuted: {
      type: Boolean,
      default: false,
    },
    muteExpiresAt: {
      type: Date,
      default: null,
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    resetToken: String,
    resetTokenExpiry: Date,
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: null,
    },
    bannedAt: {
      type: Date,
      default: null,
    },
    isDonor: {
      type: Boolean,
      default: false,
    },
    donorSince: {
      type: Date,
      default: null,
    },
    donationNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Method to check if user is muted
userSchema.methods.checkMuteStatus = function () {
  if (!this.isMuted) return false
  if (this.muteExpiresAt && new Date() > this.muteExpiresAt) {
    this.isMuted = false
    this.muteExpiresAt = null
    this.save()
    return false
  }
  return true
}

export const User = mongoose.models.User || mongoose.model("User", userSchema)

