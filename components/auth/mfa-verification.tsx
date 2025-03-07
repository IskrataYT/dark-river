"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { ArrowRight, Mail, Shield, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MFAVerificationProps {
  userId: string
  factors: Array<{
    id: string
    type: string
  }>
  methods: {
    email: boolean
    totp: boolean
    backupCodes: boolean
  }
  onSuccess: () => void
}

export default function MFAVerification({ userId, factors, methods, onSuccess }: MFAVerificationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [code, setCode] = useState("")
  const [backupCode, setBackupCode] = useState("")

  // Find default tab based on available methods
  const defaultTab = methods.email ? "email" : methods.totp ? "totp" : "backup"
  const [activeTab, setActiveTab] = useState<string>(defaultTab)

  // Find factors by type
  const emailFactor = factors.find((f) => f.type === "email")
  const totpFactor = factors.find((f) => f.type === "totp")

  // State for email OTP
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailOtpLoading, setEmailOtpLoading] = useState(false)

  // Request email OTP
  const requestEmailOTP = useCallback(async () => {
    if (!emailFactor) return

    setEmailOtpLoading(true)
    setError("")

    try {
      const response = await fetch("/api/user/mfa/generate-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          factorId: emailFactor.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Неуспешно изпращане на код за потвърждение")
      }

      setEmailOtpSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Възникна грешка")
    } finally {
      setEmailOtpLoading(false)
    }
  }, [emailFactor, userId])

  // Removed auto-request email OTP when component mounts
  // Now the user must click the button to request the code

  // Verify code (email or TOTP)
  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const factorId = activeTab === "email" ? emailFactor?.id : totpFactor?.id

      if (!factorId) {
        throw new Error("Методът за удостоверяване не е наличен")
      }

      const response = await fetch("/api/auth/mfa-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          factorId,
          code,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Неуспешно потвърждение")
      }

      // Call onSuccess callback
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Възникна грешка")
    } finally {
      setIsLoading(false)
    }
  }

  // Verify backup code
  const verifyBackupCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-backup-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          code: backupCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Неуспешно потвърждение")
      }

      // Call onSuccess callback
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Възникна грешка")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setError("")

    // Reset email OTP state when switching away from email tab
    if (value !== "email") {
      setEmailOtpSent(false)
    }
  }

  // If no methods are available, show an error
  if (!methods.email && !methods.totp && !methods.backupCodes) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-black p-4">
        <p className="font-mono text-sm text-red-500 mb-4">
          Няма налични методи за удостоверяване. Моля, свържете се с администратор.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-800 bg-black p-4">
        <p className="font-mono text-sm text-white mb-4">Моля, потвърдете самоличността си, за да продължите.</p>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-zinc-900 overflow-hidden">
            {methods.email && (
              <TabsTrigger
                value="email"
                className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white px-2 py-1.5 flex items-center justify-center text-xs sm:text-sm"
              >
                <Mail className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Имейл</span>
              </TabsTrigger>
            )}
            {methods.totp && (
              <TabsTrigger
                value="totp"
                className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white px-2 py-1.5 flex items-center justify-center text-xs sm:text-sm"
              >
                <Shield className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Приложение</span>
              </TabsTrigger>
            )}
            {methods.backupCodes && (
              <TabsTrigger
                value="backup"
                className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white px-2 py-1.5 flex items-center justify-center text-xs sm:text-sm"
              >
                <Key className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Резервен код</span>
              </TabsTrigger>
            )}
          </TabsList>

          {methods.email && (
            <TabsContent value="email" className="mt-4">
              {!emailOtpSent ? (
                <div className="text-center py-4">
                  <p className="text-sm text-zinc-400 mb-4">Ще изпратим код за потвърждение на вашия имейл адрес.</p>
                  <Button onClick={requestEmailOTP} disabled={emailOtpLoading} className="w-full">
                    {emailOtpLoading ? "Изпращане..." : "Изпрати код"}
                  </Button>
                </div>
              ) : (
                <form onSubmit={verifyCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-code" className="font-mono text-xs text-zinc-400">
                      КОД ОТ ИМЕЙЛ
                    </Label>
                    <Input
                      id="email-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Въведете 6-цифрен код"
                      className="border-zinc-800 bg-black font-mono text-sm text-white placeholder:text-zinc-700"
                      required
                      maxLength={6}
                      pattern="\d{6}"
                    />
                    <p className="text-xs text-zinc-500">Проверете вашия имейл за код за потвърждение.</p>
                  </div>
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
                  <Button
                    type="button"
                    variant="link"
                    onClick={requestEmailOTP}
                    disabled={emailOtpLoading}
                    className="w-full text-xs text-zinc-500"
                  >
                    {emailOtpLoading ? "Изпращане..." : "Изпрати отново"}
                  </Button>
                </form>
              )}
            </TabsContent>
          )}

          {methods.totp && (
            <TabsContent value="totp" className="mt-4">
              <form onSubmit={verifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totp-code" className="font-mono text-xs text-zinc-400">
                    КОД ОТ ПРИЛОЖЕНИЕТО
                  </Label>
                  <Input
                    id="totp-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Въведете 6-цифрен код"
                    className="border-zinc-800 bg-black font-mono text-sm text-white placeholder:text-zinc-700"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                  />
                  <p className="text-xs text-zinc-500">Въведете кода от вашето приложение за удостоверяване.</p>
                </div>
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
              </form>
            </TabsContent>
          )}

          {methods.backupCodes && (
            <TabsContent value="backup" className="mt-4">
              <form onSubmit={verifyBackupCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backup-code" className="font-mono text-xs text-zinc-400">
                    РЕЗЕРВЕН КОД
                  </Label>
                  <Input
                    id="backup-code"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
                    className="border-zinc-800 bg-black font-mono text-sm text-white placeholder:text-zinc-700"
                    required
                  />
                  <p className="text-xs text-zinc-500">Въведете един от вашите резервни кодове за достъп.</p>
                </div>
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
              </form>
            </TabsContent>
          )}
        </Tabs>

        {error && <div className="text-xs text-red-500 font-mono mt-4">{error}</div>}
      </div>
    </div>
  )
}

