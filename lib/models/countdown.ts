import mongoose from "mongoose"

const countdownSchema = new mongoose.Schema(
  {
    endTime: {
      type: Date,
      required: true,
    },
    message: {
      type: String,
      required: true,
      default: "Нови етапи в разработка. Очаквайте скоро!",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
)

// Ensure there's only one active countdown at a time
countdownSchema.pre("save", async function (next) {
  if (this.isActive) {
    await this.constructor.updateMany({ _id: { $ne: this._id } }, { $set: { isActive: false } })
  }
  next()
})

export const Countdown = mongoose.models.Countdown || mongoose.model("Countdown", countdownSchema)

