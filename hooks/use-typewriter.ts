"use client"

import { useState, useEffect, useRef } from "react"

interface UseTypewriterProps {
  text: string
  speed?: number
  delay?: number
  onComplete?: () => void
}

export function useTypewriter({ text, speed = 50, delay = 0, onComplete }: UseTypewriterProps) {
  const [displayText, setDisplayText] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const currentIndexRef = useRef(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Reset state
    setDisplayText("")
    setIsComplete(false)
    currentIndexRef.current = 0

    // Clear any existing timers
    if (timerRef.current) clearInterval(timerRef.current)
    if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current)

    if (!text) return

    delayTimeoutRef.current = setTimeout(() => {
      timerRef.current = setInterval(() => {
        if (currentIndexRef.current < text.length) {
          setDisplayText(text.substring(0, currentIndexRef.current + 1))
          currentIndexRef.current++
        } else {
          if (timerRef.current) clearInterval(timerRef.current)
          timerRef.current = null
          setIsComplete(true)
          onComplete?.()
        }
      }, speed)
    }, delay)

    // Cleanup function
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current)
    }
  }, [text, speed, delay, onComplete])

  return { displayText, isComplete }
}

