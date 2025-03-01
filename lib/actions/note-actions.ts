"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { Note } from "@/lib/models/note"
import { z } from "zod"

const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string(),
  tags: z.array(z.string()).optional(),
})

export async function createNote() {
  try {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    await connectDB()

    const note = await Note.create({
      userId: session.id,
      title: "Untitled Note",
      content: "",
    })

    revalidatePath("/notes")
    return { success: true, noteId: note._id }
  } catch (error) {
    console.error("Create note error:", error)
    throw new Error("Failed to create note")
  }
}

export async function updateNote(noteId: string, data: { title?: string; content?: string; tags?: string[] }) {
  try {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    await connectDB()

    const note = await Note.findOne({ _id: noteId, userId: session.id })
    if (!note) throw new Error("Note not found")

    const validatedData = noteSchema.partial().parse(data)

    Object.assign(note, validatedData)
    await note.save()

    revalidatePath("/notes")
    return { success: true }
  } catch (error) {
    console.error("Update note error:", error)
    throw new Error("Failed to update note")
  }
}

export async function deleteNote(noteId: string) {
  try {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    await connectDB()

    const note = await Note.findOne({ _id: noteId, userId: session.id })
    if (!note) throw new Error("Note not found")

    await note.deleteOne()

    revalidatePath("/notes")
    return { success: true }
  } catch (error) {
    console.error("Delete note error:", error)
    throw new Error("Failed to delete note")
  }
}

export async function getNotes() {
  try {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    await connectDB()

    const notes = await Note.find({ userId: session.id, isArchived: false }).sort({ updatedAt: -1 })

    return notes
  } catch (error) {
    console.error("Get notes error:", error)
    throw new Error("Failed to get notes")
  }
}

