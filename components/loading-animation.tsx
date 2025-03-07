"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTypewriter } from "@/hooks/use-typewriter"

interface LoadingAnimationProps {
  redirectTo?: string
  delay?: number
}

export function LoadingAnimation({ redirectTo = "/", delay = 500 }: LoadingAnimationProps) {
  const router = useRouter()
  const [showCursor, setShowCursor] = useState(true)

  const messages = [
    "ИНИЦИАЛИЗИРАНЕ НА DARK RIVER ПРОТОКОЛИ",
    "УСТАНОВЯВАНЕ НА СИГУРНА ВРЪЗКА",
    "ДЕКРИПТИРАНЕ НА ДОСТЪПНИ ДАННИ",
    "УДОСТОВЕРЯВАНЕ НА САМОЛИЧНОСТ НА АГЕНТА",
    "ДОСТЪП РАЗРЕШЕН",
  ]

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  const handleComplete = useCallback(() => {
    console.log(`Съобщение ${currentMessageIndex + 1} завършено.`)

    if (currentMessageIndex < messages.length - 1) {
      setTimeout(() => {
        setCurrentMessageIndex((prev) => prev + 1)
      }, 500)
    } else {
      console.log("Пренасочване към:", redirectTo)
      setTimeout(() => {
        router.push(redirectTo)
      }, 1000)
    }
  }, [currentMessageIndex, redirectTo, router])

  const { displayText, isComplete } = useTypewriter({
    text: messages[currentMessageIndex],
    speed: 40,
    delay: currentMessageIndex === 0 ? delay : 0,
    onComplete: handleComplete,
  })

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="relative w-full max-w-3xl px-4">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>
        <div className="relative z-10">
          <h1 className="mb-8 sm:mb-12 font-mono text-3xl sm:text-5xl font-bold tracking-tighter text-white text-center">
            DARK RIVER
          </h1>

          <div className="h-48 sm:h-64 overflow-hidden">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`transition-opacity duration-500 ${
                  index === currentMessageIndex
                    ? "opacity-100"
                    : index < currentMessageIndex
                      ? "opacity-30 text-zinc-600"
                      : "opacity-0"
                }`}
              >
                <div className="font-mono text-base sm:text-xl md:text-2xl mb-4 flex items-center">
                  <span className="text-green-500 mr-2">&gt;</span>
                  <span>{index === currentMessageIndex ? displayText : message}</span>
                  {index === currentMessageIndex && !isComplete && (
                    <span
                      className={`ml-1 inline-block w-2 sm:w-3 h-4 sm:h-6 bg-white transition-opacity duration-200 ${
                        showCursor ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 flex justify-center">
            <div className="w-8 sm:w-12 h-8 sm:h-12 rounded-full border-t-2 border-r-2 border-white animate-spin"></div>
          </div>

          <div className="mt-6 sm:mt-8 text-center text-xs text-zinc-600">
            <p>ВЕРСИЯ НА СИСТЕМАТА 2.4.1 // ПОВЕРИТЕЛНО</p>
          </div>
        </div>
      </div>
    </div>
  )
}

