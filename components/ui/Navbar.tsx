'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Search, LogIn, LogOut, User, Plus } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
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
  const { data: session, status } = useSession()

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

        {/* Buscar + sesión + mobile toggle */}
        <div className="flex items-center gap-2">
          <Link
            href="/especies?buscar=1"
            className="flex items-center gap-1.5 rounded-full bg-teal-700 hover:bg-teal-600 px-3 py-1.5 text-sm text-emerald-100 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Buscar especie</span>
          </Link>

          {/* Reportar avistamiento — siempre visible */}
          {status !== 'loading' && (
            <Link
              href={session ? '/avistamientos/nuevo' : '/login?callbackUrl=/avistamientos/nuevo&razon=reporte'}
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 text-sm font-medium text-white transition-colors"
              title="Reportar avistamiento"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Reportar</span>
            </Link>
          )}

          {/* Auth — siempre visible; se actualiza cuando resuelve la sesión */}
          {session ? (
            <div className="hidden md:flex items-center gap-2">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? 'Usuario'}
                  width={28}
                  height={28}
                  className="rounded-full ring-2 ring-emerald-400"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-700">
                  <User className="h-4 w-4 text-emerald-200" />
                </span>
              )}
              <span className="hidden lg:block text-sm text-emerald-100 max-w-[120px] truncate">
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-emerald-200 hover:text-white hover:bg-teal-800 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : status !== 'loading' ? (
            <Link
              href="/login"
              className="hidden md:flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-emerald-200 hover:text-white hover:bg-teal-800 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Iniciar sesión
            </Link>
          ) : null}

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

          {/* Reportar en móvil — siempre visible */}
          {status !== 'loading' && (
            <Link
              href={session ? '/avistamientos/nuevo' : '/login?callbackUrl=/avistamientos/nuevo&razon=reporte'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-emerald-300 hover:text-white hover:bg-teal-800"
            >
              <Plus className="h-4 w-4" />
              Reportar avistamiento
            </Link>
          )}

          {/* Auth en móvil */}
          <div className="mt-2 border-t border-teal-800 pt-2">
            {session ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? 'Usuario'}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-emerald-200" />
                  )}
                  <span className="text-sm text-emerald-100">{session.user?.name}</span>
                </div>
                <button
                  onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }) }}
                  className="text-sm text-emerald-300 hover:text-white"
                >
                  Salir
                </button>
              </div>
            ) : status !== 'loading' ? (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-emerald-200 hover:text-white hover:bg-teal-800"
              >
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </Link>
            ) : null}
          </div>
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
