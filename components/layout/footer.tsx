import Link from "next/link"

export function Footer() {
  return (
    <footer className="fixed bottom-0 w-full border-t border-zinc-800 bg-black/50 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <span className="font-mono text-xs text-zinc-500">SYSTEM VERSION 2.4.1</span>
          <span className="font-mono text-xs text-zinc-500">//</span>
          <span className="font-mono text-xs text-zinc-500">CLASSIFIED</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/terms" className="font-mono text-xs text-zinc-500 hover:text-white">
            TERMS
          </Link>
          <Link href="/privacy" className="font-mono text-xs text-zinc-500 hover:text-white">
            PRIVACY
          </Link>
          <Link href="/contact" className="font-mono text-xs text-zinc-500 hover:text-white">
            CONTACT
          </Link>
          <span className="font-mono text-xs text-zinc-500">{new Date().getFullYear()} DARK RIVER</span>
        </div>
      </div>
    </footer>
  )
}

