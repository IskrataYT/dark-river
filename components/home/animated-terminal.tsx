"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface AnimatedTerminalProps {
  userName: string
}

export default function AnimatedTerminal({ userName }: AnimatedTerminalProps) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Delay animation start to improve initial page load
    const timer = setTimeout(() => {
      setLoaded(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (!loaded) {
    return (
      <div className="relative rounded-lg border border-zinc-800 bg-black p-4 h-64">
        <div className="font-mono text-sm text-green-500">Initializing terminal...</div>
      </div>
    )
  }

  return (
    <div className="relative rounded-lg border border-zinc-800 bg-black p-4 h-64">
      <div className="font-mono text-sm text-green-500 h-full overflow-hidden">
        <div className="typing-animation">
          <p style={{ "--index": 0 } as React.CSSProperties}>> Инициализиране на системата...</p>
          <p style={{ "--index": 1 } as React.CSSProperties}>> Установяване на сигурна връзка</p>
          <p style={{ "--index": 2 } as React.CSSProperties}>> Декриптиране на данни</p>
          <p style={{ "--index": 3 } as React.CSSProperties}>> Достъп разрешен</p>
          <p style={{ "--index": 4 } as React.CSSProperties}>> Добре дошли в Dark River, агент {userName}</p>
          <p style={{ "--index": 5 } as React.CSSProperties}>> Имате (1) непрочетено съобщение</p>
          <p style={{ "--index": 6 } as React.CSSProperties}>> Съдържанието е класифицирано</p>
          <p className="blink" style={{ "--index": 7 } as React.CSSProperties}>
            _
          </p>
        </div>
      </div>
    </div>
  )
}

