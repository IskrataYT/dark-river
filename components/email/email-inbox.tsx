"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Mail } from "lucide-react"

interface Email {
  id: string
  subject: string
  body: string
  sender: string
  recipient?: string
  timestamp: Date
  read: boolean
}

interface EmailInboxProps {
  folder: "inbox" | "sent"
  onSelectEmail: (email: Email) => void
  refreshTrigger: number
  onLastStageChange?: (isLastStage: boolean) => void
  isLastStage?: boolean
}

const debug = {
  log: (action: string, data?: any) => {
    console.log(`[EmailInbox] ${action}`, data || "")
  },
  error: (action: string, error: any) => {
    console.error(`[EmailInbox] ${action} failed:`, error)
  },
}

export function EmailInbox({ folder, onSelectEmail, refreshTrigger, onLastStageChange, isLastStage }: EmailInboxProps) {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    debug.log("Component mounted/updated", { folder, refreshTrigger })
    fetchEmails()
  }, [folder, refreshTrigger])

  const fetchEmails = async () => {
    debug.log("Fetching emails started", { folder, refreshTrigger })
    try {
      const response = await fetch(`/api/emails/${folder}`)
      debug.log("Fetch response received", {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to fetch emails")

      const parsedEmails = data.emails.map((email: any) => ({
        ...email,
        timestamp: new Date(email.timestamp),
      }))

      debug.log("Emails fetched successfully", {
        emailCount: parsedEmails.length,
        firstEmail: parsedEmails[0],
      })

      setEmails(parsedEmails)
      if (onLastStageChange) {
        onLastStageChange(data.isLastStage)
      }
    } catch (error) {
      debug.error("Fetch emails", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    debug.log("Rendering loading state")
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  if (emails.length === 0) {
    debug.log("Rendering empty state")
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-zinc-400">
          <Mail className="mx-auto mb-2 h-8 w-8" />
          No messages
        </div>
      </div>
    )
  }

  if (isLastStage) {
    return (
      <div className="h-full overflow-auto">
        <div className="border-b border-green-500/20 bg-green-500/10 p-4">
          <p className="font-mono text-center text-green-500">
            CONGRATULATIONS - YOU HAVE COMPLETED ALL AVAILABLE STAGES
          </p>
        </div>
        {emails.map((email) => (
          <button
            key={email.id}
            onClick={() => onSelectEmail(email)}
            className="block w-full border-b border-zinc-800 p-4 text-left transition-colors hover:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm ${email.read ? "text-zinc-400" : "text-white"}`}>
                    {folder === "sent" ? email.recipient : email.sender}
                  </span>
                  {!email.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                </div>
                <div className={`font-mono ${email.read ? "text-zinc-400" : "text-white"}`}>{email.subject}</div>
              </div>
              <div className="text-xs text-zinc-500">{format(email.timestamp, "MMM d, h:mm a")}</div>
            </div>
          </button>
        ))}
      </div>
    )
  }

  debug.log("Rendering email list", { emailCount: emails.length })
  return (
    <div className="h-full overflow-auto">
      {emails.map((email) => (
        <button
          key={email.id}
          onClick={() => onSelectEmail(email)}
          className="block w-full border-b border-zinc-800 p-4 text-left transition-colors hover:bg-zinc-900"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-sm ${email.read ? "text-zinc-400" : "text-white"}`}>
                  {folder === "sent" ? email.recipient : email.sender}
                </span>
                {!email.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
              </div>
              <div className={`font-mono ${email.read ? "text-zinc-400" : "text-white"}`}>{email.subject}</div>
            </div>
            <div className="text-xs text-zinc-500">{format(email.timestamp, "MMM d, h:mm a")}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

