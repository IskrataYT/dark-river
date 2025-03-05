"use client"

import { useState, useEffect, useCallback } from "react"
import { type Socket, io } from "socket.io-client"

interface Message {
  _id: string
  content: string
  userId: string
  userName: string
  channelId: string
  createdAt: string
  isDeleted: boolean
}

interface ChatHookProps {
  channelId: string
  currentUserId: string
  onMessageReceive: (message: Message) => void
  onMessageDelete: (messageId: string) => void
  onUserMuted: (expiresAt: Date) => void
  onUserUnmuted: () => void
}

export function useChat({
  channelId,
  currentUserId,
  onMessageReceive,
  onMessageDelete,
  onUserMuted,
  onUserUnmuted,
}: ChatHookProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    let mounted = true
    let socketInstance: Socket | null = null

    const connectSocket = () => {
      if (socketInstance) return

      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "https://socketio.darkriver.site"
      console.log("Attempting to connect to Socket.IO server:", socketUrl)

      socketInstance = io(socketUrl, {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        auth: {
          token: document.cookie.replace(/(?:(?:^|.*;\s*)session\s*=\s*([^;]*).*$)|^.*$/, "$1"),
        },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      })

      socketInstance.on("connect", () => {
        console.log("Connected to Socket.IO server")
        if (mounted) {
          setIsConnected(true)
          socketInstance?.emit("join:channel", channelId)
        }
      })

      socketInstance.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error)
        if (mounted) {
          setIsConnected(false)
        }
      })

      socketInstance.on("message:receive", (message: Message) => {
        if (mounted && message.channelId === channelId) {
          onMessageReceive({
            ...message,
            userName: message.userName || "Anonymous",
          })
        }
      })

      socketInstance.on("message:delete", ({ messageId, channelId: msgChannelId }) => {
        if (mounted && msgChannelId === channelId) {
          onMessageDelete(messageId)
        }
      })

      socketInstance.on("user:muted", ({ userId, muteExpiresAt }) => {
        if (mounted && userId === currentUserId) {
          onUserMuted(new Date(muteExpiresAt))
        }
      })

      socketInstance.on("user:unmuted", ({ userId }) => {
        if (mounted && userId === currentUserId) {
          onUserUnmuted()
        }
      })

      if (mounted) {
        setSocket(socketInstance)
      }
    }

    connectSocket()

    // Cleanup function
    return () => {
      mounted = false
      if (socketInstance) {
        socketInstance.emit("leave:channel", channelId)
        socketInstance.removeAllListeners()
        socketInstance.disconnect()
        socketInstance = null
      }
    }
  }, [channelId, currentUserId, onMessageReceive, onMessageDelete, onUserMuted, onUserUnmuted])

  const sendMessage = useCallback(
    (messageData: Omit<Message, "_id" | "createdAt" | "isDeleted">) => {
      if (!socket) return

      const fullMessage = {
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isDeleted: false,
        ...messageData,
      }

      socket.emit("message:send", fullMessage)
      return fullMessage
    },
    [socket],
  )

  return {
    socket,
    isConnected,
    sendMessage,
  }
}

