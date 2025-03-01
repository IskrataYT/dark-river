"use client"

import type React from "react"
import { useRouter } from "next/navigation"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface OTPVerificationProps {
  email: string
  onSuccess: () => void
}

export function OTPVerification({ email, onSuccess }: OTPVerificationProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [otp, setOTP] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Verification failed")
      }

      // Redirect to loading page instead of calling onSuccess directly
      router.push("/loading?redirectTo=/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-800 bg-black p-4">
        <p className="font-mono text-sm text-white mb-4">Please enter the verification code sent to your email.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="font-mono text-xs text-zinc-400">
              VERIFICATION CODE
            </Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              placeholder="Enter 6-digit code"
              className="border-zinc-800 bg-black font-mono text-sm text-white placeholder:text-zinc-700"
              required
              maxLength={6}
              pattern="\d{6}"
            />
          </div>
          {error && <div className="text-xs text-red-500 font-mono">{error}</div>}
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
                VERIFY
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

