"use client"

import { useState, useEffect, useCallback } from "react"
import { ChannelList } from "./channel-list"
import { ChatWindow } from "./chat-window"
import { Button } from "@/components/ui/button"
import { Menu, ArrowLeft } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface Channel {
  _id: string
  name: string
  description: string
}

interface CommunityProps {
  userId: string
  userName: string
  isAdmin: boolean
  isModerator: boolean
}

export function CommunityChat({ userId, userName, isAdmin, isModerator }: CommunityProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Fetch channels
  const fetchChannels = useCallback(async () => {
    try {
      const response = await fetch("/api/community/channels")
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setChannels(data.channels)
    } catch (error) {
      console.error("Failed to fetch channels:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])

  // Create channel
  const handleCreateChannel = async (channelData: { name: string; description: string }) => {
    try {
      const response = await fetch("/api/community/channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(channelData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      fetchChannels() // Refresh channels after creating
      setIsSidebarOpen(false) // Close sidebar on mobile after creating channel
    } catch (error) {
      console.error("Failed to create channel:", error)
      throw error
    }
  }

  // Delete channel
  const handleDeleteChannel = async (channelId: string) => {
    try {
      const response = await fetch(`/api/community/channels/${channelId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      if (selectedChannel === channelId) {
        setSelectedChannel(null)
      }
      fetchChannels() // Refresh channels after deleting
    } catch (error) {
      console.error("Failed to delete channel:", error)
      throw error
    }
  }

  // Handle channel selection
  const handleSelectChannel = (channelId: string) => {
    setSelectedChannel(channelId)
    if (isMobileView) {
      setIsSidebarOpen(false) // Close sidebar on mobile after selecting channel
    }
  }

  // Handle back button on mobile
  const handleBackToChannels = () => {
    setSelectedChannel(null)
  }

  return (
    <div className="flex h-full flex-col md:flex-row overflow-hidden">
      {/* Mobile header with menu button or back button */}
      <div className="md:hidden border-b border-zinc-800 p-3 flex items-center justify-between">
        {selectedChannel ? (
          <Button variant="ghost" onClick={handleBackToChannels} className="p-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="ml-2">Назад към канали</span>
          </Button>
        ) : (
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="p-2">
                <Menu className="h-5 w-5" />
                <span className="ml-2">Канали</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] pt-12 p-0 bg-zinc-950 border-zinc-800">
              <div className="h-full">
                <ChannelList
                  isAdmin={isAdmin}
                  selectedChannel={selectedChannel}
                  onSelectChannel={handleSelectChannel}
                  channels={channels}
                  isLoading={isLoading}
                  onCreateChannel={handleCreateChannel}
                  onDeleteChannel={handleDeleteChannel}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
        <div className="font-mono text-sm">
          {selectedChannel ? channels.find((c) => c._id === selectedChannel)?.name || "Канал" : "Изберете канал"}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden md:block md:w-64 border-r border-zinc-800 bg-zinc-950`}>
        <ChannelList
          isAdmin={isAdmin}
          selectedChannel={selectedChannel}
          onSelectChannel={handleSelectChannel}
          channels={channels}
          isLoading={isLoading}
          onCreateChannel={handleCreateChannel}
          onDeleteChannel={handleDeleteChannel}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedChannel ? (
          <ChatWindow channelId={selectedChannel} isAdmin={isAdmin} isModerator={isModerator} currentUserId={userId} />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center text-zinc-500">
              <p className="mb-2 font-mono">Изберете канал, за да започнете чат</p>
              <p className="text-sm">Присъединете се към разговора с други агенти</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

