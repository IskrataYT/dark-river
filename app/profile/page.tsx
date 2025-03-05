import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/layout/navbar"
import { ProfileForm } from "@/components/profile/profile-form"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "Dark River | Профил",
  description: "Управлявайте вашия профил в Dark River - актуализирайте информацията за вашия агент",
}

export default async function Profile() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <>
      <Navbar userName={session.name} isAdmin={session.isAdmin} isDonor={session.isDonor} />
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <div className="relative w-full max-w-md px-4">
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>
          <div className="relative z-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-6 text-center">
              <h1 className="font-mono text-3xl font-bold tracking-tighter text-white">AGENT PROFILE</h1>
              <p className="mt-2 text-sm text-zinc-400">Update your credentials</p>
            </div>

            <ProfileForm initialName={session.name} userEmail={session.email} />

            <div className="mt-6 text-center text-xs text-zinc-600">
              <p>Keep your access codes secure and regularly updated.</p>
              <p className="mt-2">SYSTEM VERSION 2.4.1 // CLASSIFIED</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

