"use client"

import { useState } from "react"
import { ChannelList } from "./channel-list"
import { ChatWindow } from "./chat-window"

interface CommunityProps {
  userId: string
  userName: string
  isAdmin: boolean
  isModerator: boolean
}

export function CommunityChat({ userId, userName, isAdmin, isModerator }: CommunityProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)

  return (
    <div className="flex h-full">
      <ChannelList isAdmin={isAdmin} selectedChannel={selectedChannel} onSelectChannel={setSelectedChannel} />
      {selectedChannel ? (
        <div className="flex-1">
          <ChatWindow channelId={selectedChannel} isAdmin={isAdmin} isModerator={isModerator} currentUserId={userId} />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-zinc-500">
            <p className="mb-2 font-mono">Select a channel to start chatting</p>
            <p className="text-sm">Join the conversation with other agents</p>
          </div>
        </div>
      )}
    </div>
  )
}

