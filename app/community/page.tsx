import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { CommunityChat } from "@/components/community/community-chat"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Dark River | Общност",
  description: "Присъединете се към общността на Dark River - обсъдете теории и стратегии с други агенти",
}

export default async function CommunityPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <>
      <Navbar userName={session.name} isAdmin={session.isAdmin} isDonor={session.isDonor} />
      <main className="flex min-h-screen flex-col bg-black p-4 text-white">
        <div className="mx-auto w-full max-w-7xl flex-1 py-12 sm:py-20">
          <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-zinc-400 text-center sm:text-left">
                С използването на платформата за общност на Dark River, вие се съгласявате да следвате нашите правила и
                насоки. Нарушаването на тези правила може да доведе до временно или постоянно прекратяване на
                привилегиите за съобщения.
              </p>
              <Link href="/rules" className="shrink-0">
                <Button variant="outline" size="sm">
                  Прочети правилата
                </Button>
              </Link>
            </div>
          </div>

          <div className="h-[calc(100vh-16rem)] md:h-[calc(100vh-12rem)] rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
            <CommunityChat
              userId={session.id}
              userName={session.name}
              isAdmin={session.isAdmin}
              isModerator={session.isModerator || false}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

