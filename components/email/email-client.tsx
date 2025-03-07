"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Send, File, AlertTriangle, Menu, Mail } from "lucide-react"
import { EmailInbox } from "./email-inbox"
import { EmailCompose } from "./email-compose"
import { EmailView } from "./email-view"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ClientCountdownTimer } from "@/components/client-countdown-timer"

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

export function EmailClient() {
  const [currentFolder, setCurrentFolder] = useState<Folder>("inbox")
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isLastStage, setIsLastStage] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleEmailSent = useCallback(() => {
    setShowCompose(false)
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const handleEmailClosed = useCallback(() => {
    setSelectedEmail(null)
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const handleLastStageChange = useCallback((lastStage: boolean) => {
    setIsLastStage(lastStage)
  }, [])

  const handleFolderClick = (folder: Folder) => {
    if (folder === "drafts" || folder === "junk") {
      alert("ДОСТЪП ОГРАНИЧЕН: Тази папка е заключена в момента.")
      return
    }
    setCurrentFolder(folder)
    setSelectedEmail(null)
    setShowCompose(false)
    setIsSidebarOpen(false)
  }

  const renderFolderButton = (folder: Folder, icon: React.ReactNode, label: string, shortLabel: string) => (
    <Button
      variant="ghost"
      className={`w-full justify-start font-mono text-xs sm:text-sm ${
        currentFolder === folder ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
      }`}
      onClick={() => handleFolderClick(folder)}
    >
      {icon}
      <span className="hidden sm:inline ml-2">{label}</span>
      <span className="sm:hidden ml-2">{shortLabel}</span>
    </Button>
  )

  const folderList = (
    <div className="space-y-1 p-2">
      {renderFolderButton("inbox", <Mail className="h-4 w-4" />, "ВХОДЯЩИ", "ВХ")}
      {renderFolderButton("sent", <Send className="h-4 w-4" />, "ИЗПРАТЕНИ", "ИЗП")}
      {renderFolderButton("drafts", <File className="h-4 w-4" />, "ЧЕРНОВИ", "ЧЕР")}
      {renderFolderButton("junk", <AlertTriangle className="h-4 w-4" />, "НЕЖЕЛАНИ", "НЕЖ")}
    </div>
  )

  return (
    <div className="space-y-4">
      <ClientCountdownTimer />
      <div className="flex h-[calc(100vh-16rem)] flex-col rounded-lg border border-zinc-800 bg-black text-white">
        <div className="flex items-center justify-between border-b border-zinc-800 p-2 sm:p-4">
          <div className="flex items-center gap-2">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[200px] bg-black p-0">
                {folderList}
              </SheetContent>
            </Sheet>
            <h2 className="font-mono text-base sm:text-xl font-bold">DARK RIVER ТЕРМИНАЛ</h2>
          </div>
          {!showCompose && (
            <Button
              onClick={() => {
                setShowCompose(true)
                setSelectedEmail(null)
              }}
              className="bg-white font-mono text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 text-xs sm:text-sm px-2 sm:px-4"
              disabled={isLastStage}
              title={isLastStage ? "Завършили сте всички налични етапи!" : ""}
            >
              СЪСТАВЯНЕ
            </Button>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="hidden md:block w-48 border-r border-zinc-800 bg-zinc-950">{folderList}</div>

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
    </div>
  )
}

