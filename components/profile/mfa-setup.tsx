"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Check, X, Mail, Smartphone, Key, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function MFASetup() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [factors, setFactors] = useState<any[]>([])
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  // Setup states
  const [setupOpen, setSetupOpen] = useState(false)
  const [setupStep, setSetupStep] = useState(1)
  const [setupData, setSetupData] = useState<{
    factorId?: string
    secret?: string
    qrCode?: string
  }>({})
  const [verificationCode, setVerificationCode] = useState("")
  const [setupTab, setSetupTab] = useState("email")

  // Email OTP states
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailOtpLoading, setEmailOtpLoading] = useState(false)

  // Disable states
  const [disableOpen, setDisableOpen] = useState(false)
  const [password, setPassword] = useState("")

  // Backup codes dialog
  const [backupCodesOpen, setBackupCodesOpen] = useState(false)

  // Add factor dialog
  const [addFactorOpen, setAddFactorOpen] = useState(false)

  // Fetch MFA status
  const fetchMFAStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/user/mfa/status")

      if (!response.ok) {
        throw new Error("Неуспешно зареждане на статус на 2FA")
      }

      const data = await response.json()
      setMfaEnabled(data.mfaEnabled)
      setFactors(data.factors || [])

      if (data.backupCodes) {
        setBackupCodes(data.backupCodes)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Възникна грешка")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMFAStatus()
  }, [fetchMFAStatus])

  // Setup MFA - Email OTP
  const setupEmailOTP = async () => {
    try {
      setError("")
      setEmailOtpLoading(true)

      const response = await fetch("/api/user/mfa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "email",
        }),
      })

      if (!response.ok) {
        throw new Error("Неуспешно настройване на имейл OTP")
      }

      const data = await response.json()

      // Fetch backup codes
      await fetchMFAStatus()

      // Show backup codes
      setBackupCodesOpen(true)
      setAddFactorOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Възникна грешка")
    } finally {
      setEmailOtpLoading(false)
    }
  }

  // Setup MFA - TOTP
  const startTOTPSetup = async () => {
    try {
      setError("")
      setSetupStep(1)
      setSetupOpen(true)

      const response = await fetch("/api/user/mfa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "totp",
        }),
      })

      if (!response.ok) {
        throw new Error("Неуспешно настройване на приложение за удостоверяване")
      }

      const data = await response.json()
      setSetupData({
        factorId: data.factorId,
        secret: data.secret,
        qrCode: data.qrCode,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Възникна грешка")
      setSetupOpen(false)
    }
  }

  // Verify TOTP setup
  const verifyTOTPSetup = async () => {
    try {
      setError("")

      const response = await fetch("/api/user/mfa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          factorId: setupData.factorId,
          code: verificationCode,
        }),
      })

      if (!response.ok) {
        throw new Error("Невалиден код за потвърждение")
      }

      setSetupStep(2)
      fetchMFAStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Възникна грешка")
    }
  }

  // Disable MFA
  const disableMFA = async () => {
    try {
      setError("")

      const response = await fetch("/api/user/mfa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      })

      if (!response.ok) {
        throw new Error("Неуспешно деактивиране на 2FA")
      }

      setDisableOpen(false)
      setPassword("")
      fetchMFAStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Възникна грешка")
    }
  }

  // Get factor by type
  const getFactorByType = (type: string) => {
    return factors.find((f) => f.type === type)
  }

  // Check if factor exists
  const hasFactorType = (type: string) => {
    return factors.some((f) => f.type === type)
  }

  // Format date to Bulgarian format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-white">Двуфакторна автентикация</h3>
          <p className="text-sm text-zinc-400">Добавете допълнителен слой защита към вашия акаунт</p>
        </div>
        {mfaEnabled ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setAddFactorOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Добави метод</span>
              <span className="sm:hidden">Добави</span>
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDisableOpen(true)}
              className="bg-red-900 hover:bg-red-800 text-white w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Деактивирай</span>
              <span className="sm:hidden">Изключи</span>
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="email" className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" onClick={() => setSetupTab("email")}>
                <Mail className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Имейл</span>
                <span className="sm:hidden">Имейл</span>
              </TabsTrigger>
              <TabsTrigger value="totp" onClick={() => setSetupTab("totp")}>
                <Smartphone className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Приложение</span>
                <span className="sm:hidden">Прил.</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="mt-4">
              <Button onClick={setupEmailOTP} disabled={emailOtpLoading} className="w-full">
                {emailOtpLoading ? "Активиране..." : "Активирай с имейл"}
              </Button>
            </TabsContent>
            <TabsContent value="totp" className="mt-4">
              <Button onClick={startTOTPSetup} className="w-full">
                Активирай с приложение
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {mfaEnabled && (
        <div className="space-y-4">
          <div className="rounded-md border border-green-800 bg-green-950/30 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-400">Двуфакторната автентикация е активирана</h3>
                <div className="mt-2 text-sm text-zinc-400">
                  <p>
                    Вашият акаунт е защитен с двуфакторна автентикация. Ще бъдете помолени да въведете код при влизане
                    от нови устройства.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFactorByType("email") && (
              <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Mail className="h-5 w-5 mr-2" />
                    Имейл OTP
                  </CardTitle>
                  <CardDescription>Получавайте кодове за потвърждение на вашия имейл</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400">
                    Активирано на {formatDate(getFactorByType("email").createdAt)}
                  </p>
                </CardContent>
              </Card>
            )}

            {getFactorByType("totp") && (
              <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Smartphone className="h-5 w-5 mr-2" />
                    Приложение за удостоверяване
                  </CardTitle>
                  <CardDescription>Генерирайте кодове с вашето приложение</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400">Активирано на {formatDate(getFactorByType("totp").createdAt)}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Button variant="outline" onClick={() => setBackupCodesOpen(true)} className="w-full">
            <Key className="h-4 w-4 mr-2" />
            Покажи резервни кодове
          </Button>
        </div>
      )}

      {/* Add Factor Dialog */}
      <Dialog open={addFactorOpen} onOpenChange={setAddFactorOpen}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Добавяне на метод за автентикация</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Изберете допълнителен метод за двуфакторна автентикация
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {!hasFactorType("email") && (
                <Card
                  className="bg-zinc-900 border-zinc-800 cursor-pointer hover:bg-zinc-800 transition"
                  onClick={setupEmailOTP}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Mail className="h-5 w-5 mr-2" />
                      Имейл OTP
                    </CardTitle>
                    <CardDescription>Получавайте кодове за потвърждение на вашия имейл</CardDescription>
                  </CardHeader>
                </Card>
              )}

              {!hasFactorType("totp") && (
                <Card
                  className="bg-zinc-900 border-zinc-800 cursor-pointer hover:bg-zinc-800 transition"
                  onClick={() => {
                    setAddFactorOpen(false)
                    startTOTPSetup()
                  }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Smartphone className="h-5 w-5 mr-2" />
                      Приложение за удостоверяване
                    </CardTitle>
                    <CardDescription>Генерирайте кодове с вашето приложение за удостоверяване</CardDescription>
                  </CardHeader>
                </Card>
              )}

              {hasFactorType("email") && hasFactorType("totp") && (
                <div className="text-center text-zinc-400 p-4">
                  <p>Всички методи за автентикация са активирани.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setAddFactorOpen(false)}>
                Затвори
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* TOTP Setup Dialog */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {setupStep === 1 ? "Настройка на приложение за удостоверяване" : "Настройката е завършена"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {setupStep === 1
                ? "Сканирайте QR кода с вашето приложение за автентикация"
                : "Двуфакторната автентикация е успешно активирана"}
            </DialogDescription>
          </DialogHeader>

          {setupStep === 1 ? (
            <div className="space-y-4">
              {setupData.qrCode && (
                <div className="flex justify-center">
                  <div className="bg-white p-2 rounded-md">
                    <img src={setupData.qrCode || "/placeholder.svg"} alt="QR Code" width={200} height={200} />
                  </div>
                </div>
              )}

              {setupData.secret && (
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Ключ за ръчно въвеждане</Label>
                  <div className="font-mono text-sm bg-zinc-900 p-2 rounded-md text-white break-all">
                    {setupData.secret}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="verificationCode" className="text-xs text-zinc-400">
                  Код за потвърждение
                </Label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Въведете 6-цифрен код"
                  className="border-zinc-800 bg-black font-mono text-sm text-white"
                  maxLength={6}
                />
              </div>

              {error && <div className="text-xs text-red-500 font-mono">{error}</div>}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSetupOpen(false)}>
                  Отказ
                </Button>
                <Button onClick={verifyTOTPSetup}>Потвърди</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md bg-green-950/30 p-4 border border-green-800">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-400">
                      Двуфакторната автентикация е успешно активирана
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-zinc-400">
                <p>
                  Сега ще бъдете помолени да въведете код от вашето приложение за автентикация, когато влизате от ново
                  устройство.
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setSetupOpen(false)
                    setBackupCodesOpen(true)
                  }}
                >
                  Покажи резервни кодове
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={backupCodesOpen} onOpenChange={setBackupCodesOpen}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Резервни кодове за достъп</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Запазете тези кодове на сигурно място. Всеки код може да бъде използван само веднъж.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md bg-amber-950/30 p-4 border border-amber-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Key className="h-5 w-5 text-amber-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-amber-400">Важно</p>
                  <div className="mt-2 text-sm text-zinc-400">
                    <p>
                      Тези кодове са единственият начин да влезете в акаунта си, ако загубите достъп до вашето
                      устройство за удостоверяване.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="font-mono text-sm bg-zinc-900 p-2 rounded-md text-white text-center">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setBackupCodesOpen(false)}>Готово</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Деактивиране на двуфакторна автентикация</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Това ще премахне допълнителния слой защита от вашия акаунт
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md bg-red-950/30 p-4 border border-red-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-400">Предупреждение за сигурността</p>
                  <div className="mt-2 text-sm text-zinc-400">
                    <p>Деактивирането на двуфакторната автентикация ще направи вашия акаунт по-уязвим.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs text-zinc-400">
                Въведете вашия код за достъп за потвърждение
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-zinc-800 bg-black font-mono text-sm text-white"
              />
            </div>

            {error && <div className="text-xs text-red-500 font-mono">{error}</div>}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDisableOpen(false)}>
                Отказ
              </Button>
              <Button variant="destructive" onClick={disableMFA} className="bg-red-900 hover:bg-red-800 text-white">
                Деактивирай
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

