import mongoose from "mongoose"

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      default: "Untitled Note",
    },
    content: {
      type: String,
      default: "",
    },
    tags: [String],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export const Note = mongoose.models.Note || mongoose.model("Note", noteSchema)

