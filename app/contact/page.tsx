import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ContactForm } from "@/components/contact/contact-form"

export const metadata = {
  title: "Dark River | Контакт",
  description: "Свържете се с екипа на Dark River",
}

export default async function ContactPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <>
      <Navbar userName={session.name} isAdmin={session.isAdmin} isDonor={session.isDonor} />
      <main className="flex min-h-screen flex-col bg-black p-4 text-white">
        <div className="mx-auto w-full max-w-2xl flex-1 py-20">
          <div className="mb-8 text-center">
            <h1 className="font-mono text-4xl font-bold tracking-tighter text-white">СВЪРЖЕТЕ СЕ С НАС</h1>
            <p className="mt-2 text-zinc-400">Изпратете съобщение до екипа на Dark River</p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
            <ContactForm userEmail={session.email} userName={session.name} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

