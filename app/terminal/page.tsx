import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { EmailClient } from "@/components/email/email-client"
import { Countdown } from "@/lib/models/countdown"
import { CountdownTimer } from "@/components/countdown-timer"
import connectDB from "@/lib/db"

export const metadata = {
  title: "Dark River | Терминал",
  description: "Достъп до комуникационния терминал на Dark River - разкрийте мистерията чрез съобщения",
}

export default async function Terminal() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  // Fetch active countdown if any
  await connectDB()
  const countdown = await Countdown.findOne({ isActive: true }).sort({ createdAt: -1 })

  return (
    <>
      <Navbar userName={session.name} isAdmin={session.isAdmin} isDonor={session.isDonor} />
      <main className="flex min-h-screen flex-col bg-black p-4 text-white">
        <div className="mx-auto w-full max-w-6xl flex-1 py-20">
          {countdown && (
            <CountdownTimer
              endTime={countdown.endTime.toISOString()}
              message={countdown.message}
              isActive={countdown.isActive}
            />
          )}
          <EmailClient />
        </div>
      </main>
      <Footer />
    </>
  )
}

