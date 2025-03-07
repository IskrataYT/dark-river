import mongoose from "mongoose"

export interface IBackupCode extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  code: string
  used: boolean
  usedAt?: Date
  createdAt: Date
}

const backupCodeSchema = new mongoose.Schema<IBackupCode>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

// Create a compound index on userId and code for faster lookups
backupCodeSchema.index({ userId: 1, code: 1 }, { unique: true })

export const BackupCode = mongoose.models.BackupCode || mongoose.model<IBackupCode>("BackupCode", backupCodeSchema)

