"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface FormData {
  name: string
  email: string
  password: string
}

export default function AuthForm() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  })
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [otp, setOTP] = useState("")

  const validatePasswords = () => {
    if (isSignUp && formData.password !== confirmPassword) {
      setPasswordError("Access codes do not match")
      return false
    }
    setPasswordError("")
    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
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
          email: formData.email,
          otp,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Verification failed")
      }

      // Redirect to dashboard on successful verification
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePasswords()) return

    setIsLoading(true)
    setError("")

    try {
      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/signin"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed")
      }

      if (isSignUp) {
        // Show OTP input after successful signup
        setShowOTPInput(true)
      } else {
        // Redirect to dashboard on successful signin
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (showOTPInput) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-zinc-800 bg-black p-4">
          <p className="font-mono text-sm text-white mb-4">Please enter the verification code sent to your email.</p>
          <form onSubmit={handleOTPSubmit} className="space-y-4">
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

  return (
    <div className="space-y-4">
      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded bg-zinc-800">
        <button
          onClick={() => {
            setIsSignUp(false)
            setError("")
          }}
          className={`relative font-mono text-sm font-medium transition-colors ${
            !isSignUp ? "bg-white py-3 text-black" : "bg-black py-3 text-zinc-500 hover:text-zinc-300"
          }`}
          type="button"
        >
          SIGN IN
          {!isSignUp && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />}
        </button>
        <button
          onClick={() => {
            setIsSignUp(true)
            setError("")
          }}
          className={`relative font-mono text-sm font-medium transition-colors ${
            isSignUp ? "bg-white py-3 text-black" : "bg-black py-3 text-zinc-500 hover:text-zinc-300"
          }`}
          type="button"
        >
          NEW AGENT
          {isSignUp && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="name" className="font-mono text-xs text-zinc-400">
              AGENT NAME
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your agent name"
                className="border-zinc-800 bg-black pl-10 font-mono text-sm text-white placeholder:text-zinc-700"
                required={isSignUp}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="font-mono text-xs text-zinc-400">
            EMAIL IDENTIFIER
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="agent@darkriver.net"
              className="border-zinc-800 bg-black pl-10 font-mono text-sm text-white placeholder:text-zinc-700"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="font-mono text-xs text-zinc-400">
            ACCESS CODE
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="border-zinc-800 bg-black pl-10 pr-10 font-mono text-sm text-white placeholder:text-zinc-700"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-mono text-xs text-zinc-400">
              CONFIRM ACCESS CODE
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="border-zinc-800 bg-black pl-10 pr-10 font-mono text-sm text-white placeholder:text-zinc-700"
                required={isSignUp}
              />
            </div>
          </div>
        )}

        {(passwordError || error) && <div className="text-xs text-red-500 font-mono">{passwordError || error}</div>}

        {!isSignUp && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              className="border-zinc-800 bg-black data-[state=checked]:bg-white data-[state=checked]:text-black"
            />
            <Label htmlFor="remember" className="text-xs text-zinc-400">
              Remember terminal
            </Label>
          </div>
        )}

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
              {isSignUp ? "CREATE ACCESS" : "AUTHENTICATE"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      {!isSignUp && (
        <div className="text-center">
          <Link href="/forgot-password" className="text-xs text-zinc-600 transition-colors hover:text-white">
            Forgot access code?
          </Link>
        </div>
      )}
    </div>
  )
}

