import mongoose from "mongoose"

const userDeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    deviceName: {
      type: String,
      required: true,
    },
    browser: {
      type: String,
      required: true,
    },
    os: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "Unknown location",
    },
    browsers: [
      {
        name: String,
        lastUsed: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

// Create a compound index for userId and deviceId to ensure uniqueness
userDeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true })

export const UserDevice = mongoose.models.UserDevice || mongoose.model("UserDevice", userDeviceSchema)

