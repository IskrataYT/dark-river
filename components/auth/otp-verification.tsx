"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface OTPVerificationProps {
  email: string
  onSuccess: () => void
}

export default function OTPVerification({ email, onSuccess }: OTPVerificationProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [otp, setOTP] = useState("")
  const [resendDisabled, setResendDisabled] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

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
        throw new Error(data.error || "Неуспешна проверка")
      }

      // Call onSuccess callback instead of directly redirecting
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Нещо се обърка")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendDisabled) return

    setResendDisabled(true)
    setError("")

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification code")
      }

      // Start countdown for 60 seconds
      setResendCountdown(60)
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setResendDisabled(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setResendDisabled(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-800 bg-black p-4">
        <p className="font-mono text-sm text-white mb-4">Моля, въведете кода за проверка, изпратен на вашия имейл.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="font-mono text-xs text-zinc-400">
              КОД ЗА ПРОВЕРКА
            </Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              placeholder="Въведете 6-цифрен код"
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
                <span className="mr-2">ОБРАБОТКА</span>
                <span className="loading">...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center">
                ПОТВЪРЖДАВАНЕ
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendDisabled}
              className="text-xs text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
            >
              {resendCountdown > 0 ? `Изпрати отново (${resendCountdown}s)` : "Не получихте код? Изпрати отново"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

