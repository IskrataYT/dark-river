import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import AuthForm from "@/components/auth/auth-form"

export default async function AuthPage() {
  const session = await getSession()

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-mono text-3xl font-bold tracking-tighter text-white">DARK RIVER</h1>
          <p className="mt-2 text-sm text-zinc-400">Влезте в терминала, за да започнете разследването</p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-black p-6">
          <AuthForm />
        </div>

        <div className="mt-6 text-center text-xs text-zinc-600">
          <p>С достъпа до този терминал се съгласявате с условията на разследването.</p>
          <p className="mt-2">ВЕРСИЯ НА СИСТЕМАТА 2.4.1 // ПОВЕРИТЕЛНО</p>
        </div>
      </div>
    </div>
  )
}

