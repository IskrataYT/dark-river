"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface EmailComposeProps {
  onClose: () => void
  onEmailSent: (isLastStage?: boolean) => void
}

const debug = {
  log: (action: string, data?: any) => {
    console.log(`[EmailCompose] ${action}`, data || "")
  },
  error: (action: string, error: any) => {
    console.error(`[EmailCompose] ${action} failed:`, error)
    console.trace()
  },
}

export function EmailCompose({ onClose, onEmailSent }: EmailComposeProps) {
  const [sending, setSending] = useState(false)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [error, setError] = useState("")
  const [feedback, setFeedback] = useState("")

  const sendEmail = useCallback(async (subject: string, body: string) => {
    debug.log("sendEmail called", { subject, bodyLength: body.length })

    const response = await fetch("/api/emails/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject,
        body,
      }),
    })

    debug.log("Response received", {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return data
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    debug.log("Form submission started", {
      subject,
      bodyLength: body.length,
      event: e.type,
      target: e.target instanceof HTMLFormElement ? "form" : "unknown",
    })

    if (!subject.trim() || !body.trim()) {
      const error = "Subject and message are required"
      debug.log("Validation failed", { error })
      setError(error)
      return
    }

    setSending(true)
    setError("")
    setFeedback("")

    try {
      debug.log("Attempting to send email")
      const result = await sendEmail(subject, body)
      debug.log("Email sent successfully", result)

      if (result.triggerFound === false) {
        setFeedback(
          "Your message has been sent, but it didn't contain the expected response. Try adjusting your message to progress.",
        )
        return
      }

      onEmailSent(result.isLastStage)
    } catch (error) {
      debug.error("Send email", error)
      setError(error instanceof Error ? error.message : "Failed to send email. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 p-4">
        <Button variant="ghost" className="mb-4 font-mono text-zinc-400 hover:text-white" onClick={onClose}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          BACK
        </Button>
        <h3 className="font-mono text-lg font-bold">NEW MESSAGE</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {error && <div className="rounded border border-red-800 bg-red-950/50 p-3 text-sm text-red-500">{error}</div>}
          {feedback && (
            <div className="rounded border border-yellow-800 bg-yellow-950/50 p-3 text-sm text-yellow-500">
              {feedback}
            </div>
          )}

          <div>
            <Label htmlFor="subject" className="font-mono text-xs text-zinc-400">
              SUBJECT
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border-zinc-800 bg-black font-mono text-sm text-white placeholder:text-zinc-700"
              placeholder="Enter subject"
              required
            />
          </div>

          <div className="flex-1">
            <Label htmlFor="body" className="font-mono text-xs text-zinc-400">
              MESSAGE
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[300px] resize-none border-zinc-800 bg-black font-mono text-sm text-white placeholder:text-zinc-700"
              placeholder="Type your message here..."
              required
            />
          </div>
        </div>

        <div className="border-t border-zinc-800 p-4">
          <Button
            type="submit"
            className="w-full bg-white font-mono text-sm text-black transition-colors hover:bg-zinc-200"
            disabled={sending}
          >
            {sending ? (
              <span className="flex items-center justify-center">
                <span className="mr-2">SENDING</span>
                <span className="loading">...</span>
              </span>
            ) : (
              "SEND"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

