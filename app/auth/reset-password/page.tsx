import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import ResetPasswordForm from "@/components/auth/reset-password-form"

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: { token: string }
}) {
  const session = await getSession()

  if (session) {
    redirect("/")
  }

  if (!searchParams.token) {
    redirect("/auth")
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-mono text-3xl font-bold tracking-tighter text-white">RESET ACCESS</h1>
        <p className="mt-2 text-sm text-zinc-400">Enter your new access code</p>
      </div>

      <ResetPasswordForm token={searchParams.token} />

      <div className="mt-6 text-center text-xs text-zinc-600">
        <p>Choose a strong access code to protect your account.</p>
        <p className="mt-2">SYSTEM VERSION 2.4.1 // CLASSIFIED</p>
      </div>
    </>
  )
}

