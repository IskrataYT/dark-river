import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { CommunityChat } from "@/components/community/community-chat"

export const metadata = {
  title: "Dark River | Community",
  description: "Join the Dark River community chat",
}

export default async function CommunityPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <>
      <Navbar userName={session.name} isAdmin={session.isAdmin} />
      <main className="flex min-h-screen flex-col bg-black p-4 text-white">
        <div className="mx-auto w-full max-w-7xl flex-1 py-20">
          <div className="h-[calc(100vh-12rem)] rounded-lg border border-zinc-800 bg-zinc-950">
            <CommunityChat
              userId={session.id}
              userName={session.name}
              isAdmin={session.isAdmin || false}
              isModerator={session.isModerator || false}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

