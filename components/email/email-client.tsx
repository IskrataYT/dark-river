"use client"

import { useState, useCallback, useEffect } from "react"
import { Mail, Send, File, AlertTriangle } from "lucide-react"
import { EmailInbox } from "./email-inbox"
import { EmailCompose } from "./email-compose"
import { EmailView } from "./email-view"
import { Button } from "@/components/ui/button"

type Folder = "inbox" | "sent" | "drafts" | "junk"
type Email = {
  id: string
  subject: string
  body: string
  sender: string
  recipient?: string
  timestamp: Date
  read: boolean
}

const debug = {
  log: (component: string, action: string, data?: any) => {
    console.log(`[${component}] ${action}`, data || "")
  },
  error: (component: string, action: string, error: any) => {
    console.error(`[${component}] ${action} failed:`, error)
  },
}

export function EmailClient() {
  const [currentFolder, setCurrentFolder] = useState<Folder>("inbox")
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isLastStage, setIsLastStage] = useState(false)

  useEffect(() => {
    debug.log("EmailClient", "Mounted")
    return () => debug.log("EmailClient", "Unmounted")
  }, [])

  const handleEmailSent = useCallback(() => {
    debug.log("EmailClient", "Email sent, refreshing")
    setShowCompose(false)
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const handleEmailClosed = useCallback(() => {
    debug.log("EmailClient", "Email closed, refreshing")
    setSelectedEmail(null)
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const handleLastStageChange = useCallback((lastStage: boolean) => {
    debug.log("EmailClient", "Last stage status changed", { lastStage })
    setIsLastStage(lastStage)
  }, [])

  const handleFolderClick = (folder: Folder) => {
    debug.log("EmailClient", "Folder clicked", { folder })
    if (folder === "drafts" || folder === "junk") {
      alert("ACCESS RESTRICTED: This folder is currently locked.")
      return
    }
    setCurrentFolder(folder)
    setSelectedEmail(null)
    setShowCompose(false)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-lg border border-zinc-800 bg-black text-white">
      <div className="flex items-center justify-between border-b border-zinc-800 p-4">
        <h2 className="font-mono text-xl font-bold">DARK RIVER TERMINAL</h2>
        {!showCompose && (
          <Button
            onClick={() => {
              setShowCompose(true)
              setSelectedEmail(null)
            }}
            className="bg-white font-mono text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLastStage}
            title={isLastStage ? "You have completed all available stages!" : ""}
          >
            COMPOSE
          </Button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 border-r border-zinc-800 bg-zinc-950">
          <div className="space-y-1 p-2">
            <Button
              variant="ghost"
              className={`w-full justify-start font-mono ${
                currentFolder === "inbox" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              }`}
              onClick={() => handleFolderClick("inbox")}
            >
              <Mail className="mr-2 h-4 w-4" />
              INBOX
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start font-mono ${
                currentFolder === "sent" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              }`}
              onClick={() => handleFolderClick("sent")}
            >
              <Send className="mr-2 h-4 w-4" />
              SENT
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start font-mono text-zinc-400 hover:text-white"
              onClick={() => handleFolderClick("drafts")}
            >
              <File className="mr-2 h-4 w-4" />
              DRAFTS
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start font-mono text-zinc-400 hover:text-white"
              onClick={() => handleFolderClick("junk")}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              JUNK
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {showCompose ? (
            <EmailCompose onClose={() => setShowCompose(false)} onEmailSent={handleEmailSent} />
          ) : selectedEmail ? (
            <EmailView email={selectedEmail} onClose={handleEmailClosed} folder={currentFolder} />
          ) : (
            <EmailInbox
              folder={currentFolder}
              onSelectEmail={setSelectedEmail}
              refreshTrigger={refreshTrigger}
              onLastStageChange={handleLastStageChange}
              isLastStage={isLastStage}
            />
          )}
        </div>
      </div>
    </div>
  )
}

