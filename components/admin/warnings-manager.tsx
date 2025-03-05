"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Search, AlertTriangle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Warning {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  message: string
  detectedIssue: string
  toxicityScore: number
  createdAt: string
  issuedBy: "system" | "admin" | "moderator"
  acknowledged: boolean
}

const formatWarningCategory = (category: string) => {
  switch (category) {
    case "нецензурен език":
      return "Нецензурен език"
    case "реч на омразата":
      return "Реч на омразата"
    case "заплаха":
      return "Заплаха"
    case "сексуално съдържание":
      return "Сексуално съдържание"
    case "spam_too_many_messages":
      return "Спам (твърде много съобщения)"
    case "spam_too_fast":
      return "Спам (твърде бързо изпращане)"
    default:
      return category
  }
}

export function WarningsManager() {
  const [warnings, setWarnings] = useState<Warning[]>([])
  const [filteredWarnings, setFilteredWarnings] = useState<Warning[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [highRiskUsers, setHighRiskUsers] = useState<
    {
      _id: string
      name: string
      email: string
      warningsCount: number
    }[]
  >([])
  const [highRiskLoading, setHighRiskLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWarnings()
    fetchHighRiskUsers()
  }, [])

  const fetchWarnings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/warnings?page=${page}&limit=20`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Неуспешно зареждане на предупреждения")
      }

      const data = await response.json()

      if (page === 1) {
        setWarnings(data.warnings)
      } else {
        setWarnings((prev) => [...prev, ...data.warnings])
      }

      setFilteredWarnings(data.warnings)
      setHasMore(data.hasMore)
    } catch (error) {
      console.error("Неуспешно зареждане на предупреждения:", error)
      setError("Неуспешно зареждане на предупреждения. Моля, опитайте отново по-късно.")
    } finally {
      setLoading(false)
    }
  }

  const fetchHighRiskUsers = async () => {
    try {
      setHighRiskLoading(true)
      setError(null)
      const response = await fetch("/api/admin/warnings/high-risk")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Неуспешно зареждане на високорискови потребители")
      }

      const data = await response.json()
      console.log("Данни за високорискови потребители:", data) // Debug log

      if (Array.isArray(data.users)) {
        setHighRiskUsers(data.users)
      } else {
        console.error("Неочакван формат на данните:", data)
        setHighRiskUsers([])
      }
    } catch (error) {
      console.error("Неуспешно зареждане на високорискови потребители:", error)
      setError("Неуспешно зареждане на високорискови потребители. Моля, опитайте отново по-късно.")
      setHighRiskUsers([])
    } finally {
      setHighRiskLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1)
    }
  }

  const handleMuteUser = async (userId: string) => {
    try {
      const duration = Number.parseInt(prompt("Въведете продължителност на заглушаване в минути:") || "0")
      if (!duration) return

      const response = await fetch("/api/community/moderation/mute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          duration,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Неуспешно заглушаване на потребител")

      alert("Потребителят е заглушен успешно")
    } catch (error) {
      console.error("Неуспешно заглушаване на потребител:", error)
      alert(error instanceof Error ? error.message : "Неуспешно заглушаване на потребител")
    }
  }

  const handleBanUser = async (userId: string) => {
    try {
      const reason = prompt("Въведете причина за блокиране:") || "Множество нарушения на правилата на общността"

      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isBanned: true,
          banReason: reason,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Неуспешно блокиране на потребител")

      alert("Потребителят е блокиран успешно")
    } catch (error) {
      console.error("Неуспешно блокиране на потребител:", error)
      alert(error instanceof Error ? error.message : "Неуспешно блокиране на потребител")
    }
  }

  const getToxicityColor = (score: number) => {
    if (score < 0.3) return "bg-green-500/20 text-green-500"
    if (score < 0.7) return "bg-yellow-500/20 text-yellow-500"
    return "bg-red-500/20 text-red-500"
  }

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredWarnings(warnings)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = warnings.filter(
        (warning) =>
          (warning.userId?.name || "").toLowerCase().includes(query) ||
          (warning.userId?.email || "").toLowerCase().includes(query) ||
          (warning.message || "").toLowerCase().includes(query) ||
          (warning.detectedIssue || "").toLowerCase().includes(query),
      )
      setFilteredWarnings(filtered)
    }
  }, [searchQuery, warnings])

  if (loading && warnings.length === 0) {
    return <div className="text-center">Зареждане на предупреждения...</div>
  }

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-md">{error}</div>}

      <div className="flex items-center justify-between">
        <h1 className="font-mono text-2xl font-bold">Предупреждения на потребители</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Търсене на предупреждения..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-zinc-800 bg-black pl-10 font-mono"
          />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800">
              <TableHead className="text-zinc-400">Потребител</TableHead>
              <TableHead className="text-zinc-400">Проблем</TableHead>
              <TableHead className="text-zinc-400">Оценка</TableHead>
              <TableHead className="text-zinc-400">Дата</TableHead>
              <TableHead className="text-zinc-400">Източник</TableHead>
              <TableHead className="text-right text-zinc-400">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWarnings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-zinc-500">
                  Няма намерени предупреждения
                </TableCell>
              </TableRow>
            ) : (
              filteredWarnings.map((warning) => (
                <TableRow key={warning._id} className="border-zinc-800">
                  <TableCell className="font-medium">
                    <div>
                      <div>{warning.userId.name}</div>
                      <div className="text-xs text-zinc-500">{warning.userId.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {formatWarningCategory(warning.detectedIssue)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getToxicityColor(warning.toxicityScore)}>
                      {(warning.toxicityScore * 100).toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(warning.createdAt), "dd.MM.yyyy HH:mm")}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {warning.issuedBy === "system" ? "система" : warning.issuedBy === "admin" ? "админ" : "модератор"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWarning(warning)
                          setDialogOpen(true)
                        }}
                      >
                        <AlertTriangle className="mr-1 h-4 w-4" />
                        Преглед
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMuteUser(warning.userId._id)}
                        className="border-yellow-800 bg-yellow-950/30 text-yellow-500 hover:bg-yellow-950 hover:text-yellow-400"
                      >
                        Заглуши
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBanUser(warning.userId._id)}
                        className="border-red-800 bg-red-950/30 text-red-500 hover:bg-red-950 hover:text-red-400"
                      >
                        <Shield className="mr-1 h-4 w-4" />
                        Блокирай
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {hasMore && (
          <div className="flex justify-center p-4">
            <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
              {loading ? "Зареждане..." : "Зареди още"}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xl font-bold text-red-400">Потребители за преглед за блокиране</h2>
          <Button variant="outline" size="sm" onClick={fetchHighRiskUsers} disabled={highRiskLoading}>
            {highRiskLoading ? "Зареждане..." : "Обнови"}
          </Button>
        </div>

        <div className="rounded-lg border border-red-800 bg-red-950/20">
          <Table>
            <TableHeader>
              <TableRow className="border-red-800">
                <TableHead className="text-zinc-400">Потребител</TableHead>
                <TableHead className="text-zinc-400">Брой предупреждения</TableHead>
                <TableHead className="text-right text-zinc-400">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {highRiskLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-zinc-500">
                    Зареждане на потребители с висок риск...
                  </TableCell>
                </TableRow>
              ) : highRiskUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-zinc-500">
                    Няма потребители с 6 или повече предупреждения
                  </TableCell>
                </TableRow>
              ) : (
                highRiskUsers.map((user) => (
                  <TableRow key={user._id} className="border-red-800">
                    <TableCell className="font-medium">
                      <div>
                        <div>{user.name}</div>
                        <div className="text-xs text-zinc-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-500/20 text-red-500">{user.warningsCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMuteUser(user._id)}
                          className="border-yellow-800 bg-yellow-950/30 text-yellow-500 hover:bg-yellow-950 hover:text-yellow-400"
                        >
                          Заглуши
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBanUser(user._id)}
                          className="border-red-800 bg-red-950/30 text-red-500 hover:bg-red-950 hover:text-red-400"
                        >
                          <Shield className="mr-1 h-4 w-4" />
                          Блокирай
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-950 text-white">
          <DialogHeader>
            <DialogTitle>Детайли за предупреждението</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Преглед на детайлна информация за предупреждението
            </DialogDescription>
          </DialogHeader>
          {selectedWarning && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-400">Потребител</h3>
                <p>
                  {selectedWarning.userId.name} ({selectedWarning.userId.email})
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-400">Проблем</h3>
                <p>{formatWarningCategory(selectedWarning.detectedIssue)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-400">Оценка на токсичност</h3>
                <Badge className={getToxicityColor(selectedWarning.toxicityScore)}>
                  {(selectedWarning.toxicityScore * 100).toFixed(0)}%
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-400">Съдържание на съобщението</h3>
                <div className="mt-1 rounded border border-zinc-800 bg-black p-3 text-sm">
                  {selectedWarning.message}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-400">Дата</h3>
                <p>{format(new Date(selectedWarning.createdAt), "dd MMMM yyyy, HH:mm:ss")}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-400">Издадено от</h3>
                <p className="capitalize">
                  {selectedWarning.issuedBy === "system"
                    ? "система"
                    : selectedWarning.issuedBy === "admin"
                      ? "админ"
                      : "модератор"}
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleMuteUser(selectedWarning.userId._id)}
                  className="border-yellow-800 bg-yellow-950/30 text-yellow-500 hover:bg-yellow-950 hover:text-yellow-400"
                >
                  Заглуши потребителя
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleBanUser(selectedWarning.userId._id)}
                  className="border-red-800 bg-red-950/30 text-red-500 hover:bg-red-950 hover:text-red-400"
                >
                  <Shield className="mr-1 h-4 w-4" />
                  Блокирай потребителя
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

