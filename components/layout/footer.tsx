import { KofiButton } from "@/components/donation/kofi-button"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-black/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Column 1: About */}
          <div>
            <h3 className="heading-font text-sm font-bold text-white mb-4">DARK RIVER</h3>
            <p className="text-xs text-zinc-500 mb-2 body-font">ВЕРСИЯ НА СИСТЕМАТА 2.4.1</p>
            <p className="text-xs text-zinc-500 body-font">ПОВЕРИТЕЛНО</p>
            <div className="mt-4">
              <KofiButton variant="small" />
            </div>
          </div>

          {/* Column 2: Contact */}
          <div>
            <h3 className="heading-font text-sm font-bold text-white mb-4">КОНТАКТИ</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-xs text-zinc-500 body-font">
                <Phone className="h-3 w-3 mr-2" />
                <span>Телефон: +359 98 874 0911</span>
              </li>
              <li className="flex items-center text-xs text-zinc-500 body-font">
                <Mail className="h-3 w-3 mr-2" />
                <span>Имейл: support@darkriver.site</span>
              </li>
              <li className="flex items-start text-xs text-zinc-500 body-font">
                <MapPin className="h-3 w-3 mr-2 mt-0.5" />
                <span>Адрес: ул. Янко Тодоров 40, Етаж 6, Ап. 11</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Links */}
          <div>
            <h3 className="heading-font text-sm font-bold text-white mb-4">ВРЪЗКИ</h3>
            <div className="grid grid-cols-2 gap-2">
              <a href="/terms" className="font-mono text-xs text-zinc-500 hover:text-white">
                УСЛОВИЯ
              </a>
              <a href="/privacy" className="font-mono text-xs text-zinc-500 hover:text-white">
                ПОВЕРИТЕЛНОСТ
              </a>
              <a href="/contact" className="font-mono text-xs text-zinc-500 hover:text-white">
                КОНТАКТ
              </a>
              <a href="/rules" className="font-mono text-xs text-zinc-500 hover:text-white">
                ПРАВИЛА
              </a>
              <a href="/how-to-play" className="font-mono text-xs text-zinc-500 hover:text-white">
                КАК ДА ИГРАЯ
              </a>
            </div>
            <p className="mt-4 text-xs text-zinc-500 body-font">DARK RIVER © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

