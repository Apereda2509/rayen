'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/mapa',      label: 'Mapa' },
  { href: '/especies',  label: 'Especies' },
  { href: '/comunidad', label: 'Comunidad' },
  { href: '/accion',    label: 'Acción' },
  { href: '/educacion', label: 'Educación' },
  { href: '/sobre',     label: 'Sobre' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-teal-900">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <RayenFlower className="h-7 w-7 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
          <span className="text-lg font-semibold tracking-wide text-white">
            Rayen
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-colors',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-teal-700 text-white font-medium'
                  : 'text-emerald-200 hover:text-white hover:bg-teal-800'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Buscar + mobile toggle */}
        <div className="flex items-center gap-2">
          <Link
            href="/especies?buscar=1"
            className="flex items-center gap-1.5 rounded-full bg-teal-700 hover:bg-teal-600 px-3 py-1.5 text-sm text-emerald-100 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Buscar especie</span>
          </Link>

          <button
            className="md:hidden rounded-md p-1.5 text-emerald-200 hover:text-white hover:bg-teal-800"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Nav móvil */}
      {mobileOpen && (
        <div className="md:hidden border-t border-teal-800 bg-teal-900 px-4 py-3">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block rounded-md px-3 py-2 text-sm',
                pathname === href
                  ? 'bg-teal-700 text-white font-medium'
                  : 'text-emerald-200 hover:text-white hover:bg-teal-800'
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}

// Ícono floral SVG de Rayen
function RayenFlower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.9" />
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180
        const cx = 12 + Math.cos(rad) * 5.5
        const cy = 12 + Math.sin(rad) * 5.5
        return <circle key={angle} cx={cx} cy={cy} r="3" fill="currentColor" opacity="0.75" />
      })}
    </svg>
  )
}
