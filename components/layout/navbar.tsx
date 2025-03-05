"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, User, ChevronDown, Settings, Menu, Heart } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface NavbarProps {
  userName: string
  isAdmin?: boolean
  isDonor?: boolean
}

export function Navbar({ userName, isAdmin = false, isDonor = false }: NavbarProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
    <nav className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/" className="text-sm text-white hover:text-zinc-300">
            <Button variant="ghost" className="font-mono hover:bg-zinc-900">
              НАЧАЛО
            </Button>
          </Link>
          <Link href="/terminal" className="text-sm text-white hover:text-zinc-300">
            <Button variant="ghost" className="font-mono hover:bg-zinc-900">
              СЪОБЩЕНИЯ
            </Button>
          </Link>
          <Link href="/notes" className="text-sm text-white hover:text-zinc-300">
            <Button variant="ghost" className="font-mono hover:bg-zinc-900">
              БЕЛЕЖКИ
            </Button>
          </Link>
          <Link href="/community" className="text-sm text-white hover:text-zinc-300">
            <Button variant="ghost" className="font-mono hover:bg-zinc-900">
              ОБЩНОСТ
            </Button>
          </Link>
          <Link href="/how-to-play" className="text-sm text-white hover:text-zinc-300">
            <Button variant="ghost" className="font-mono hover:bg-zinc-900">
              КАК ДА ИГРАЯ
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-sm text-white hover:text-zinc-300">
              <Button variant="ghost" className="font-mono hover:bg-zinc-900">
                АДМИН
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            className="p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Отвори меню"
          >
            <Menu className="h-8 w-8 text-white" />
          </Button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="absolute left-0 right-0 top-16 z-50 bg-black/95 p-4 backdrop-blur-sm md:hidden">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-sm text-white hover:text-zinc-300 w-full">
                <Button variant="ghost" className="font-mono hover:bg-zinc-900 w-full justify-start">
                  НАЧАЛО
                </Button>
              </Link>
              <Link href="/terminal" className="text-sm text-white hover:text-zinc-300 w-full">
                <Button variant="ghost" className="font-mono hover:bg-zinc-900 w-full justify-start">
                  СЪОБЩЕНИЯ
                </Button>
              </Link>
              <Link href="/notes" className="text-sm text-white hover:text-zinc-300 w-full">
                <Button variant="ghost" className="font-mono hover:bg-zinc-900 w-full justify-start">
                  БЕЛЕЖКИ
                </Button>
              </Link>
              <Link href="/community" className="text-sm text-white hover:text-zinc-300 w-full">
                <Button variant="ghost" className="font-mono hover:bg-zinc-900 w-full justify-start">
                  ОБЩНОСТ
                </Button>
              </Link>
              <Link href="/how-to-play" className="text-sm text-white hover:text-zinc-300 w-full">
                <Button variant="ghost" className="font-mono hover:bg-zinc-900 w-full justify-start">
                  КАК ДА ИГРАЯ
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-sm text-white hover:text-zinc-300 w-full">
                  <Button variant="ghost" className="font-mono hover:bg-zinc-900 w-full justify-start">
                    АДМИН
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center">
              {isDonor && (
                <div className="mr-2 rounded-full bg-purple-900/50 px-2 py-0.5 text-xs text-purple-400 border border-purple-800">
                  <Heart className="inline-block mr-1 h-3 w-3" />
                  Дарител
                </div>
              )}
              <Button
                variant="ghost"
                className="flex items-center space-x-2 font-mono text-sm text-white hover:bg-zinc-900"
              >
                <User className="h-4 w-4" />
                <span>{userName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border-zinc-800 bg-black font-mono text-white z-[1000]">
            <DropdownMenuItem className="hover:bg-zinc-900" onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" />
              Редактирай профил
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator className="bg-zinc-900" />
                <DropdownMenuItem className="hover:bg-zinc-900" onClick={() => router.push("/admin")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Управление на етапи
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator className="bg-zinc-900" />
            <DropdownMenuItem className="text-red-500 hover:bg-zinc-900 hover:text-red-400" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Изход
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

