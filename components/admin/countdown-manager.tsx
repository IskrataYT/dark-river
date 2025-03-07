"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Save, X, Trash2, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"

interface Countdown {
  _id: string
  endTime: string
  message: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function CountdownManager() {
  const [countdowns, setCountdowns] = useState<Countdown[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newCountdown, setNewCountdown] = useState({
    endTime: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"), // Default to 7 days from now
    message: "Нови етапи в разработка. Очаквайте скоро!",
    isActive: true,
  })
  const [error, setError] = useState<string>("")
  const [editingCountdown, setEditingCountdown] = useState<Countdown | null>(null)
  const [actionInProgress, setActionInProgress] = useState(false)

  useEffect(() => {
    fetchCountdowns()
  }, [])

  const fetchCountdowns = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/countdown")
      const data = await response.json()

      if (data.countdown) {
        setCountdowns([data.countdown])
      } else {
        setCountdowns([])
      }
    } catch (error) {
      console.error("Неуспешно зареждане на отброяване:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCountdown = async () => {
    try {
      setError("")
      setActionInProgress(true)

      // Validate the date before sending to API
      const dateObj = new Date(newCountdown.endTime)
      if (isNaN(dateObj.getTime())) {
        setError("Невалиден формат на дата и час")
        setActionInProgress(false)
        return
      }

      // Format the date as ISO string for the API
      const formattedEndTime = dateObj.toISOString()

      const response = await fetch("/api/admin/countdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCountdown,
          endTime: formattedEndTime,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Неуспешно създаване на отброяване")
      }

      await fetchCountdowns()
      setShowNewForm(false)
      setNewCountdown({
        endTime: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
        message: "Нови етапи в разработка. Очаквайте скоро!",
        isActive: true,
      })
    } catch (error) {
      console.error("Неуспешно създаване на отброяване:", error)
      setError(error instanceof Error ? error.message : "Неуспешно създаване на отброяване")
    } finally {
      setActionInProgress(false)
    }
  }

  const handleUpdateCountdown = async (id: string) => {
    if (!editingCountdown) return

    try {
      setError("")
      setActionInProgress(true)

      // Validate the date before sending to API
      const dateObj = new Date(editingCountdown.endTime)
      if (isNaN(dateObj.getTime())) {
        setError("Невалиден формат на дата и час")
        setActionInProgress(false)
        return
      }

      // Format the date as ISO string for the API
      const formattedEndTime = dateObj.toISOString()

      const response = await fetch(`/api/admin/countdown/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingCountdown,
          endTime: formattedEndTime,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Неуспешно обновяване на отброяване")
      }

      await fetchCountdowns()
      setEditingCountdown(null)
    } catch (error) {
      console.error("Неуспешно обновяване на отброяване:", error)
      setError(error instanceof Error ? error.message : "Неуспешно обновяване на отброяване")
    } finally {
      setActionInProgress(false)
    }
  }

  const handleDeleteCountdown = async (id: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете това отброяване?")) return

    try {
      setActionInProgress(true)
      const response = await fetch(`/api/admin/countdown/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Неуспешно изтриване на отброяване")
      }

      // Wait a moment to ensure the database has processed the deletion
      await new Promise((resolve) => setTimeout(resolve, 500))

      await fetchCountdowns()
    } catch (error) {
      console.error("Неуспешно изтриване на отброяване:", error)
      alert("Грешка при изтриване на отброяването: " + (error instanceof Error ? error.message : "Неизвестна грешка"))
    } finally {
      setActionInProgress(false)
    }
  }

  const toggleCountdownStatus = async (countdown: Countdown) => {
    try {
      setActionInProgress(true)
      const response = await fetch(`/api/admin/countdown/${countdown._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !countdown.isActive,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Неуспешно обновяване на статуса")
      }

      // Wait a moment to ensure the database has processed the update
      await new Promise((resolve) => setTimeout(resolve, 500))

      await fetchCountdowns()
    } catch (error) {
      console.error("Неуспешно обновяване на статуса:", error)
      alert("Грешка при промяна на статуса: " + (error instanceof Error ? error.message : "Неизвестна грешка"))
    } finally {
      setActionInProgress(false)
    }
  }

  if (loading) {
    return <div className="text-center">Зареждане...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xl font-bold">Глобално отброяване</h2>
        <Button
          onClick={() => setShowNewForm(true)}
          className="bg-white font-mono text-black hover:bg-zinc-200"
          disabled={(countdowns.length > 0 && !showNewForm) || actionInProgress}
        >
          <Clock className="mr-2 h-4 w-4" />
          Създай отброяване
        </Button>
      </div>

      {showNewForm && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <h3 className="mb-4 font-mono text-lg font-bold">Ново отброяване</h3>
          {error && (
            <div className="mb-4 rounded border border-red-800 bg-red-950/50 p-3 text-sm text-red-500">{error}</div>
          )}
          <div className="grid gap-4">
            <div>
              <Label>Крайна дата и час</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <Input
                  type="datetime-local"
                  value={newCountdown.endTime}
                  onChange={(e) => {
                    // Validate the date as the user types
                    const dateValue = e.target.value
                    const dateObj = new Date(dateValue)
                    const isValid = !isNaN(dateObj.getTime())

                    if (isValid || dateValue === "") {
                      setNewCountdown({ ...newCountdown, endTime: dateValue })
                      setError("") // Clear error if valid
                    } else {
                      setError("Невалиден формат на дата и час")
                    }
                  }}
                  className="border-zinc-800 bg-black font-mono"
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")} // Prevent past dates
                  disabled={actionInProgress}
                />
              </div>
              {error && error.includes("дата") && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
            <div>
              <Label>Съобщение</Label>
              <Textarea
                value={newCountdown.message}
                onChange={(e) => setNewCountdown({ ...newCountdown, message: e.target.value })}
                className="h-20 border-zinc-800 bg-black font-mono"
                disabled={actionInProgress}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newCountdown.isActive}
                onCheckedChange={(checked) => setNewCountdown({ ...newCountdown, isActive: checked })}
                disabled={actionInProgress}
              />
              <Label>Активно</Label>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleCreateCountdown}
                className="bg-white font-mono text-black hover:bg-zinc-200"
                disabled={actionInProgress}
              >
                {actionInProgress ? (
                  <span className="flex items-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                    Запазване...
                  </span>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Запази
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNewForm(false)}
                className="border-zinc-800 font-mono hover:bg-zinc-900"
                disabled={actionInProgress}
              >
                <X className="mr-2 h-4 w-4" />
                Отказ
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {countdowns.map((countdown) => (
          <div key={countdown._id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            {editingCountdown?._id === countdown._id ? (
              <div className="grid gap-4">
                <div>
                  <Label>Крайна дата и час</Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <Input
                      type="datetime-local"
                      value={editingCountdown.endTime}
                      onChange={(e) => {
                        // Validate the date as the user types
                        const dateValue = e.target.value
                        const dateObj = new Date(dateValue)
                        const isValid = !isNaN(dateObj.getTime())

                        if (isValid || dateValue === "") {
                          setEditingCountdown({
                            ...editingCountdown,
                            endTime: dateValue,
                          })
                          setError("") // Clear error if valid
                        } else {
                          setError("Невалиден формат на дата и час")
                        }
                      }}
                      className="border-zinc-800 bg-black font-mono"
                      min={format(new Date(), "yyyy-MM-dd'T'HH:mm")} // Prevent past dates
                      disabled={actionInProgress}
                    />
                  </div>
                  {error && error.includes("дата") && <p className="mt-1 text-xs text-red-500">{error}</p>}
                </div>
                <div>
                  <Label>Съобщение</Label>
                  <Textarea
                    value={editingCountdown.message}
                    onChange={(e) =>
                      setEditingCountdown({
                        ...editingCountdown,
                        message: e.target.value,
                      })
                    }
                    className="h-20 border-zinc-800 bg-black font-mono"
                    disabled={actionInProgress}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingCountdown.isActive}
                    onCheckedChange={(checked) =>
                      setEditingCountdown({
                        ...editingCountdown,
                        isActive: checked,
                      })
                    }
                    disabled={actionInProgress}
                  />
                  <Label>Активно</Label>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleUpdateCountdown(countdown._id)}
                    className="bg-white font-mono text-black hover:bg-zinc-200"
                    disabled={actionInProgress}
                  >
                    {actionInProgress ? (
                      <span className="flex items-center">
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                        Запазване...
                      </span>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Запази
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingCountdown(null)}
                    className="border-zinc-800 font-mono hover:bg-zinc-900"
                    disabled={actionInProgress}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Отказ
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-mono text-lg font-bold flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Отброяване
                    {countdown.isActive ? (
                      <span className="ml-2 rounded bg-green-900/30 px-2 py-0.5 text-xs text-green-500">Активно</span>
                    ) : (
                      <span className="ml-2 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">Неактивно</span>
                    )}
                  </h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => toggleCountdownStatus(countdown)}
                      className="hover:bg-zinc-900"
                      title={countdown.isActive ? "Деактивирай" : "Активирай"}
                      disabled={actionInProgress}
                    >
                      {actionInProgress ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                      ) : countdown.isActive ? (
                        <Pause className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <Play className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setEditingCountdown(countdown)}
                      className="hover:bg-zinc-900"
                      disabled={actionInProgress}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteCountdown(countdown._id)}
                      className="hover:bg-zinc-900"
                      disabled={actionInProgress}
                    >
                      {actionInProgress ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2 text-sm">
                  <p>
                    <span className="font-bold">Крайна дата:</span>{" "}
                    {format(new Date(countdown.endTime), "dd.MM.yyyy HH:mm")}
                  </p>
                  <p>
                    <span className="font-bold">Съобщение:</span> {countdown.message}
                  </p>
                  <p>
                    <span className="font-bold">Последна промяна:</span>{" "}
                    {format(new Date(countdown.updatedAt), "dd.MM.yyyy HH:mm")}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        {countdowns.length === 0 && !showNewForm && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 text-center">
            <p className="text-zinc-500">Няма активни отброявания</p>
            <p className="mt-2 text-xs text-zinc-600">
              Създайте отброяване, за да информирате потребителите за предстоящи нови етапи
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

