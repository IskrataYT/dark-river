import Link from "next/link"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { format } from "date-fns"

export const metadata = {
  title: "Dark River | Account Banned",
  description: "Your account has been banned",
}

export default async function BannedPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get ban details
  await connectDB()
  const user = await User.findById(session.id)
  const banReason = user?.banReason || "Violation of terms of service"
  const bannedAt = user?.bannedAt ? format(new Date(user.bannedAt), "MMMM d, yyyy") : "Unknown date"

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="relative w-full max-w-md px-4 sm:px-6">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>
        <div className="relative z-10 overflow-hidden rounded-lg border border-red-800 bg-zinc-950 p-4 sm:p-6 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/20">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="font-mono text-3xl font-bold tracking-tighter text-white">ACCOUNT BANNED</h1>
            <p className="mt-2 text-sm text-zinc-400">Your access to Dark River has been suspended</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-md border border-red-800 bg-red-900/10 p-4">
              <p className="text-sm text-red-500 mb-2">
                <span className="font-bold">Reason:</span> {banReason}
              </p>
              <p className="text-sm text-red-500">
                <span className="font-bold">Date:</span> {bannedAt}
              </p>
            </div>

            <div className="text-center">
              <p className="mb-4 text-sm text-zinc-400">
                If you believe this is an error, please contact our support team for assistance.
              </p>
              <Link href="/contact">
                <Button variant="outline" className="border-zinc-800 font-mono hover:bg-zinc-900">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-zinc-600">
            <p>SYSTEM VERSION 2.4.1 // CLASSIFIED</p>
          </div>
        </div>
      </div>
    </main>
  )
}

