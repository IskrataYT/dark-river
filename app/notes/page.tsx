import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getNotes } from "@/lib/actions/note-actions"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { NoteList } from "@/components/notes/note-list"

export const metadata = {
  title: "Dark River | Investigation Notes",
  description: "Keep track of your investigation notes",
}

export default async function NotesPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  const notes = await getNotes()

  return (
    <>
      <Navbar userName={session.name} isAdmin={session.isAdmin} />
      <main className="flex min-h-screen flex-col bg-black p-4 text-white">
        <div className="mx-auto w-full max-w-6xl flex-1 py-20">
          <div className="h-[calc(100vh-12rem)] rounded-lg border border-zinc-800 bg-zinc-950">
            <div className="grid h-full grid-cols-[300px,1fr]">
              <NoteList notes={notes} />
              <div className="flex items-center justify-center p-4 text-center text-zinc-500">
                <div>
                  <p className="mb-2 font-mono">Select a note or create a new one</p>
                  <p className="text-sm">Keep track of important information during your investigation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

