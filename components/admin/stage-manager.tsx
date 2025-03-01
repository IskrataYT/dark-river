"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Stage {
  _id: string
  stage: number
  subject: string
  body: string
  sender: string
  trigger: string
  nextStage: number | undefined
  description: string
  isActive: boolean
  isInitial: boolean
}

export function StageManager() {
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [editingStage, setEditingStage] = useState<Stage | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newStage, setNewStage] = useState<Partial<Stage>>({
    isActive: true,
    isInitial: false,
  })
  const [error, setError] = useState<string>("")

  useEffect(() => {
    fetchStages()
  }, [])

  const fetchStages = async () => {
    try {
      const response = await fetch("/api/admin/stages")
      const data = await response.json()
      setStages(data.stages)
    } catch (error) {
      console.error("Failed to fetch stages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStage = async () => {
    try {
      setError("")
      const response = await fetch("/api/admin/stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newStage,
          // Only include trigger and nextStage if not initial
          ...(newStage.isInitial
            ? {}
            : {
                trigger: newStage.trigger || "",
                nextStage: newStage.nextStage,
              }),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to create stage")
      }

      await fetchStages()
      setShowNewForm(false)
      setNewStage({ isActive: true, isInitial: false })
    } catch (error) {
      console.error("Failed to create stage:", error)
      setError(error instanceof Error ? error.message : "Failed to create stage")
    }
  }

  const handleUpdateStage = async (id: string) => {
    try {
      setError("")
      const response = await fetch(`/api/admin/stages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingStage,
          // Only include trigger and nextStage if not initial
          ...(editingStage?.isInitial
            ? {}
            : {
                trigger: editingStage?.trigger || "",
                nextStage: editingStage?.nextStage,
              }),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to update stage")
      }

      await fetchStages()
      setEditingStage(null)
    } catch (error) {
      console.error("Failed to update stage:", error)
      setError(error instanceof Error ? error.message : "Failed to update stage")
    }
  }

  const handleDeleteStage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stage?")) return

    try {
      const response = await fetch(`/api/admin/stages/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete stage")

      await fetchStages()
    } catch (error) {
      console.error("Failed to delete stage:", error)
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-2xl font-bold">Email Stage Manager</h1>
        <Button onClick={() => setShowNewForm(true)} className="bg-white font-mono text-black hover:bg-zinc-200">
          <Plus className="mr-2 h-4 w-4" />
          Add Stage
        </Button>
      </div>

      {showNewForm && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="mb-4 font-mono text-lg font-bold">New Stage</h2>
          {error && (
            <div className="mb-4 rounded border border-red-800 bg-red-950/50 p-3 text-sm text-red-500">{error}</div>
          )}
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stage Number</Label>
                <Input
                  type="number"
                  value={newStage.stage || ""}
                  onChange={(e) => setNewStage({ ...newStage, stage: Number.parseInt(e.target.value) })}
                  className="border-zinc-800 bg-black font-mono"
                />
              </div>
              <div>
                <Label>Next Stage</Label>
                <Input
                  type="number"
                  value={newStage.nextStage || ""}
                  onChange={(e) => setNewStage({ ...newStage, nextStage: Number.parseInt(e.target.value) })}
                  className="border-zinc-800 bg-black font-mono"
                  disabled={newStage.isInitial}
                />
              </div>
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={newStage.subject || ""}
                onChange={(e) => setNewStage({ ...newStage, subject: e.target.value })}
                className="border-zinc-800 bg-black font-mono"
              />
            </div>
            <div>
              <Label>Trigger Phrase</Label>
              <Input
                value={newStage.trigger || ""}
                onChange={(e) => setNewStage({ ...newStage, trigger: e.target.value })}
                className="border-zinc-800 bg-black font-mono"
                disabled={newStage.isInitial}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newStage.description || ""}
                onChange={(e) => setNewStage({ ...newStage, description: e.target.value })}
                className="border-zinc-800 bg-black font-mono"
              />
            </div>
            <div>
              <Label>Email Body</Label>
              <Textarea
                value={newStage.body || ""}
                onChange={(e) => setNewStage({ ...newStage, body: e.target.value })}
                className="h-32 border-zinc-800 bg-black font-mono"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newStage.isActive}
                  onCheckedChange={(checked) => setNewStage({ ...newStage, isActive: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newStage.isInitial}
                  onCheckedChange={(checked) =>
                    setNewStage({
                      ...newStage,
                      isInitial: checked,
                      // Clear trigger and nextStage if this is initial stage
                      ...(checked ? { trigger: "", nextStage: undefined } : {}),
                    })
                  }
                />
                <Label>Initial Stage</Label>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateStage} className="bg-white font-mono text-black hover:bg-zinc-200">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNewForm(false)}
                className="border-zinc-800 font-mono hover:bg-zinc-900"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage._id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            {editingStage?._id === stage._id ? (
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Stage Number</Label>
                    <Input
                      type="number"
                      value={editingStage.stage}
                      onChange={(e) =>
                        setEditingStage({
                          ...editingStage,
                          stage: Number.parseInt(e.target.value),
                        })
                      }
                      className="border-zinc-800 bg-black font-mono"
                    />
                  </div>
                  <div>
                    <Label>Next Stage</Label>
                    <Input
                      type="number"
                      value={editingStage.nextStage || ""}
                      onChange={(e) =>
                        setEditingStage({
                          ...editingStage,
                          nextStage: Number.parseInt(e.target.value),
                        })
                      }
                      className="border-zinc-800 bg-black font-mono"
                      disabled={editingStage.isInitial}
                    />
                  </div>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={editingStage.subject}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        subject: e.target.value,
                      })
                    }
                    className="border-zinc-800 bg-black font-mono"
                  />
                </div>
                <div>
                  <Label>Trigger Phrase</Label>
                  <Input
                    value={editingStage.trigger}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        trigger: e.target.value,
                      })
                    }
                    className="border-zinc-800 bg-black font-mono"
                    disabled={editingStage.isInitial}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={editingStage.description}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        description: e.target.value,
                      })
                    }
                    className="border-zinc-800 bg-black font-mono"
                  />
                </div>
                <div>
                  <Label>Email Body</Label>
                  <Textarea
                    value={editingStage.body}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        body: e.target.value,
                      })
                    }
                    className="h-32 border-zinc-800 bg-black font-mono"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingStage.isActive}
                      onCheckedChange={(checked) =>
                        setEditingStage({
                          ...editingStage,
                          isActive: checked,
                        })
                      }
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingStage.isInitial}
                      onCheckedChange={(checked) =>
                        setEditingStage({
                          ...editingStage,
                          isInitial: checked,
                          // Clear trigger and nextStage if this is initial stage
                          ...(checked ? { trigger: "", nextStage: undefined } : {}),
                        })
                      }
                    />
                    <Label>Initial Stage</Label>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleUpdateStage(stage._id)}
                    className="bg-white font-mono text-black hover:bg-zinc-200"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingStage(null)}
                    className="border-zinc-800 font-mono hover:bg-zinc-900"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-mono text-lg font-bold">
                    Stage {stage.stage}{" "}
                    {stage.isInitial && <span className="ml-2 text-sm text-green-500">(Initial)</span>}
                    {!stage.isActive && <span className="ml-2 text-sm text-zinc-500">(Inactive)</span>}
                  </h3>
                  <div className="flex space-x-2">
                    <Button variant="ghost" onClick={() => setEditingStage(stage)} className="hover:bg-zinc-900">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => handleDeleteStage(stage._id)} className="hover:bg-zinc-900">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2 text-sm">
                  <p>
                    <span className="font-bold">Subject:</span> {stage.subject}
                  </p>
                  {!stage.isInitial && (
                    <>
                      <p>
                        <span className="font-bold">Trigger:</span> {stage.trigger}
                      </p>
                      <p>
                        <span className="font-bold">Next Stage:</span> {stage.nextStage}
                      </p>
                    </>
                  )}
                  <p>
                    <span className="font-bold">Description:</span> {stage.description}
                  </p>
                  <div>
                    <span className="font-bold">Body:</span>
                    <pre className="mt-1 whitespace-pre-wrap rounded bg-black p-2 font-mono text-xs">{stage.body}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

