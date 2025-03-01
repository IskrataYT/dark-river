import type { Server as HTTPServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { verifyToken } from "./auth"

declare global {
  var io: SocketIOServer | undefined
}

let io: SocketIOServer | null = null

export const initSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error("Authentication error"))
    }

    try {
      const decoded = await verifyToken(token)
      socket.data.user = decoded
      next()
    } catch (error) {
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)

    socket.on("join:channel", (channelId) => {
      socket.join(channelId)
    })

    socket.on("leave:channel", (channelId) => {
      socket.leave(channelId)
    })

    socket.on("message:send", async (data) => {
      const user = socket.data.user
      if (!user) return

      io?.to(data.channelId).emit("message:receive", {
        ...data,
        userId: user.id,
        userName: user.name,
      })
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
    })
  })

  global.io = io
  return io
}

export function getIO(): SocketIOServer {
  if (!global.io) {
    throw new Error("Socket.io not initialized")
  }
  return global.io
}

