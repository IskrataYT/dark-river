import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getNotes } from "@/lib/actions/note-actions"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { NoteList } from "@/components/notes/note-list"

export const metadata = {
  title: "Dark River | Бележки от разследването",
  description: "Следете вашите бележки от разследването в Dark River - организирайте улики и информация",
}

export default async function NotesPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  const notes = await getNotes()

  return (
    <>
      <Navbar userName={session.name} isAdmin={session.isAdmin} isDonor={session.isDonor} />
      <main className="flex min-h-screen flex-col bg-black p-4 text-white">
        <div className="mx-auto w-full max-w-6xl flex-1 py-20">
          <div className="h-[calc(100vh-12rem)] rounded-lg border border-zinc-800 bg-zinc-950">
            <div className="grid h-full grid-cols-1 md:grid-cols-[300px,1fr]">
              <NoteList notes={notes} />
              <div className="hidden md:flex items-center justify-center p-4 text-center text-zinc-500">
                <div>
                  <p className="mb-2 font-mono">Изберете бележка или създайте нова</p>
                  <p className="text-sm">Следете важната информация по време на разследването</p>
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

