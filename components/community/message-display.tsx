import { format } from "date-fns"
import { Shield, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Message {
  _id: string
  content: string
  userId: string
  userName: string
  channelId: string
  createdAt: string
  isDeleted: boolean
}

interface MessageDisplayProps {
  message: Message
  isAdmin: boolean
  isModerator: boolean
  currentUserId: string
  onDelete: (messageId: string) => void
  onMute: (userId: string) => void
}

export function MessageDisplay({
  message,
  isAdmin,
  isModerator,
  currentUserId,
  onDelete,
  onMute,
}: MessageDisplayProps) {
  return (
    <div className="group flex items-start space-x-2">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-medium text-white">{message.userName}</span>
          <span className="text-xs text-zinc-500">{format(new Date(message.createdAt), "MMM d, h:mm a")}</span>
          {(isAdmin || isModerator) && message.userId !== currentUserId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden h-6 w-6 group-hover:inline-flex">
                  <Shield className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-black text-white">
                <DropdownMenuItem onClick={() => onMute(message.userId)} className="text-red-500">
                  Mute User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p
          className={`whitespace-pre-wrap font-mono text-sm ${message.isDeleted ? "italic text-zinc-500" : "text-white"}`}
        >
          {message.isDeleted ? "This message has been deleted" : message.content}
        </p>
      </div>
      {(isAdmin || isModerator || message.userId === currentUserId) && !message.isDeleted && (
        <Button
          variant="ghost"
          size="icon"
          className="hidden h-8 w-8 group-hover:inline-flex"
          onClick={() => onDelete(message._id)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      )}
    </div>
  )
}

