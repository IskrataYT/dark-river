"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, User, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProfileFormProps {
  initialName: string
  userEmail: string
}

export function ProfileForm({ initialName, userEmail }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState(initialName)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword && newPassword !== confirmPassword) {
      setError("New access codes do not match")
      return
    }

    if (newPassword && !currentPassword) {
      setError("Current access code is required to set a new one")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      // Refresh the page to update the session
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="font-mono text-xs text-zinc-400">
          EMAIL IDENTIFIER
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            value={userEmail}
            disabled
            className="border-zinc-800 bg-zinc-900 pl-3 font-mono text-sm text-zinc-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="font-mono text-xs text-zinc-400">
          AGENT NAME
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-zinc-800 bg-black pl-10 font-mono text-sm text-white placeholder:text-zinc-700"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentPassword" className="font-mono text-xs text-zinc-400">
          CURRENT ACCESS CODE
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="currentPassword"
            type={showPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter to change access code"
            className="border-zinc-800 bg-black pl-10 pr-10 font-mono text-sm text-white placeholder:text-zinc-700"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword" className="font-mono text-xs text-zinc-400">
          NEW ACCESS CODE
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Optional"
            className="border-zinc-800 bg-black pl-10 pr-10 font-mono text-sm text-white placeholder:text-zinc-700"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="font-mono text-xs text-zinc-400">
          CONFIRM NEW ACCESS CODE
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Optional"
            className="border-zinc-800 bg-black pl-10 pr-10 font-mono text-sm text-white placeholder:text-zinc-700"
          />
        </div>
      </div>

      {error && <div className="text-xs text-red-500 font-mono">{error}</div>}

      <Button
        type="submit"
        className="w-full bg-white font-mono text-sm text-black transition-colors hover:bg-zinc-200"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="mr-2">PROCESSING</span>
            <span className="loading">...</span>
          </span>
        ) : (
          "UPDATE PROFILE"
        )}
      </Button>
    </form>
  )
}

