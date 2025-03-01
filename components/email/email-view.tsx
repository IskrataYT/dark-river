"use client"

import { useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"

interface Email {
  id: string
  subject: string
  body: string
  sender: string
  recipient?: string
  timestamp: Date
  read: boolean
}

interface EmailViewProps {
  email: Email
  onClose: () => void
  folder?: "inbox" | "sent"
}

const debug = {
  log: (action: string, data?: any) => {
    console.log(`[EmailView] ${action}`, data || "")
  },
  error: (action: string, error: any) => {
    console.error(`[EmailView] ${action} failed:`, error)
  },
}

export function EmailView({ email, onClose, folder = "inbox" }: EmailViewProps) {
  useEffect(() => {
    const markAsRead = async () => {
      if (!email.read) {
        debug.log("Marking email as read", { emailId: email.id })
        try {
          const response = await fetch("/api/emails/read", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ emailId: email.id }),
          })

          if (!response.ok) {
            throw new Error("Failed to mark email as read")
          }

          debug.log("Email marked as read successfully")
        } catch (error) {
          debug.error("Mark as read", error)
        }
      }
    }

    markAsRead()
  }, [email.id, email.read])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 p-4">
        <Button variant="ghost" className="mb-4 font-mono text-zinc-400 hover:text-white" onClick={onClose}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          BACK
        </Button>

        <h3 className="font-mono text-lg font-bold">{email.subject}</h3>
        <div className="mt-2 space-y-1 text-sm">
          <div className="flex items-center text-zinc-400">
            <span className="w-20 font-mono">FROM:</span>
            <span className="font-mono">{folder === "sent" ? email.recipient : email.sender}</span>
          </div>
          {email.recipient && (
            <div className="flex items-center text-zinc-400">
              <span className="w-20 font-mono">TO:</span>
              <span className="font-mono">{folder === "sent" ? email.sender : email.recipient}</span>
            </div>
          )}
          <div className="flex items-center text-zinc-400">
            <span className="w-20 font-mono">DATE:</span>
            <span className="font-mono">{format(new Date(email.timestamp), "MM/dd/yyyy HH:mm")}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="whitespace-pre-wrap font-mono text-sm">{email.body}</div>
      </div>
    </div>
  )
}

