"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset link")
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-zinc-800 bg-black p-4">
          <p className="font-mono text-sm text-white">
            If an account exists for the provided email, you will receive a password reset link shortly.
          </p>
        </div>
        <Link href="/auth">
          <Button className="w-full bg-white font-mono text-sm text-black transition-colors hover:bg-zinc-200">
            <ArrowLeft className="mr-2 h-4 w-4" />
            RETURN TO LOGIN
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-mono text-xs text-zinc-400">
            EMAIL IDENTIFIER
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@darkriver.net"
              className="border-zinc-800 bg-black pl-10 font-mono text-sm text-white placeholder:text-zinc-700"
              required
            />
          </div>
        </div>

        {error && <div className="text-xs text-red-500 font-mono">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <Link href="/auth">
            <Button
              type="button"
              variant="outline"
              className="w-full border-zinc-800 bg-transparent font-mono text-sm text-white hover:bg-zinc-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              BACK
            </Button>
          </Link>

          <Button
            type="submit"
            className="w-full bg-white font-mono text-sm text-black transition-colors hover:bg-zinc-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="mr-2">PROCESSING</span>
                <span className="loading">...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center">
                SEND
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

