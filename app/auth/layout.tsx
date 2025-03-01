import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dark River | Authentication",
  description: "Sign in to Dark River and begin your investigation.",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="relative w-full max-w-md px-4">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>
        <div className="relative z-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
          {children}
        </div>
      </div>
    </main>
  )
}

