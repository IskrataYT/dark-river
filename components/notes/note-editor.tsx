"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateNote, deleteNote } from "@/lib/actions/note-actions"
import debounce from "lodash/debounce"

interface Note {
  _id: string
  title: string
  content: string
  tags?: string[]
}

interface NoteEditorProps {
  note: Note
}

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (noteId: string, data: { title?: string; content?: string }) => {
      try {
        setIsSaving(true)
        await updateNote(noteId, data)
      } catch (error) {
        console.error("Failed to save note:", error)
      } finally {
        setIsSaving(false)
      }
    }, 1000),
    [],
  )

  // Save changes when title or content changes
  useEffect(() => {
    debouncedSave(note._id, { title, content })
  }, [title, content, note._id, debouncedSave])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      setIsDeleting(true)
      await deleteNote(note._id)
      router.push("/notes")
    } catch (error) {
      console.error("Failed to delete note:", error)
    }
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 p-4">
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-none bg-transparent px-0 font-mono text-lg font-bold focus-visible:ring-0"
            placeholder="Untitled Note"
          />
        </div>
        <div className="flex items-center space-x-2">
          {isSaving && (
            <div className="flex items-center text-zinc-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-xs">Saving...</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:bg-red-950 hover:text-red-400"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[500px] border-none bg-transparent font-mono focus-visible:ring-0"
          placeholder="Start typing your investigation notes..."
        />
      </div>
    </div>
  )
}

