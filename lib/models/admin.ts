import mongoose from "mongoose"

const adminActionSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    action: {
      type: String,
      required: true,
      enum: ["create", "update", "delete"],
    },
    targetType: {
      type: String,
      required: true,
      enum: ["user", "channel", "message", "stage"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true },
)

// Index for efficient querying
adminActionSchema.index({ adminId: 1, createdAt: -1 })
adminActionSchema.index({ targetType: 1, targetId: 1 })

export const AdminAction = mongoose.models.AdminAction || mongoose.model("AdminAction", adminActionSchema)

