import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Authentication | Dark River",
  description: "Sign in or create a new account to access Dark River",
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="relative z-10 w-full max-w-md px-4">{children}</div>
    </main>
  )
}

