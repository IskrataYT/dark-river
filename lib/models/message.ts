import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Channel",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)

