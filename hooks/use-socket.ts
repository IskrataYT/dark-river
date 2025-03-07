"use client"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"

const useSocket = () => {
  const [socket, setSocket] = useState<any>(null)

  useEffect(() => {
    const newSocket = io()
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  return socket
}

export { useSocket }

