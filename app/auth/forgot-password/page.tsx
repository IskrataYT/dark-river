import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"

export default async function ForgotPassword() {
  const session = await getSession()

  if (session) {
    redirect("/")
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-mono text-3xl font-bold tracking-tighter text-white">RESET ACCESS</h1>
        <p className="mt-2 text-sm text-zinc-400">Enter your email to receive reset instructions</p>
      </div>

      <ForgotPasswordForm />

      <div className="mt-6 text-center text-xs text-zinc-600">
        <p>A reset code will be sent to your registered email address.</p>
        <p className="mt-2">SYSTEM VERSION 2.4.1 // CLASSIFIED</p>
      </div>
    </>
  )
}

