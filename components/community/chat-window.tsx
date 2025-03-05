"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { format } from "date-fns"
import { type Socket, io } from "socket.io-client"
import { Trash2, Shield, Loader2, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageSkeleton } from "./message-skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

function useStableSocket(channelId: string, currentUserId: string) {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "https://socketio.darkriver.site"
    console.log("Initializing socket connection...")

    const socket = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      auth: {
        token: document.cookie.replace(/(?:(?:^|.*;\s*)session\s*=\s*([^;]*).*$)|^.*$/, "$1"),
      },
      reconnectionAttempts: Number.POSITIVE_INFINITY,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: true,
    })

    socket.on("connect", () => {
      console.log("Socket connected, joining channel:", channelId)
      socket.emit("authenticate", { id: currentUserId })
      socket.emit("join:channel", channelId)
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      if (socket.io.engine.transport.name === "websocket") {
        console.log("Falling back to polling transport")
        socket.io.engine.transport.name = "polling"
      }
    })

    setSocket(socket)

    return () => {
      console.log("Cleaning up socket connection...")
      socket.disconnect()
    }
  }, [currentUserId, channelId]) // Only recreate socket when user changes

  // Handle channel changes separately
  useEffect(() => {
    if (!socket) return

    console.log("Switching to channel:", channelId)
    socket.emit("join:channel", channelId)

    return () => {
      socket.emit("leave:channel", channelId)
    }
  }, [socket, channelId])

  return socket
}

interface Message {
  _id: string
  content: string
  userId: string
  userName: string
  channelId: string // Add channelId to message interface
  createdAt: string
  isDeleted: boolean
  isOptimistic?: boolean // Add isOptimistic flag
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
  const [isMuted, setIsMuted] = useState(false)
  const [muteExpiresAt, setMuteExpiresAt] = useState<Date | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null) // Add error state
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const previousChannelRef = useRef<string>(channelId)
  const observerRef = useRef<IntersectionObserver>()
  const PAGE_SIZE = 50 // Increased page size for better initial load
  const [toxicityWarning, setToxicityWarning] = useState<{
    message: string
    details?: {
      category: string
      explanation: string
    }
  } | null>(null)
  const [warningTimeout, setWarningTimeout] = useState<NodeJS.Timeout | null>(null)
  // Add spamWarning state
  const [spamWarning, setSpamWarning] = useState<{
    message: string
    details?: {
      reason: string
      explanation: string
    }
  } | null>(null)

  // Memoize the fetchMessages function
  const fetchMessages = useCallback(
    async (channelId: string, reset = false) => {
      try {
        if (reset) {
          setIsInitialLoading(true)
        } else {
          setIsLoadingMore(true)
        }

        const currentPage = reset ? 1 : page
        const url = `/api/community/messages?channelId=${channelId}&page=${currentPage}&limit=${PAGE_SIZE}`

        const response = await fetch(url)
        const data = await response.json()

        if (!response.ok) throw new Error(data.error || "Failed to fetch messages")

        if (channelId === previousChannelRef.current) {
          const sortedMessages = data.messages.sort(
            (a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          )

          setMessages((prev) => {
            const newMessages = reset ? sortedMessages : [...prev, ...sortedMessages]
            // Only scroll on initial load or when new messages arrive
            if (reset) {
              requestAnimationFrame(() => {
                scrollToBottom()
              })
            }
            return newMessages
          })

          setHasMore(data.messages.length === PAGE_SIZE)
          setPage(currentPage + 1)
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error)
        setMessages([])
        setHasMore(false)
        setError(error.message)
      } finally {
        setIsInitialLoading(false)
        setIsLoadingMore(false)
      }
    },
    [page],
  )

  // Handle initial channel load
  useEffect(() => {
    if (channelId) {
      console.log("Initial channel load:", channelId)
      fetchMessages(channelId, true)
    }
  }, [channelId, fetchMessages]) // Added channelId and fetchMessages to dependencies

  // Handle channel switching
  useEffect(() => {
    console.log("Channel changed:", {
      from: previousChannelRef.current,
      to: channelId,
    })

    if (channelId && channelId !== previousChannelRef.current) {
      setMessages([]) // Clear messages when switching channels
      setPage(1) // Reset pagination
      setHasMore(true) // Reset hasMore flag
      setError(null) // Clear any errors
      previousChannelRef.current = channelId
      fetchMessages(channelId, true) // Pass true to reset
    }
  }, [channelId, fetchMessages]) // Keep these dependencies

  const socket = useStableSocket(channelId, currentUserId)

  // Auto-scroll effect - Removed
  // useEffect(() => {
  //   if (!isLoading) {
  //     scrollToBottom()
  //   }
  // }, [isLoading])

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" })
    }
  }, [])

  // Modified loadMoreRef to handle intersection observer
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoadingMore) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            fetchMessages(channelId, false)
          }
        },
        {
          rootMargin: "200px", // Start loading earlier
          threshold: 0.1,
        },
      )

      if (node && hasMore) {
        observerRef.current.observe(node)
      }
    },
    [isLoadingMore, hasMore, fetchMessages, channelId],
  )

  const safeSetMessages = (updater: (prev: Message[]) => Message[]) => {
    try {
      setMessages((prev) => {
        try {
          const updated = updater(prev)
          console.log("Messages updated successfully:", {
            previous: prev.length,
            new: updated.length,
          })
          return updated
        } catch (error) {
          console.error("Error in message update function:", error)
          return prev
        }
      })
    } catch (error) {
      console.error("Error in setMessages:", error)
    }
  }

  // Update the handleSendMessage function to handle spam warnings
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending || isMuted) {
      if (isMuted && muteExpiresAt) {
        alert(`You are muted until ${format(muteExpiresAt, "MMM d, h:mm a")}`)
      }
      return
    }

    // Clear previous warnings
    setToxicityWarning(null)
    setSpamWarning(null)

    // Store the message content before clearing the input
    const messageContent = newMessage.trim()

    // Clear input immediately for better UX
    setNewMessage("")

    // Create a temporary message ID
    const tempId = `temp-${Date.now()}`

    // Add message optimistically to the UI
    const optimisticMessage = {
      _id: tempId,
      content: messageContent,
      userId: currentUserId,
      userName: "You", // Temporary display name
      channelId,
      createdAt: new Date().toISOString(),
      isDeleted: false,
      isOptimistic: true, // Flag to identify optimistic messages
    }

    // Add to messages immediately
    setMessages((prev) => [...prev, optimisticMessage])

    // Scroll to bottom immediately
    requestAnimationFrame(() => {
      scrollToBottom()
    })

    // Set sending state for UI feedback only after adding the optimistic message
    setIsSending(true)

    try {
      // Send to API
      const response = await fetch("/api/community/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelId,
          content: messageContent,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Remove the optimistic message if there was an error
        setMessages((prev) => prev.filter((msg) => msg._id !== tempId))

        if (data.muteExpiresAt) {
          setIsMuted(true)
          setMuteExpiresAt(new Date(data.muteExpiresAt))
        }

        if (data.toxicityDetails) {
          setToxicityWarning({
            message: data.error || "Your message contains inappropriate content and was not sent.",
            details: {
              category: data.toxicityDetails.category,
              explanation: data.toxicityDetails.explanation,
            },
          })
        }

        // Handle spam warnings
        if (data.spamDetails) {
          setSpamWarning({
            message: data.error || "Моля, забавете изпращането на съобщения.",
            details: {
              reason: data.spamDetails.reason,
              explanation: data.spamDetails.explanation,
            },
          })
        }

        throw new Error(data.error)
      }

      // Replace the optimistic message with the real one
      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempId ? { ...data, userName: data.userName || "You" } : msg)),
      )

      // Emit the message to socket with the correct username
      socket.emit("message:send", {
        _id: data._id,
        content: messageContent,
        userId: currentUserId,
        userName: data.userName,
        channelId,
        createdAt: data.createdAt,
        isDeleted: false,
      })
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // First update the UI optimistically
      setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, isDeleted: true } : msg)))

      // Then send the delete request to the server
      const response = await fetch(`/api/community/messages/${messageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete message")
      }

      // If the socket is connected, emit the delete event to other clients
      if (socket) {
        socket.emit("message:delete", { messageId, channelId })
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
      // Revert the optimistic update if there was an error
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId && msg.isDeleted ? { ...msg, isDeleted: false } : msg)),
      )
    }
  }

  const handleMuteUser = async (user: any) => {
    try {
      const duration = Number.parseInt(prompt("Enter mute duration in minutes:") || "0")
      if (!duration) return

      // Extract the _id from the user object
      const userId = typeof user === "string" ? user : user._id
      console.log("Muting user with ID:", userId) // Add logging

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
      if (!response.ok) {
        throw new Error(data.error || "Failed to mute user")
      }

      // Show success message
      console.log("User muted successfully:", data)
    } catch (error) {
      console.error("Failed to mute user:", error)
      alert(error instanceof Error ? error.message : "Failed to mute user")
    }
  }

  // Add a function to check mute status
  const checkMuteStatus = useCallback(async () => {
    try {
      console.log("Checking mute status...")
      const response = await fetch("/api/community/moderation/check-mute")

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Failed to check mute status:", errorData.error)
        return
      }

      const data = await response.json()
      console.log("Mute status response:", data)

      setIsMuted(data.isMuted)
      setMuteExpiresAt(data.muteExpiresAt ? new Date(data.muteExpiresAt) : null)
    } catch (error) {
      console.error("Error checking mute status:", error)
    }
  }, [])

  // Add useEffect to check mute status on mount and channel change
  useEffect(() => {
    checkMuteStatus()
  }, [checkMuteStatus]) // Removed channelId from dependencies

  useEffect(() => {
    if (socket) {
      socket.on("message:receive", (message: Message & { isOwnMessage?: boolean }) => {
        console.log("Received message:", message)
        if (message.channelId === channelId) {
          setMessages((prev) => {
            // Check if message already exists
            if (prev.some((msg) => msg._id === message._id)) {
              return prev
            }
            // Add new message and maintain chronological order
            const newMessage = {
              ...message,
              userName: message.isOwnMessage ? "You" : message.userName, // Only show "You" if it's the user's own message
            }
            console.log("Adding message with username:", newMessage.userName)
            return [...prev, newMessage].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            )
          })
          // Only scroll if the message is new
          requestAnimationFrame(() => {
            scrollToBottom()
          })
        }
      })

      socket.on("message:delete", ({ messageId, channelId: msgChannelId }) => {
        console.log("Message delete event received:", { messageId, msgChannelId, currentChannel: channelId })
        // Only update if message belongs to current channel
        if (msgChannelId === channelId) {
          console.log("Updating message state for deletion")
          setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, isDeleted: true } : msg)))
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
    }
    return () => {
      if (socket) {
        socket.off("message:receive")
        socket.off("message:delete")
        socket.off("user:muted")
        socket.off("user:unmuted")
        socket.off("join:channel")
      }
    }
  }, [socket, currentUserId, channelId, scrollToBottom])

  useEffect(() => {
    if (toxicityWarning) {
      // Clear any existing timeout
      if (warningTimeout) {
        clearTimeout(warningTimeout)
      }

      // Set new timeout to clear warning after 5 seconds
      const timeout = setTimeout(() => {
        setToxicityWarning(null)
      }, 5000)

      setWarningTimeout(timeout)

      // Store timeout ID in state
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [toxicityWarning, warningTimeout]) // Added warningTimeout to dependencies

  // Add useEffect for spam warnings
  useEffect(() => {
    if (spamWarning) {
      // Clear any existing timeout
      const timeout = setTimeout(() => {
        setSpamWarning(null)
      }, 5000)

      return () => {
        clearTimeout(timeout)
      }
    }
  }, [spamWarning])

  const translateCategory = (category: string): string => {
    const translations: Record<string, string> = {
      profanity: "Нецензурен език",
      toxicity: "Токсичност",
      insult: "Обида",
      identity_attack: "Атака по идентичност",
      threat: "Заплаха",
      sexual_explicit: "Сексуално съдържание",
      spam: "Спам",
    }
    return translations[category] || category
  }

  const translateExplanation = (explanation: string): string => {
    if (explanation.includes("contains profanity")) {
      return "съдържа нецензурен език или обидни думи"
    }
    if (explanation.includes("toxic content")) {
      return "съдържа токсично съдържание, което може да бъде обидно"
    }
    if (explanation.includes("insult")) {
      return "съдържа обиди към други потребители"
    }
    if (explanation.includes("identity attack")) {
      return "съдържа атаки по идентичност или дискриминация"
    }
    if (explanation.includes("threat")) {
      return "съдържа заплахи към други потребители"
    }
    if (explanation.includes("sexual")) {
      return "съдържа неподходящо сексуално съдържание"
    }
    return explanation
  }

  if (isInitialLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <MessageSkeleton />
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
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 h-[calc(100%-4rem)]">
        {messages.length === 0 && !isInitialLoading && (
          <div className="flex items-center justify-center">
            <p className="text-center text-zinc-400">No messages yet</p>
          </div>
        )}

        {/* Load More Messages Indicator */}
        <div ref={loadMoreRef} className="flex justify-center py-2">
          {isLoadingMore && <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />}
        </div>

        {/* Messages List */}
        <div className="space-y-4">
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
                  {message.isDeleted ? "[Message Deleted]" : message.content}
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
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Update the form at the bottom to include spam warnings */}
      <form onSubmit={handleSendMessage} className="border-t border-zinc-800 p-4 flex-shrink-0">
        {isMuted && muteExpiresAt && (
          <div className="mb-2 rounded border border-red-800 bg-red-950/50 p-2 text-sm text-red-500">
            Вие сте заглушени до {format(muteExpiresAt, "d MMM, HH:mm")}
          </div>
        )}

        {toxicityWarning && (
          <Alert
            variant="destructive"
            className="mx-4 mb-2 border-red-800 bg-red-950/50 relative w-auto max-w-[calc(100%-2rem)]"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-white font-bold">Предупреждение</AlertTitle>
            <AlertDescription className="text-white break-words">
              {toxicityWarning.message === "Your message contains inappropriate content and was not sent."
                ? "Вашето съобщение съдържа неподходящо съдържание и не беше изпратено."
                : toxicityWarning.message.includes("You have been muted")
                  ? "Вие сте заглушени за 24 часа поради многократни нарушения."
                  : toxicityWarning.message}
              {toxicityWarning.details && (
                <div className="mt-1 text-xs text-white">
                  <p>
                    <strong>Категория:</strong> {translateCategory(toxicityWarning.details.category)}
                  </p>
                  <p>
                    <strong>Обяснение:</strong> {translateExplanation(toxicityWarning.details.explanation)}
                  </p>
                </div>
              )}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 text-white hover:bg-red-800"
              onClick={() => setToxicityWarning(null)}
              aria-label="Затвори"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Затвори</span>
            </Button>
          </Alert>
        )}

        {spamWarning && (
          <Alert
            variant="destructive"
            className="mx-4 mb-2 border-orange-800 bg-orange-950/50 relative w-auto max-w-[calc(100%-2rem)]"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-white font-bold">Предупреждение за спам</AlertTitle>
            <AlertDescription className="text-white break-words">
              {spamWarning.message}
              {spamWarning.details && (
                <div className="mt-1 text-xs text-white">
                  <p>
                    <strong>Причина:</strong>{" "}
                    {spamWarning.details.reason === "too_many_messages"
                      ? "Твърде много съобщения"
                      : "Твърде бързо изпращане"}
                  </p>
                  <p>
                    <strong>Обяснение:</strong> {spamWarning.details.explanation}
                  </p>
                </div>
              )}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 text-white hover:bg-orange-800"
              onClick={() => setSpamWarning(null)}
              aria-label="Затвори"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Затвори</span>
            </Button>
          </Alert>
        )}

        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isMuted ? "Вие сте заглушени" : "Напишете вашето съобщение..."}
            className="border-zinc-800 bg-black font-mono text-white"
            disabled={isMuted || isSending}
          />
          <Button type="submit" disabled={isMuted || isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Изпращане
              </>
            ) : (
              "Изпрати"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

