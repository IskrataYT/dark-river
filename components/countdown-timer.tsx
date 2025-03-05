"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"

interface CountdownTimerProps {
  endTime: string
  message: string
  isActive: boolean
}

export function CountdownTimer({ endTime, message, isActive }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isExpired, setIsExpired] = useState(false)
  const [pulseEffect, setPulseEffect] = useState(false)

  useEffect(() => {
    // If not active, don't show the countdown
    if (!isActive) {
      setIsExpired(true)
      return
    }

    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime()

      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setIsExpired(false)
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    // Add pulse effect every 10 seconds
    const pulseTimer = setInterval(() => {
      setPulseEffect(true)
      setTimeout(() => setPulseEffect(false), 1000)
    }, 10000)

    return () => {
      clearInterval(timer)
      clearInterval(pulseTimer)
    }
  }, [endTime, isActive])

  // Pulse effect when seconds change to 0
  useEffect(() => {
    if (timeLeft.seconds === 0) {
      setPulseEffect(true)
      const timeout = setTimeout(() => setPulseEffect(false), 1000)
      return () => clearTimeout(timeout)
    }
  }, [timeLeft.seconds])

  if (isExpired || !isActive) {
    return null
  }

  return (
    <div
      className={`w-full rounded-lg border border-red-900 bg-gradient-to-r from-black via-red-950/30 to-black p-4 mb-6 shadow-lg transition-all duration-500 ${pulseEffect ? "scale-[1.02] border-red-600" : ""}`}
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center mb-3 w-full justify-center">
          <AlertCircle className={`mr-2 h-5 w-5 text-red-500 ${pulseEffect ? "animate-pulse" : ""}`} />
          <h3 className="font-mono text-base sm:text-lg font-bold text-red-500 uppercase tracking-wider">{message}</h3>
        </div>

        <div className="grid grid-cols-4 gap-2 w-full max-w-md">
          <TimeUnit value={timeLeft.days} label="ДЕНА" />
          <TimeUnit value={timeLeft.hours} label="ЧАСА" />
          <TimeUnit value={timeLeft.minutes} label="МИН" />
          <TimeUnit value={timeLeft.seconds} label="СЕК" pulse={timeLeft.seconds <= 10} />
        </div>

        <div className="mt-3 text-center">
          <p className="text-xs text-red-400/80 font-mono">ОЧАКВАЙТЕ НОВИ ИНСТРУКЦИИ</p>
        </div>
      </div>
    </div>
  )
}

interface TimeUnitProps {
  value: number
  label: string
  pulse?: boolean
}

function TimeUnit({ value, label, pulse = false }: TimeUnitProps) {
  return (
    <div className={`flex flex-col items-center ${pulse ? "animate-pulse" : ""}`}>
      <div className="bg-black/80 border border-red-800 rounded-md w-full py-2 px-1 flex items-center justify-center">
        <span className="font-mono text-xl sm:text-2xl font-bold text-red-500">{String(value).padStart(2, "0")}</span>
      </div>
      <span className="text-xs text-red-400/80 mt-1 font-mono">{label}</span>
    </div>
  )
}

