"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { format } from "date-fns"
import { type Socket, io } from "socket.io-client"
import { Trash2, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Message {
  _id: string
  content: string
  userId: string
  userName: string
  channelId: string // Add channelId to message interface
  createdAt: string
  isDeleted: boolean
}

interface ChatWindowProps {
  channelId: string
  isAdmin: boolean
  isModerator: boolean
  currentUserId: string
}

export function ChatWindow({ channelId, isAdmin, isModerator, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [muteExpiresAt, setMuteExpiresAt] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null) // Add error state
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const previousChannelRef = useRef<string>(channelId)
  const observerRef = useRef<IntersectionObserver>()
  const PAGE_SIZE = 25

  // Memoize the fetchMessages function
  const fetchMessages = useCallback(
    async (channelId: string, reset = false) => {
      try {
        setIsLoading(true)
        const currentPage = reset ? 1 : page
        const url = `/api/community/messages?channelId=${channelId}&page=${currentPage}&limit=${PAGE_SIZE}`
        console.log("Fetching messages:", url)

        const response = await fetch(url)
        const data = await response.json()

        console.log("Messages response:", {
          status: response.status,
          ok: response.ok,
          messageCount: data.messages?.length || 0,
        })

        if (!response.ok) throw new Error(data.error || "Failed to fetch messages")

        // Only update messages if we're still on the same channel
        if (channelId === previousChannelRef.current) {
          const newMessages = reset ? data.messages : [...messages, ...data.messages]
          console.log("Updating messages:", {
            existing: messages.length,
            new: data.messages.length,
            total: newMessages.length,
          })

          setMessages(newMessages)
          setHasMore(data.messages.length === PAGE_SIZE)
          setPage(currentPage + 1)
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error)
        // Show error state to user
        setMessages([])
        setHasMore(false)
        setError(error.message) // Set error state
      } finally {
        setIsLoading(false)
      }
    },
    [page, messages],
  )

  // Handle channel switching
  useEffect(() => {
    console.log("Channel changed:", {
      from: previousChannelRef.current,
      to: channelId,
    })

    if (channelId !== previousChannelRef.current) {
      setMessages([]) // Clear messages when switching channels
      setPage(1) // Reset pagination
      setHasMore(true) // Reset hasMore flag
      setError(null) // Clear any errors
      previousChannelRef.current = channelId

      // Leave previous channel if socket exists
      if (socket) {
        console.log("Leaving channel:", previousChannelRef.current)
        socket.emit("leave:channel", previousChannelRef.current)
      }

      // Join new channel if socket exists
      if (socket) {
        console.log("Joining channel:", channelId)
        socket.emit("join:channel", channelId)
      }

      fetchMessages(channelId, true) // Pass true to reset
    }
  }, [channelId, fetchMessages, socket])

  useEffect(() => {
    const socketUrl = `https://socketio.darkriver.site`
    console.log("Attempting to connect to Socket.IO server:", socketUrl)
    const socket = io(socketUrl, {
      transports: ["polling", "websocket"],
      auth: {
        token: document.cookie.replace(/(?:(?:^|.*;\s*)session\s*=\s*([^;]*).*$)|^.*$/, "$1"),
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      secure: true,
      rejectUnauthorized: false,
    })

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server")
      console.log("Transport:", socket.io.engine.transport.name)
      console.log("Protocol:", socket.io.engine.transport.ws ? "wss://" : "https://")
      socket.emit("join:channel", channelId)
    })

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error)
      console.log("Current transport:", socket.io.engine.transport.name)
    })

    socket.on("error", (error) => {
      console.error("Socket.IO error:", error)
    })

    socket.on("disconnect", (reason) => {
      console.log("Disconnected from WebSocket server. Reason:", reason)
    })

    socket.io.on("reconnect", (attempt) => {
      console.log("Reconnected on attempt:", attempt)
      socket.emit("join:channel", channelId)
    })

    socket.io.on("reconnect_attempt", (attempt) => {
      console.log("Attempting to reconnect:", attempt)
    })

    socket.on("message:receive", (message: Message) => {
      console.log("Received message:", message)
      if (message.channelId === channelId) {
        setMessages((prev) => {
          console.log("Adding new message to", prev.length, "existing messages")
          return [...prev, message]
        })
        scrollToBottom()
      }
    })

    socket.on("message:delete", ({ messageId, channelId: msgChannelId }) => {
      // Only update if message belongs to current channel
      if (msgChannelId === channelId) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === messageId ? { ...msg, isDeleted: true, content: "[Message deleted]" } : msg)),
        )
      }
    })

    socket.on("user:muted", ({ userId, muteExpiresAt }) => {
      if (userId === currentUserId) {
        setIsMuted(true)
        setMuteExpiresAt(new Date(muteExpiresAt))
      }
    })

    socket.on("user:unmuted", ({ userId }) => {
      if (userId === currentUserId) {
        setIsMuted(false)
        setMuteExpiresAt(null)
      }
    })

    socket.on("join:channel", () => {
      console.log("Successfully joined channel:", channelId)
    })

    setSocket(socket)

    // Cleanup function
    return () => {
      console.log("Disconnecting from Socket.IO server...")
      socket.emit("leave:channel", channelId)
      socket.disconnect()
    }
  }, [channelId, currentUserId])

  // Auto-scroll effect
  useEffect(() => {
    if (!isLoading) {
      scrollToBottom()
    }
  }, [isLoading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMessages(channelId, false)
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [isLoading, hasMore, fetchMessages, channelId],
  )

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || isSending) return

    const optimisticId = Date.now().toString()
    const optimisticMessage = {
      _id: optimisticId,
      content: newMessage,
      userId: currentUserId,
      userName: "You", // This will be replaced by the server response
      channelId,
      createdAt: new Date().toISOString(),
      isDeleted: false,
    }

    try {
      setIsSending(true)
      // Add optimistic message
      setMessages((prev) => [...prev, optimisticMessage])
      setNewMessage("")
      scrollToBottom()

      const response = await fetch("/api/community/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelId,
          content: newMessage,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        if (data.muteExpiresAt) {
          setIsMuted(true)
          setMuteExpiresAt(new Date(data.muteExpiresAt))
        }
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg._id !== optimisticId))
        throw new Error(data.error)
      }

      // Replace optimistic message with real one
      setMessages((prev) => prev.map((msg) => (msg._id === optimisticId ? data.message : msg)))
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

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

  const handleMuteUser = async (userId: string) => {
    try {
      const duration = Number.parseInt(prompt("Enter mute duration in minutes:") || "0")
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

      if (!response.ok) {
        throw new Error("Failed to mute user")
      }
    } catch (error) {
      console.error("Failed to mute user:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center space-x-2 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading messages...</span>
        </div>
      </div>
    )
  }

  if (error) {
    // Render error state
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-red-500">
          <p>Failed to load messages: {error}</p> {/* Display error message */}
          <Button
            onClick={() => {
              setError(null)
              fetchMessages(channelId, true)
            }}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center">
            <p className="text-center text-zinc-400">No messages yet</p>
          </div>
        )}
        {messages.map((message) => (
          <div key={message._id} className="group flex items-start space-x-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-medium text-white">{message.userName}</span>
                <span className="text-xs text-zinc-500">{format(new Date(message.createdAt), "MMM d, h:mm a")}</span>
                {(isAdmin || isModerator) && message.userId !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hidden h-6 w-6 group-hover:inline-flex">
                        <Shield className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-black text-white">
                      <DropdownMenuItem onClick={() => handleMuteUser(message.userId)} className="text-red-500">
                        Mute User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <p
                className={`whitespace-pre-wrap font-mono text-sm ${
                  message.isDeleted ? "italic text-zinc-500" : "text-white"
                }`}
              >
                {message.content}
              </p>
            </div>
            {(isAdmin || isModerator || message.userId === currentUserId) && !message.isDeleted && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden h-8 w-8 group-hover:inline-flex"
                onClick={() => handleDeleteMessage(message._id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        ))}
        <div ref={loadMoreRef} className="flex justify-center py-2">
          {hasMore && <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-zinc-800 p-4">
        {isMuted && muteExpiresAt && (
          <div className="mb-2 rounded border border-red-800 bg-red-950/50 p-2 text-sm text-red-500">
            You are muted until {format(muteExpiresAt, "MMM d, h:mm a")}
          </div>
        )}
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isMuted ? "You are muted" : "Type your message..."}
            className="border-zinc-800 bg-black font-mono text-white"
            disabled={isMuted || isSending}
          />
          <Button type="submit" disabled={isMuted || isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending
              </>
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

