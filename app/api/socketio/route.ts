import { Server } from "socket.io"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

const ioHandler = async () => {
  try {
    // @ts-ignore - global for socket.io server instance
    if (!global.io) {
      console.log("Creating new Socket.IO server...")
      // @ts-ignore
      global.io = new Server({
        cors: {
          origin: process.env.NEXT_PUBLIC_APP_URL || "https://www.darkriver.site",
          methods: ["GET", "POST"],
          credentials: true,
        },
        path: "/socketio",
      })

      // Middleware to authenticate socket connections
      // @ts-ignore
      global.io.use(async (socket, next) => {
        try {
          const token = socket.handshake.auth.token
          if (!token) {
            return next(new Error("Authentication error"))
          }
          const session = await getSession()
          if (!session) {
            return next(new Error("Authentication error"))
          }
          socket.data.session = session
          next()
        } catch (error) {
          next(new Error("Authentication error"))
        }
      })

      // @ts-ignore
      global.io.on("connection", (socket) => {
        console.log("Client connected:", socket.id)

        socket.on("join:channel", (channelId) => {
          console.log(`Socket ${socket.id} joining channel:`, channelId)
          socket.join(channelId)
          socket.emit("joined:channel", channelId)
        })

        socket.on("leave:channel", (channelId) => {
          console.log(`Socket ${socket.id} leaving channel:`, channelId)
          socket.leave(channelId)
        })

        socket.on("message:send", async (message) => {
          console.log(`Broadcasting message to channel ${message.channelId}:`, message)
          // Broadcast to all clients in the channel EXCEPT the sender
          socket.to(message.channelId).emit("message:receive", message)
        })

        socket.on("disconnect", () => {
          console.log("Client disconnected:", socket.id)
        })
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Socket.IO server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export { ioHandler as GET, ioHandler as POST }

