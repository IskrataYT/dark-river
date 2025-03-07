import mongoose from "mongoose"

export enum MFAFactorType {
  TOTP = "totp",
  EMAIL = "email",
}

export enum MFAFactorStatus {
  PENDING = "pending",
  VERIFIED = "verified",
}

export interface IMFAFactor extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  type: MFAFactorType
  secret: string
  status: MFAFactorStatus
  lastUsedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const mfaFactorSchema = new mongoose.Schema<IMFAFactor>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(MFAFactorType),
      required: true,
    },
    secret: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(MFAFactorStatus),
      default: MFAFactorStatus.PENDING,
    },
    lastUsedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

// Create a compound index on userId and type for faster lookups
mfaFactorSchema.index({ userId: 1, type: 1 })

export const MFAFactor = mongoose.models.MFAFactor || mongoose.model<IMFAFactor>("MFAFactor", mfaFactorSchema)

