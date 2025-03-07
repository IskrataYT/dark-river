"use client"

import type React from "react"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { sendEmail } from "@/services/email"

interface EmailComposeProps {
  onClose: () => void
  onEmailSent: (isLastStage?: boolean) => void
}

export function EmailCompose({ onClose, onEmailSent }: EmailComposeProps) {
  const [sending, setSending] = useState(false)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [error, setError] = useState("")
  const [feedback, setFeedback] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !body.trim()) {
      const error = "Темата и съобщението са задължителни"
      setError(error)
      return
    }

    setSending(true)
    setError("")
    setFeedback("")

    try {
      const result = await sendEmail(subject, body)

      if (result.triggerFound === false) {
        setFeedback(
          "Съобщението ви е изпратено, но не съдържа очаквания отговор. Опитайте да коригирате съобщението си, за да продължите.",
        )
        return
      }

      onEmailSent(result.isLastStage)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Неуспешно изпращане на съобщение. Моля, опитайте отново.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 p-3 sm:p-4">
        <Button
          variant="ghost"
          className="mb-2 sm:mb-4 font-mono text-xs sm:text-sm text-zinc-400 hover:text-white"
          onClick={onClose}
        >
          <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          НАЗАД
        </Button>
        <h3 className="font-mono text-base sm:text-lg font-bold">НОВО СЪОБЩЕНИЕ</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <div className="flex-1 space-y-3 sm:space-y-4 overflow-y-auto p-3 sm:p-4">
          {error && (
            <div className="rounded border border-red-800 bg-red-950/50 p-2 sm:p-3 text-xs sm:text-sm text-red-500">
              {error}
            </div>
          )}
          {feedback && (
            <div className="rounded border border-yellow-800 bg-yellow-950/50 p-2 sm:p-3 text-xs sm:text-sm text-yellow-500">
              {feedback}
            </div>
          )}

          <div>
            <Label htmlFor="subject" className="font-mono text-xs text-zinc-400">
              ТЕМА
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border-zinc-800 bg-black font-mono text-xs sm:text-sm text-white placeholder:text-zinc-700"
              placeholder="Въведете тема"
              required
            />
          </div>

          <div className="flex-1">
            <Label htmlFor="body" className="font-mono text-xs text-zinc-400">
              СЪОБЩЕНИЕ
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[150px] sm:min-h-[200px] md:min-h-[300px] resize-none border-zinc-800 bg-black font-mono text-xs sm:text-sm text-white placeholder:text-zinc-700"
              placeholder="Напишете вашето съобщение тук..."
              required
            />
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-zinc-800 p-3 sm:p-4 bg-black">
          <Button
            type="submit"
            className="w-full bg-white font-mono text-xs sm:text-sm text-black transition-colors hover:bg-zinc-200"
            disabled={sending}
          >
            {sending ? (
              <span className="flex items-center justify-center">
                <span className="mr-2">ИЗПРАЩАНЕ</span>
                <span className="loading">...</span>
              </span>
            ) : (
              "ИЗПРАТИ"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

