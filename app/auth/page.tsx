import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import AuthForm from "@/components/auth/auth-form"

export default async function AuthPage() {
  const session = await getSession()

  if (session) {
    redirect("/")
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-mono text-3xl font-bold tracking-tighter text-white">DARK RIVER</h1>
        <p className="mt-2 text-sm text-zinc-400">Access the terminal to begin your investigation</p>
      </div>

      <AuthForm />

      <div className="mt-6 text-center text-xs text-zinc-600">
        <p>By accessing this terminal, you agree to the terms of the investigation.</p>
        <p className="mt-2">SYSTEM VERSION 2.4.1 // CLASSIFIED</p>
      </div>
    </>
  )
}

