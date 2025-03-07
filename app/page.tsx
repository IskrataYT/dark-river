import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { FileText, Users, Shield, ChevronRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

// Dynamically import components that aren't needed for initial render
const AnimatedTerminal = dynamic(() => import("@/components/home/animated-terminal"), {
  ssr: false,
  loading: () => (
    <div className="relative rounded-lg border border-zinc-800 bg-black p-4 h-64">
      <div className="font-mono text-sm text-green-500">Loading terminal...</div>
    </div>
  ),
})

export const metadata = {
  title: "Dark River | Начало",
  description: "Добре дошли в Dark River - интерактивно разследване с мистериозни съобщения и загадки",
}

export default async function Home() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <>
      <Navbar userName={session.name} isAdmin={session.isAdmin} isDonor={session.isDonor} />
      <main className="flex min-h-screen flex-col bg-black text-white">
        {/* Hero Section with clean gradient - Optimized */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>

          {/* Clean gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900"></div>

          {/* Removed grid lines to improve rendering performance */}

          {/* Reduced blur radius for better performance */}
          <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-green-500/5 blur-xl"></div>
          <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-blue-500/5 blur-xl"></div>

          <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
            <div className="text-center">
              <h1 className="heading-font text-5xl sm:text-6xl font-bold tracking-tight text-white mb-6">
                <span className="inline-block">DARK</span>{" "}
                <span className="inline-block relative">
                  RIVER
                  <span className="absolute -bottom-2 left-0 h-1 w-full bg-gradient-to-r from-green-600 to-blue-600"></span>
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg sm:text-xl text-zinc-400 mb-8 body-font">
                Добре дошли, <span className="text-green-500 font-semibold">{session.name}</span>. Вашето разследване в
                дълбините на тайните започва тук.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/terminal">
                  <Button className="bg-white text-black hover:bg-zinc-200 font-mono">
                    ЗАПОЧНИ РАЗСЛЕДВАНЕТО
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/how-to-play">
                  <Button variant="outline" className="border-zinc-700 hover:bg-zinc-900 font-mono">
                    КАК ДА ИГРАЯ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Terminal section with different call to action - Optimized */}
        <section className="relative py-16 bg-zinc-950">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="heading-font text-3xl font-bold tracking-tight text-white mb-4">КРИПТИРАНИ СЪОБЩЕНИЯ</h2>
                <p className="text-zinc-400 mb-6 body-font">
                  Разкодирайте тайни съобщения, анализирайте данни и разкрийте истината, която лежи под повърхността.
                  Всяко съобщение ви приближава към разкриването на мистерията.
                </p>
                <Link href="/notes">
                  <Button variant="outline" className="border-zinc-700 hover:bg-zinc-900 font-mono">
                    <FileText className="mr-2 h-4 w-4" />
                    ЗАПИСВАЙТЕ БЕЛЕЖКИ
                  </Button>
                </Link>
              </div>

              {/* Dynamically loaded terminal animation */}
              <AnimatedTerminal userName={session.name} />
            </div>
          </div>
        </section>

        {/* Features section - Optimized */}
        <section className="py-16 bg-black">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <h2 className="heading-font text-2xl font-bold tracking-tight text-white mb-12 text-center">
              ФУНКЦИИ НА СИСТЕМАТА
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group rounded-lg border border-zinc-800 bg-zinc-950 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/50">
                <div className="mb-4 rounded-full bg-zinc-900 p-3 w-12 h-12 flex items-center justify-center group-hover:bg-zinc-800">
                  <Mail className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="heading-font text-lg font-bold text-white mb-2">Съобщения</h3>
                <p className="text-sm text-zinc-400 body-font">
                  Получавайте и изпращайте криптирани съобщения, които разкриват следващите стъпки от разследването.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group rounded-lg border border-zinc-800 bg-zinc-950 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/50">
                <div className="mb-4 rounded-full bg-zinc-900 p-3 w-12 h-12 flex items-center justify-center group-hover:bg-zinc-800">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="heading-font text-lg font-bold text-white mb-2">Бележки</h3>
                <p className="text-sm text-zinc-400 body-font">
                  Записвайте важна информация и улики в личните си бележки, за да следите напредъка си.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group rounded-lg border border-zinc-800 bg-zinc-950 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/50">
                <div className="mb-4 rounded-full bg-zinc-900 p-3 w-12 h-12 flex items-center justify-center group-hover:bg-zinc-800">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="heading-font text-lg font-bold text-white mb-2">Общност</h3>
                <p className="text-sm text-zinc-400 body-font">
                  Свържете се с други агенти, обсъдете теории и стратегии в защитени канали за комуникация.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action - Optimized */}
        <section className="relative py-16 bg-gradient-to-b from-zinc-950 to-black">
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5"></div>
          <div className="relative mx-auto max-w-5xl px-6 lg:px-8 text-center">
            <h2 className="heading-font text-3xl font-bold tracking-tight text-white mb-6">
              ГОТОВИ ЛИ СТЕ ДА РАЗКРИЕТЕ ИСТИНАТА?
            </h2>
            <p className="mx-auto max-w-2xl text-zinc-400 mb-8 body-font">
              Всяка стъпка ви приближава към разкриването на мистерията. Бъдете внимателни, бъдете методични, бъдете
              упорити.
            </p>
            <Link href="/terminal">
              <Button className="bg-white text-black hover:bg-zinc-200 font-mono">
                <Shield className="mr-2 h-4 w-4" />
                ПРОДЪЛЖЕТЕ МИСИЯТА
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

