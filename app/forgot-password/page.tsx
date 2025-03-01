import type { Metadata } from "next"
import ForgotPasswordForm from "@/components/forgot-password-form"

export const metadata: Metadata = {
  title: "Dark River | Reset Access",
  description: "Reset your access code to Dark River.",
}

export default function ForgotPassword() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="relative w-full max-w-md px-4">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>
        <div className="relative z-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="font-mono text-3xl font-bold tracking-tighter text-white">RESET ACCESS</h1>
            <p className="mt-2 text-sm text-zinc-400">Enter your email to receive reset instructions</p>
          </div>

          <ForgotPasswordForm />

          <div className="mt-6 text-center text-xs text-zinc-600">
            <p>A reset link will be sent to your registered email address.</p>
            <p className="mt-2">SYSTEM VERSION 2.4.1 // CLASSIFIED</p>
          </div>
        </div>
      </div>
    </main>
  )
}

