"use client"

import { Heart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState } from "react"

interface KofiButtonProps {
  kofiUsername?: string
  variant?: "default" | "outline" | "small"
}

export function KofiButton({ kofiUsername = "iskrenminkov", variant = "default" }: KofiButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleOpenKofi = () => {
    // Open Ko-fi in a new tab
    window.open(`https://ko-fi.com/${kofiUsername}`, "_blank")
    // Set success state to show thank you message
    setIsSuccess(true)
  }

  const resetDialog = () => {
    console.log("[Donation] Resetting donation dialog")
    setIsDialogOpen(false)
    setIsSuccess(false)
  }

  if (variant === "small") {
    return (
      <Button
        onClick={handleOpenKofi}
        variant="outline"
        size="sm"
        className="border-zinc-800 bg-black hover:bg-zinc-900 text-white font-mono"
      >
        <Heart className="mr-2 h-3 w-3" />
        Подкрепете
      </Button>
    )
  }

  if (variant === "outline") {
    return (
      <Button
        onClick={handleOpenKofi}
        variant="outline"
        className="border-zinc-800 bg-black hover:bg-zinc-900 text-white font-mono"
      >
        <Heart className="mr-2 h-4 w-4" />
        ПОДКРЕПЕТЕ DARK RIVER
      </Button>
    )
  }

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} className="bg-white hover:bg-zinc-200 text-black font-mono">
        <Heart className="mr-2 h-4 w-4" />
        ПОДКРЕПЕТЕ DARK RIVER
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={resetDialog}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="font-mono text-xl">Подкрепете Dark River</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Вашата подкрепа ни помага да създаваме нови етапи и да подобряваме платформата.
            </DialogDescription>
          </DialogHeader>

          {isSuccess ? (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center justify-center space-y-3 p-4">
                <div className="rounded-full bg-green-900/30 p-3">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-green-500">Благодарим ви!</h3>
                <p className="text-center text-zinc-400">
                  Благодарим ви за подкрепата! Вашето дарение ще помогне за развитието на Dark River.
                </p>
                <p className="text-center text-zinc-300 mt-2">
                  След като администраторът потвърди вашето дарение, ще получите достъп до ексклузивно съдържание.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-center">
                <p className="mb-4 text-zinc-300">
                  Можете да подкрепите Dark River чрез Ko-fi - бърз и лесен начин за дарение.
                </p>

                <Button onClick={handleOpenKofi} className="bg-white hover:bg-zinc-200 text-black font-mono">
                  <Heart className="mr-2 h-4 w-4" />
                  Подкрепете в Ko-fi
                </Button>
              </div>

              <div className="text-xs text-zinc-500 text-center">
                След като направите дарение, администраторът ще потвърди вашия статус на дарител ръчно.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

