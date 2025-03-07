import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { Note } from "@/lib/models/note"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { NoteList } from "@/components/notes/note-list"
import { NoteEditor } from "@/components/notes/note-editor"
import { getNotes } from "@/lib/actions/note-actions"

export const metadata = {
  title: "Dark River | Investigation Notes",
  description: "Keep track of your investigation notes",
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function NotePage({ params }: PageProps) {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  await connectDB()

  const [note, notes] = await Promise.all([Note.findOne({ _id: params.id, userId: session.id }), getNotes()])

  if (!note) {
    redirect("/notes")
  }

  return (
    <>
      <Navbar userName={session.name} isAdmin={session.isAdmin} isDonor={session.isDonor} />
      <main className="flex min-h-screen flex-col bg-black p-4 text-white">
        <div className="mx-auto w-full max-w-6xl flex-1 py-20">
          <div className="h-[calc(100vh-12rem)] rounded-lg border border-zinc-800 bg-zinc-950">
            <div className="grid h-full grid-cols-1 md:grid-cols-[300px,1fr]">
              <div className="hidden md:block">
                <NoteList notes={notes} />
              </div>
              <NoteEditor note={note} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

