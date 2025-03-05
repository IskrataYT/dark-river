"use client"

import { useState, useEffect } from "react"
import { Search, Clock, Check, X, AlertTriangle, ShieldAlert, ShieldCheck, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

interface User {
  _id: string
  name: string
  email: string
  isAdmin: boolean
  isModerator: boolean
  isMuted: boolean
  muteExpiresAt: string | null
  verified: boolean
  createdAt: string
  isBanned?: boolean
  banReason?: string | null
  bannedAt?: string | null
  isDonor?: boolean
  donorSince?: string | null
}

export function UserManager() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [muteDuration, setMuteDuration] = useState("60")
  const [isMuting, setIsMuting] = useState(false)
  const [isUnmuting, setIsUnmuting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isBanning, setIsBanning] = useState(false)
  const [isUnbanning, setIsUnbanning] = useState(false)
  const [banReason, setBanReason] = useState("")
  const [banDialogOpen, setBanDialogOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter((user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)),
      )
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    console.log("Fetching users...")
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Неуспешно зареждане на потребители")

      console.log(`Fetched ${data.users.length} users`)
      setUsers(data.users)
      setFilteredUsers(data.users)
    } catch (error) {
      console.error("Неуспешно зареждане на потребители:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMuteUser = async () => {
    if (!selectedUser) return

    try {
      setIsMuting(true)
      const response = await fetch("/api/community/moderation/mute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          duration: Number.parseInt(muteDuration),
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Неуспешно заглушаване на потребител")

      // Update the user in the list
      setUsers(
        users.map((user) =>
          user._id === selectedUser._id
            ? {
                ...user,
                isMuted: true,
                muteExpiresAt: data.muteExpiresAt,
              }
            : user,
        ),
      )

      setDialogOpen(false)
    } catch (error) {
      console.error("Неуспешно заглушаване на потребител:", error)
    } finally {
      setIsMuting(false)
    }
  }

  const handleUnmuteUser = async (userId: string) => {
    try {
      setIsUnmuting(true)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isMuted: false,
          muteExpiresAt: null,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Неуспешно отглушаване на потребител")

      // Update the user in the list
      setUsers(
        users.map((user) =>
          user._id === userId
            ? {
                ...user,
                isMuted: false,
                muteExpiresAt: null,
              }
            : user,
        ),
      )
    } catch (error) {
      console.error("Неуспешно отглушаване на потребител:", error)
    } finally {
      setIsUnmuting(false)
    }
  }

  const handleBanUser = async () => {
    if (!selectedUser) return

    try {
      setIsBanning(true)
      const response = await fetch(`/api/admin/users/${selectedUser._id}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isBanned: true,
          banReason: banReason,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Неуспешно блокиране на потребител")

      // Update the user in the list
      setUsers(
        users.map((user) =>
          user._id === selectedUser._id
            ? {
                ...user,
                isBanned: true,
                banReason: banReason,
                bannedAt: new Date().toISOString(),
              }
            : user,
        ),
      )

      setBanDialogOpen(false)
      setBanReason("")
    } catch (error) {
      console.error("Неуспешно блокиране на потребител:", error)
    } finally {
      setIsBanning(false)
    }
  }

  const handleToggleDonorStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const newDonorStatus = !currentStatus
      console.log(`Toggling donor status for ${userId}: ${currentStatus} -> ${newDonorStatus}`)

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isDonor: newDonorStatus,
          donorSince: newDonorStatus ? new Date().toISOString() : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("API error:", data)
        throw new Error(data.error || "Неуспешна промяна на статус на дарител")
      }

      console.log("API response success:", data)

      // Update the user in the list with the data returned from the server
      setUsers(
        users.map((user) =>
          user._id === userId
            ? {
                ...user,
                ...data.user, // Use the user data returned from the API
              }
            : user,
        ),
      )

      // Force refresh users list
      setTimeout(() => {
        fetchUsers()
      }, 1000)
    } catch (error) {
      console.error("Неуспешна промяна на статус на дарител:", error)
      alert("Неуспешна промяна на статус на дарител: " + (error instanceof Error ? error.message : String(error)))
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      setIsUnbanning(true)
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isBanned: false,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Неуспешно отблокиране на потребител")

      // Update the user in the list
      setUsers(
        users.map((user) =>
          user._id === userId
            ? {
                ...user,
                isBanned: false,
                banReason: null,
                bannedAt: null,
              }
            : user,
        ),
      )
    } catch (error) {
      console.error("Неуспешно отблокиране на потребител:", error)
    } finally {
      setIsUnbanning(false)
    }
  }

  if (loading) {
    return <div className="text-center">Зареждане на потребители...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-2xl font-bold">Управление на потребители</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Търсене на потребители..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-zinc-800 bg-black pl-10 font-mono"
          />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left font-mono text-xs font-medium text-zinc-400">Име</th>
                <th className="px-4 py-3 text-left font-mono text-xs font-medium text-zinc-400">Имейл</th>
                <th className="px-4 py-3 text-left font-mono text-xs font-medium text-zinc-400">Статус</th>
                <th className="px-4 py-3 text-left font-mono text-xs font-medium text-zinc-400">Роли</th>
                <th className="px-4 py-3 text-left font-mono text-xs font-medium text-zinc-400">Регистриран</th>
                <th className="px-4 py-3 text-right font-mono text-xs font-medium text-zinc-400">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-zinc-800">
                  <td className="px-4 py-3 font-mono text-sm">{user.name}</td>
                  <td className="px-4 py-3 font-mono text-sm">{user.email}</td>
                  <td className="px-4 py-3 font-mono text-sm">
                    {user.isBanned ? (
                      <span className="flex items-center text-red-500">
                        <AlertTriangle className="mr-1 h-4 w-4" />
                        Блокиран
                        {user.bannedAt && (
                          <span className="ml-1 text-xs">(от {format(new Date(user.bannedAt), "dd.MM.yyyy")})</span>
                        )}
                      </span>
                    ) : user.isMuted ? (
                      <span className="flex items-center text-yellow-500">
                        <Clock className="mr-1 h-4 w-4" />
                        Заглушен
                        {user.muteExpiresAt && (
                          <span className="ml-1 text-xs">
                            (до {format(new Date(user.muteExpiresAt), "dd.MM, HH:mm")})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="flex items-center text-green-500">
                        <Check className="mr-1 h-4 w-4" />
                        Активен
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">
                    <div className="flex flex-wrap gap-1">
                      {user.isAdmin && (
                        <span className="rounded bg-red-950 px-2 py-0.5 text-xs text-red-500">Админ</span>
                      )}
                      {user.isModerator && (
                        <span className="rounded bg-blue-950 px-2 py-0.5 text-xs text-blue-500">Модератор</span>
                      )}
                      {!user.isAdmin && !user.isModerator && (
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">Потребител</span>
                      )}
                      {user.isDonor && (
                        <span className="rounded bg-purple-950 px-2 py-0.5 text-xs text-purple-500">Дарител</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">{format(new Date(user.createdAt), "dd.MM.yyyy")}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      {user.isBanned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnbanUser(user._id)}
                          disabled={isUnbanning}
                          className="border-green-800 bg-green-950/30 text-green-500 hover:bg-green-950 hover:text-green-400"
                        >
                          <ShieldCheck className="mr-1 h-4 w-4" />
                          Отблокирай
                        </Button>
                      ) : (
                        <Dialog
                          open={banDialogOpen && selectedUser?._id === user._id}
                          onOpenChange={(open) => {
                            setBanDialogOpen(open)
                            if (!open) {
                              setSelectedUser(null)
                              setBanReason("")
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                              className="border-red-800 bg-red-950/30 text-red-500 hover:bg-red-950 hover:text-red-400"
                            >
                              <ShieldAlert className="mr-1 h-4 w-4" />
                              Блокирай
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-zinc-950 text-white">
                            <DialogHeader>
                              <DialogTitle>Блокиране на потребител</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <p className="mb-2 text-sm">
                                  На път сте да блокирате <span className="font-bold">{user.name}</span> ({user.email})
                                </p>
                                <p className="text-xs text-red-500">
                                  Това ще попречи на потребителя да достъпва приложението.
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="banReason">Причина за блокиране</Label>
                                <Textarea
                                  id="banReason"
                                  value={banReason}
                                  onChange={(e) => setBanReason(e.target.value)}
                                  placeholder="Причина за блокиране на този потребител"
                                  className="border-zinc-800 bg-black"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setBanDialogOpen(false)
                                  setSelectedUser(null)
                                  setBanReason("")
                                }}
                                className="border-zinc-800 hover:bg-zinc-900"
                              >
                                Отказ
                              </Button>
                              <Button
                                onClick={handleBanUser}
                                disabled={isBanning}
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                {isBanning ? "Блокиране..." : "Блокирай потребител"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {user.isMuted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnmuteUser(user._id)}
                          disabled={isUnmuting}
                          className="border-green-800 bg-green-950/30 text-green-500 hover:bg-green-950 hover:text-green-400"
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Отглуши
                        </Button>
                      ) : (
                        <Dialog
                          open={dialogOpen && selectedUser?._id === user._id}
                          onOpenChange={(open) => {
                            setDialogOpen(open)
                            if (!open) setSelectedUser(null)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                              className="border-yellow-800 bg-yellow-950/30 text-yellow-500 hover:bg-yellow-950 hover:text-yellow-400"
                            >
                              <X className="mr-1 h-4 w-4" />
                              Заглуши
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-zinc-950 text-white">
                            <DialogHeader>
                              <DialogTitle>Заглушаване на потребител</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <p className="mb-2 text-sm">
                                  На път сте да заглушите <span className="font-bold">{user.name}</span> ({user.email})
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="muteDuration">Продължителност на заглушаване (минути)</Label>
                                <Select value={muteDuration} onValueChange={setMuteDuration}>
                                  <SelectTrigger className="border-zinc-800 bg-black">
                                    <SelectValue placeholder="Изберете продължителност" />
                                  </SelectTrigger>
                                  <SelectContent className="border-zinc-800 bg-black">
                                    <SelectItem value="10">10 минути</SelectItem>
                                    <SelectItem value="30">30 минути</SelectItem>
                                    <SelectItem value="60">1 час</SelectItem>
                                    <SelectItem value="360">6 часа</SelectItem>
                                    <SelectItem value="1440">24 часа</SelectItem>
                                    <SelectItem value="10080">7 дни</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setDialogOpen(false)
                                  setSelectedUser(null)
                                }}
                                className="border-zinc-800 hover:bg-zinc-900"
                              >
                                Отказ
                              </Button>
                              <Button
                                onClick={handleMuteUser}
                                disabled={isMuting}
                                className="bg-yellow-600 text-white hover:bg-yellow-700"
                              >
                                {isMuting ? "Заглушаване..." : "Заглуши потребител"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleDonorStatus(user._id, user.isDonor || false)}
                        className={
                          user.isDonor
                            ? "border-purple-800 bg-purple-950/30 text-purple-500 hover:bg-purple-950 hover:text-purple-400"
                            : "border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-400"
                        }
                        title={
                          user.isDonor
                            ? "Премахни статус на дарител"
                            : "Ръчно задаване на статус на дарител (за Ko-fi дарения)"
                        }
                      >
                        <Heart className="mr-1 h-4 w-4" />
                        {user.isDonor ? "Премахни дарител" : "Маркирай като дарител"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    Няма намерени потребители
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

