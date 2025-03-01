"use client"

import { useSearchParams } from "next/navigation"
import { LoadingAnimation } from "@/components/loading-animation"

export default function LoadingPage() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"

  return <LoadingAnimation redirectTo={redirectTo} />
}

