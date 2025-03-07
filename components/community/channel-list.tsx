"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Hash, Trash2, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Channel {
  _id: string
  name: string
  description: string
}

interface ChannelListProps {
  isAdmin: boolean
  selectedChannel: string | null
  onSelectChannel: (channelId: string) => void
  channels: Channel[]
  isLoading: boolean
  onCreateChannel: (channel: { name: string; description: string }) => Promise<void>
  onDeleteChannel: (channelId: string) => Promise<void>
}

export function ChannelList({
  isAdmin,
  selectedChannel,
  onSelectChannel,
  channels,
  isLoading,
  onCreateChannel,
  onDeleteChannel,
}: ChannelListProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newChannel, setNewChannel] = useState({ name: "", description: "" })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  const handleCreateChannel = async () => {
    try {
      setIsCreating(true)
      setError("")
      await onCreateChannel(newChannel)
      setNewChannel({ name: "", description: "" })
      setDialogOpen(false)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете този канал?")) return
    try {
      await onDeleteChannel(channelId)
    } catch (error: any) {
      console.error("Error deleting channel:", error)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 sm:p-4 border-b border-zinc-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-sm sm:text-lg font-bold">КАНАЛИ</h2>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-zinc-900 mr-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 text-white">
                <DialogHeader>
                  <DialogTitle>Създаване на канал</DialogTitle>
                </DialogHeader>
                {error && (
                  <div className="rounded border border-red-800 bg-red-950/50 p-3 text-sm text-red-500">{error}</div>
                )}
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Име на канала</Label>
                    <Input
                      id="name"
                      value={newChannel.name}
                      onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                      className="border-zinc-800 bg-black"
                      disabled={isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={newChannel.description}
                      onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                      className="border-zinc-800 bg-black"
                      disabled={isCreating}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateChannel} className="w-full" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Създаване...
                    </>
                  ) : (
                    "Създай канал"
                  )}
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2 px-2 py-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          ) : channels.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-zinc-500">Няма налични канали</div>
          ) : (
            channels.map((channel) => (
              <div
                key={channel._id}
                className={`group flex items-center justify-between rounded-md px-2 py-2 ${
                  selectedChannel === channel._id
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <button
                  onClick={() => onSelectChannel(channel._id)}
                  className="flex w-full items-center space-x-2"
                  title={channel.description}
                >
                  <Hash className="h-4 w-4 shrink-0" />
                  <span className="font-mono text-sm truncate">{channel.name}</span>
                </button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden h-8 w-8 group-hover:inline-flex shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteChannel(channel._id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

