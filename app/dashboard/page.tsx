import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default async function Dashboard() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <>
      <Navbar userName={session.name} />
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <div className="w-full max-w-4xl px-4 py-20">
          <div className="mb-12 text-center">
            <h1 className="font-mono text-5xl font-bold tracking-tighter text-white">DASHBOARD</h1>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="font-mono text-xl font-bold text-white mb-4">Welcome, Agent {session.name}</h2>
              <p className="text-zinc-400">Your mission briefing will appear here.</p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded border border-zinc-800 p-4">
                  <h3 className="font-mono text-sm font-bold text-white mb-2">ACTIVE INVESTIGATIONS</h3>
                  <p className="text-zinc-500 text-sm">No active investigations</p>
                </div>

                <div className="rounded border border-zinc-800 p-4">
                  <h3 className="font-mono text-sm font-bold text-white mb-2">RECENT ACTIVITY</h3>
                  <p className="text-zinc-500 text-sm">No recent activity</p>
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

