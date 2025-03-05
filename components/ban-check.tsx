"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"

export function BanCheck() {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(false)
  const [lastCheckTime, setLastCheckTime] = useState(0)

  const checkBanStatus = useCallback(async () => {
    const now = Date.now()
    console.log("[BanCheck] Current path:", pathname)
    console.log("[BanCheck] Time since last check:", now - lastCheckTime, "ms")

    // Prevent checking if already checking or if last check was less than 10 seconds ago
    if (checking || now - lastCheckTime < 10000) {
      console.log("[BanCheck] Skipping check - too soon or already checking")
      return
    }

    try {
      console.log("[BanCheck] Checking ban status...")
      setChecking(true)
      const response = await fetch("/api/auth/check-ban", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        console.error("[BanCheck] Error response:", response.status, response.statusText)
        return
      }

      const data = await response.json()
      console.log("[BanCheck] Ban check response:", data)
      setLastCheckTime(now)

      if (data.isBanned && pathname !== "/banned") {
        console.log("[BanCheck] User is banned, redirecting to /banned")
        router.push("/banned")
      } else {
        console.log("[BanCheck] User is not banned or already on /banned page")
      }
    } catch (error) {
      console.error("[BanCheck] Error checking ban status:", error)
    } finally {
      setChecking(false)
    }
  }, [router, checking, pathname, lastCheckTime])

  useEffect(() => {
    console.log("[BanCheck] Component mounted/updated")

    // Skip check if already on the banned page
    if (pathname === "/banned") {
      console.log("[BanCheck] Already on /banned page, skipping check")
      return
    }

    // Initial check
    console.log("[BanCheck] Performing initial check")
    checkBanStatus()

    // Then check periodically
    console.log("[BanCheck] Setting up interval checks")
    const interval = setInterval(checkBanStatus, 30000)

    return () => {
      console.log("[BanCheck] Cleaning up interval")
      clearInterval(interval)
    }
  }, [checkBanStatus, pathname])

  return null
}

