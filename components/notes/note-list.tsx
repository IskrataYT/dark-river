"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { format } from "date-fns"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createNote } from "@/lib/actions/note-actions"
import { cn } from "@/lib/utils"

interface Note {
  _id: string
  title: string
  content: string
  updatedAt: string
}

interface NoteListProps {
  notes: Note[]
}

export function NoteList({ notes }: NoteListProps) {
  const pathname = usePathname()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateNote = async () => {
    try {
      setIsCreating(true)
      const result = await createNote()
      if (result.success) {
        window.location.href = `/notes/${result.noteId}`
      }
    } catch (error) {
      console.error("Failed to create note:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex h-full flex-col border-r border-zinc-800">
      <div className="border-b border-zinc-800 p-4">
        <Button
          onClick={handleCreateNote}
          disabled={isCreating}
          className="w-full bg-white font-mono text-black hover:bg-zinc-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          NEW NOTE
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {notes.map((note) => (
          <Link
            key={note._id}
            href={`/notes/${note._id}`}
            className={cn(
              "block border-b border-zinc-800 p-4 transition-colors hover:bg-zinc-900",
              pathname === `/notes/${note._id}` && "bg-zinc-900",
            )}
          >
            <h3 className="mb-1 font-mono font-medium text-white">{note.title || "Untitled Note"}</h3>
            <p className="mb-2 line-clamp-2 text-sm text-zinc-400">{note.content || "No additional content"}</p>
            <p className="text-xs text-zinc-500">Updated {format(new Date(note.updatedAt), "MMM d, h:mm a")}</p>
          </Link>
        ))}

        {notes.length === 0 && (
          <div className="p-4 text-center text-sm text-zinc-500">
            No notes yet. Click &quot;New Note&quot; to create one.
          </div>
        )}
      </div>
    </div>
  )
}

