import mongoose from "mongoose"

// Email Template Schema
const emailTemplateSchema = new mongoose.Schema({
  stage: {
    type: Number,
    required: true,
    unique: true,
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  trigger: {
    type: String,
    required: function () {
      return !this.isInitial // Only required if not initial stage
    },
  },
  nextStage: {
    type: Number,
    required: function () {
      return !this.isInitial // Only required if not initial stage
    },
  },
  isInitial: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    required: true,
    description: "A brief description of this stage for administrative purposes",
  },
})

// Add validation to ensure only one initial stage exists
emailTemplateSchema.pre("save", async function (next) {
  if (this.isInitial) {
    const count = await this.constructor.countDocuments({ isInitial: true, _id: { $ne: this._id } })
    if (count > 0) {
      next(new Error("Only one initial stage can exist"))
    }
  }
  next()
})

// User Email Schema
const userEmailSchema = new mongoose.Schema({
  subject: String,
  body: String,
  sender: {
    type: String,
    default: "admin@darkriver.site",
  },
  recipient: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
})

const userEmailProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  currentStage: {
    type: Number,
    default: 1,
  },
  inbox: [userEmailSchema],
  sent: [userEmailSchema],
})

export const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model("EmailTemplate", emailTemplateSchema)
export const UserEmailProgress =
  mongoose.models.UserEmailProgress || mongoose.model("UserEmailProgress", userEmailProgressSchema)

