"use client"

import { format } from "date-fns"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Loader2, AlertTriangle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isMuted: boolean
  isSending: boolean
  muteExpiresAt: Date | null
  spamWarning?: {
    message: string
    details?: {
      reason: string
      explanation: string
    }
  } | null
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isMuted,
  isSending,
  muteExpiresAt,
  spamWarning,
}: ChatInputProps) {
  const [toxicityWarning, setToxicityWarning] = useState<{
    message: string
    details?: {
      category: string
      explanation: string
    }
  } | null>(null)
  const [warningTimeout, setWarningTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim() || isSending || isMuted) {
      if (isMuted && muteExpiresAt) {
        alert(`You are muted until ${format(muteExpiresAt, "MMM d, h:mm a")}`)
      }
      return
    }

    // Clear previous warnings
    setToxicityWarning(null)
    onSubmit()
  }

  // This function would be called from the parent component when a toxicity error is received
  const showToxicityWarning = (message: string, details?: { category: string; explanation: string }) => {
    setToxicityWarning({ message, details })
  }

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
    }

    return () => {
      if (warningTimeout) {
        clearTimeout(warningTimeout)
      }
    }
  }, [toxicityWarning, warningTimeout]) // Added warningTimeout to dependencies

  return (
    <form onSubmit={handleSubmit} className="border-t border-zinc-800 p-4">
      {isMuted && muteExpiresAt && (
        <div className="mb-2 rounded border border-red-800 bg-red-950/50 p-2 text-sm text-red-500">
          Вие сте заглушени до {format(muteExpiresAt, "d MMM, HH:mm")}
        </div>
      )}

      {toxicityWarning && (
        <Alert variant="destructive" className="mb-2 border-red-800 bg-red-950/50 relative">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-white font-bold">Warning</AlertTitle>
          <AlertDescription className="text-white">
            {toxicityWarning.message}
            {toxicityWarning.details && (
              <div className="mt-1 text-xs text-white">
                <p>
                  <strong>Category:</strong> {toxicityWarning.details.category}
                </p>
                <p>
                  <strong>Explanation:</strong> {toxicityWarning.details.explanation}
                </p>
              </div>
            )}
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 text-white hover:bg-red-800"
            onClick={() => setToxicityWarning(null)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </Alert>
      )}

      {spamWarning && (
        <Alert variant="destructive" className="mb-2 border-orange-800 bg-orange-950/50 relative">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-white font-bold">Предупреждение за спам</AlertTitle>
          <AlertDescription className="text-white">
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
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </Alert>
      )}

      <div className="flex space-x-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
  )
}

