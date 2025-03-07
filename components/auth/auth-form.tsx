"use client"

import type * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import dynamic from "next/dynamic"

// Dynamically import OTP verification component
const OTPVerification = dynamic(() => import("@/components/auth/otp-verification"), {
  loading: () => <div className="p-4 text-center text-zinc-400">Loading verification...</div>,
})

// Add MFAVerification component import
const MFAVerification = dynamic(() => import("@/components/auth/mfa-verification"), {
  loading: () => <div className="p-4 text-center text-zinc-400">Loading verification...</div>,
})

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
  const [verificationEmail, setVerificationEmail] = useState("")

  // Add these state variables to the AuthForm component
  const [showMFAInput, setShowMFAInput] = useState(false)
  const [mfaData, setMfaData] = useState<{ userId: string; factorIds: string[] } | null>(null)

  // Update the state to include MFA information
  const [mfaInfo, setMfaInfo] = useState<{
    userId: string
    factors: Array<{ id: string; type: string }>
    methods: { email: boolean; totp: boolean; backupCodes: boolean }
  } | null>(null)

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

  // Modify the handleSubmit function to handle MFA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMfaInfo(null) // Reset MFA info

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      // Check if MFA is required
      if (data.mfaRequired) {
        setMfaInfo({
          userId: data.userId,
          factors: data.factors || [],
          methods: data.methods || { email: false, totp: false, backupCodes: false },
        })
        return
      }

      // Redirect to dashboard on successful login
      router.push("/loading?redirectTo=/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  // Add this condition before the return statement
  if (showMFAInput && mfaData) {
    return (
      <MFAVerification
        userId={mfaData.userId}
        factorIds={mfaData.factorIds}
        onSuccess={() => {
          router.push("/loading?redirectTo=/")
        }}
      />
    )
  }

  if (showOTPInput && verificationEmail) {
    return (
      <OTPVerification
        email={verificationEmail}
        onSuccess={() => {
          router.push("/loading?redirectTo=/")
        }}
      />
    )
  }

  // Update the render function to include MFA verification
  // Replace the existing return statement with this one
  return (
    <div className="space-y-4">
      {!mfaInfo ? (
        <div className="rounded-lg border border-zinc-800 bg-black p-4">
          <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded bg-zinc-800 text-xs sm:text-sm">
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
              ВХОД
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
              НОВ АГЕНТ
              {isSignUp && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="font-mono text-xs text-zinc-400">
                  ИМЕ НА АГЕНТА
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Въведете вашето име на агент"
                    className="border-zinc-800 bg-black pl-10 font-mono text-sm text-white placeholder:text-zinc-700"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-xs text-zinc-400">
                ИМЕЙЛ ИДЕНТИФИКАТОР
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
                КОД ЗА ДОСТЪП
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
                  ПОТВЪРДИ КОД ЗА ДОСТЪП
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
                  Запомни терминал
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
                  <span className="mr-2">ОБРАБОТКА</span>
                  <span className="loading">...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  {isSignUp ? (
                    <>
                      <span className="hidden sm:inline">СЪЗДАЙ ДОСТЪП</span>
                      <span className="sm:hidden">РЕГИСТРАЦИЯ</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">УДОСТОВЕРЯВАНЕ</span>
                      <span className="sm:hidden">ВХОД</span>
                    </>
                  )}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
          {!isSignUp && (
            <div className="text-center">
              <Link href="/auth/forgot-password" className="text-xs text-zinc-600 transition-colors hover:text-white">
                Забравен код за достъп?
              </Link>
            </div>
          )}
        </div>
      ) : (
        <MFAVerification
          userId={mfaInfo.userId}
          factors={mfaInfo.factors}
          methods={mfaInfo.methods}
          onSuccess={() => router.push("/loading?redirectTo=/")}
        />
      )}
    </div>
  )
}

