import type React from "react"
import type { Metadata } from "next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Dark River | Интерактивно разследване",
  description: "Влезте в света на Dark River - интерактивно разследване с мистериозни съобщения и загадки",
  keywords: ["Dark River", "интерактивно разследване", "мистерия", "загадки", "онлайн игра"],
  authors: [{ name: "Dark River Team" }],
  creator: "Dark River",
  publisher: "Dark River",
  openGraph: {
    title: "Dark River | Интерактивно разследване",
    description: "Влезте в света на Dark River - интерактивно разследване с мистериозни съобщения и загадки",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bg">
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
          as="style"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
          as="style"
        />
        {/* Preload noise texture */}
        <link rel="preload" href="/noise.svg" as="image" />
      </head>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}



import './globals.css'