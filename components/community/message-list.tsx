"use client"

import { useEffect, useRef } from "react"
import { format } from "date-fns"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Message {
  _id: string
  content: string
  userId: string
  userName: string
  createdAt: string
  isDeleted: boolean
}

interface MessageListProps {
  messages: Message[]
  isAdmin: boolean
  isModerator: boolean
  currentUserId: string
}

export function MessageList({ messages, isAdmin, isModerator, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/community/messages/${messageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete message")
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message._id} className="flex items-start space-x-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-white">{message.userName}</span>
                <span className="text-xs text-zinc-500">{format(new Date(message.createdAt), "h:mm a")}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-300">
                {message.isDeleted ? (
                  <span className="italic text-zinc-500">This message has been deleted</span>
                ) : (
                  message.content
                )}
              </p>
            </div>
            {!message.isDeleted && (isAdmin || isModerator || message.userId === currentUserId) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleDeleteMessage(message._id)}
                    className="text-red-500 focus:text-red-500"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

