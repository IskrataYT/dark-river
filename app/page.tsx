import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default async function Home() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <>
      <Navbar userName={session.name} isAdmin={session.isAdmin} />
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <div className="w-full max-w-4xl px-4 py-20">
          <div className="mb-12 text-center">
            <h1 className="font-mono text-5xl font-bold tracking-tighter text-white">DARK RIVER</h1>
          </div>

          <div className="space-y-6 text-center">
            <h2 className="font-mono text-3xl font-bold tracking-tighter text-white">Welcome, {session.name}</h2>
            <p className="text-lg text-zinc-400">Your investigation into the depths of Dark River begins here.</p>
            <div className="space-y-4 text-sm text-zinc-500">
              <p>
                As an agent in this mysterious digital realm, you'll uncover secrets, decode messages, and piece
                together a complex web of information.
              </p>
              <p>
                Navigate through encrypted communications, analyze data trails, and discover the truth that lies beneath
                the surface.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

