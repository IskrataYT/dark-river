import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { StageManager } from "@/components/admin/stage-manager"

export default async function AdminStages() {
  const session = await getSession()

  if (!session?.isAdmin) {
    redirect("/")
  }

  return (
    <>
      <Navbar userName={session.name} isAdmin={session.isAdmin} />
      <main className="flex min-h-screen flex-col bg-black p-4 text-white">
        <div className="mx-auto w-full max-w-6xl flex-1 py-20">
          <StageManager />
        </div>
      </main>
      <Footer />
    </>
  )
}

