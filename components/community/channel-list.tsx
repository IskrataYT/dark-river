"use client"

import { useState, useEffect } from "react"
import { Hash, Plus, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
}

export function ChannelList({ isAdmin, selectedChannel, onSelectChannel }: ChannelListProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newChannel, setNewChannel] = useState({ name: "", description: "" })
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchChannels()
  }, [])

  const fetchChannels = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/community/channels")
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setChannels(data.channels)

      // Auto-select first channel if none selected
      if (data.channels.length > 0 && !selectedChannel) {
        onSelectChannel(data.channels[0]._id)
      }
    } catch (error) {
      console.error("Failed to fetch channels:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateChannel = async () => {
    if (isCreating) return

    try {
      setError("")
      setIsCreating(true)
      const response = await fetch("/api/community/channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newChannel),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error)
      }

      setNewChannel({ name: "", description: "" })
      setDialogOpen(false)
      await fetchChannels()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create channel")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm("Are you sure you want to delete this channel?")) return

    try {
      const response = await fetch(`/api/community/channels/${channelId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete channel")
      }

      await fetchChannels()
    } catch (error) {
      console.error("Failed to delete channel:", error)
    }
  }

  return (
    <div className="w-64 border-r border-zinc-800 bg-zinc-950">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-lg font-bold">CHANNELS</h2>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-zinc-900">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 text-white" aria-describedby="channel-dialog-description">
                <DialogHeader>
                  <DialogTitle>Create Channel</DialogTitle>
                </DialogHeader>
                <div id="channel-dialog-description" className="sr-only">
                  Create a new channel by entering a name and description
                </div>
                {error && (
                  <div className="rounded border border-red-800 bg-red-950/50 p-3 text-sm text-red-500">{error}</div>
                )}
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Channel Name</Label>
                    <Input
                      id="name"
                      value={newChannel.name}
                      onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                      className="border-zinc-800 bg-black"
                      disabled={isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
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
                      Creating...
                    </>
                  ) : (
                    "Create Channel"
                  )}
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="space-y-1">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2 px-2 py-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          ) : channels.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-zinc-500">No channels available</div>
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

