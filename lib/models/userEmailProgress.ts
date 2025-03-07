import mongoose from "mongoose"

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

export const UserEmailProgress =
  mongoose.models.UserEmailProgress || mongoose.model("UserEmailProgress", userEmailProgressSchema)

