import mongoose from "mongoose"

const warningSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
    },
    detectedIssue: {
      type: String,
      required: true,
    },
    toxicityScore: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    issuedBy: {
      type: String,
      enum: ["system", "admin", "moderator"],
      default: "system",
    },
    acknowledged: {
      type: Boolean,
      default: false,
    },
    isSpamWarning: {
      type: Boolean,
      default: false,
    },
    spamReason: {
      type: String,
      enum: ["too_many_messages", "too_fast", null],
      default: null,
    },
  },
  { timestamps: true },
)

// Index for efficient querying
warningSchema.index({ userId: 1, createdAt: -1 })

export const Warning = mongoose.models.Warning || mongoose.model("Warning", warningSchema)

