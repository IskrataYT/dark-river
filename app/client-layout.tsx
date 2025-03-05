"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { BanCheck } from "@/components/ban-check"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Only include BanCheck on non-auth pages
  const showBanCheck = !pathname.startsWith("/auth")

  return (
    <>
      {showBanCheck && <BanCheck />}
      {children}
    </>
  )
}

