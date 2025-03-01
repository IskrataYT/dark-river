"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, User, ChevronDown, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  userName: string
  isAdmin?: boolean
}

export function Navbar({ userName, isAdmin = false }: NavbarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
      })
      router.push("/auth")
      router.refresh()
    } catch (error) {
      console.error("Failed to sign out:", error)
    }
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-black/50 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-mono text-sm text-white hover:text-zinc-300">
            HOME
          </Link>
          <Link href="/terminal" className="font-mono text-sm text-white hover:text-zinc-300">
            <Button variant="ghost" className="font-mono hover:bg-zinc-800">
              MESSAGES
            </Button>
          </Link>
          <Link href="/notes" className="font-mono text-sm text-white hover:text-zinc-300">
            <Button variant="ghost" className="font-mono hover:bg-zinc-800">
              NOTES
            </Button>
          </Link>
          <Link href="/community" className="font-mono text-sm text-white hover:text-zinc-300">
            <Button variant="ghost" className="font-mono hover:bg-zinc-800">
              COMMUNITY
            </Button>
          </Link>
          <Link href="/how-to-play" className="font-mono text-sm text-white hover:text-zinc-300">
            <Button variant="ghost" className="font-mono hover:bg-zinc-800">
              HOW TO PLAY
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/admin/stages" className="font-mono text-sm text-white hover:text-zinc-300">
              <Button variant="ghost" className="font-mono hover:bg-zinc-800">
                ADMIN
              </Button>
            </Link>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 font-mono text-sm text-white hover:bg-zinc-800"
            >
              <User className="h-4 w-4" />
              <span>{userName}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border-zinc-800 bg-black font-mono text-white z-[100]">
            <DropdownMenuItem className="hover:bg-zinc-800" onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="hover:bg-zinc-800" onClick={() => router.push("/admin/stages")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Stages
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="text-red-500 hover:bg-zinc-800 hover:text-red-400" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

