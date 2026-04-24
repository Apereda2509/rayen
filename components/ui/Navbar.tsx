'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import {
  Menu, X, LogIn, LogOut, User, Plus,
  HelpCircle, AlertCircle, Shield, FileText, Loader2, ShieldCheck,
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { NavSearch } from './NavSearch'

const ADMIN_EMAIL = 'angelperedajimenez@gmail.com'

const NAV_LINKS = [
  { href: '/mapa',             label: 'Mapa' },
  { href: '/especies',         label: 'Especies' },
  { href: '/areas-protegidas', label: 'Áreas' },
  { href: '/comunidad',        label: 'Comunidad' },
  { href: '/accion',           label: 'Acción' },
  { href: '/educacion',        label: 'Educación' },
  { href: '/sobre',            label: 'Sobre Rayen' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const { data: session, status } = useSession()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const avatarUrl = (session?.user as any)?.avatarUrl ?? session?.user?.image

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function closeAll() {
    setDropdownOpen(false)
    setMobileOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-carbon-900">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <GridBloom className="h-7 w-7 text-neon-400 group-hover:text-neon-300 transition-colors" />
            <span className="font-grotesk text-lg font-semibold tracking-widest uppercase text-white">
              RAYEN
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-carbon-700 text-neon-400 font-medium'
                    : 'text-white/70 hover:text-white hover:bg-carbon-800'
                )}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Buscar + sesión + mobile toggle */}
          <div className="flex items-center gap-2">
            <NavSearch />

            {/* Reportar avistamiento */}
            {status !== 'loading' && (
              <Link
                href={session ? '/avistamientos/nuevo' : '/login?callbackUrl=/avistamientos/nuevo&razon=reporte'}
                className="hidden sm:flex items-center gap-1.5 rounded-md bg-neon-400 hover:bg-neon-300 px-3 py-1.5 text-sm font-medium text-black transition-colors"
                title="Reportar avistamiento"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Reportar</span>
              </Link>
            )}

            {/* Auth desktop */}
            {session ? (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full ring-2 ring-neon-400 hover:ring-neon-300 transition-all focus:outline-none"
                  aria-label="Menú de usuario"
                  aria-expanded={dropdownOpen}
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={session.user?.name ?? 'Usuario'}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-carbon-800">
                      <User className="h-4 w-4 text-white/70" />
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-stone-200 bg-white shadow-lg py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-sm font-semibold text-stone-800 truncate">{session.user?.name}</p>
                      <p className="text-xs text-stone-400 truncate">{session.user?.email}</p>
                    </div>

                    <DropdownLink href="/perfil" icon={<User className="h-4 w-4" />} onClick={closeAll}>
                      Ver perfil
                    </DropdownLink>

                    <DropdownSep />

                    <DropdownLink href="/ayuda" icon={<HelpCircle className="h-4 w-4" />} onClick={closeAll}>
                      Centro de ayuda
                    </DropdownLink>
                    <DropdownButton
                      icon={<AlertCircle className="h-4 w-4" />}
                      onClick={() => { setDropdownOpen(false); setErrorModalOpen(true) }}
                    >
                      Informar un error
                    </DropdownButton>

                    {session.user?.email === ADMIN_EMAIL && (
                      <>
                        <DropdownSep />
                        <DropdownLink href="/admin" icon={<ShieldCheck className="h-4 w-4" />} onClick={closeAll}>
                          Panel de administrador
                        </DropdownLink>
                      </>
                    )}

                    <DropdownSep />

                    <DropdownLink href="/privacidad" icon={<Shield className="h-4 w-4" />} onClick={closeAll}>
                      Política de privacidad
                    </DropdownLink>
                    <DropdownLink href="/terminos" icon={<FileText className="h-4 w-4" />} onClick={closeAll}>
                      Términos de Uso
                    </DropdownLink>

                    <DropdownSep />

                    <button
                      onClick={() => { closeAll(); signOut({ callbackUrl: '/' }) }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : status !== 'loading' ? (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-carbon-800 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </Link>
            ) : null}

            <button
              className="md:hidden rounded-md p-1.5 text-white/70 hover:text-white hover:bg-carbon-800"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menú"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Nav móvil */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0A0A0A] px-4 py-2">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={closeAll}
                className={cn(
                  'block rounded-md px-3 py-4 text-sm',
                  pathname === href
                    ? 'bg-carbon-700 text-neon-400 font-medium'
                    : 'text-white/70 hover:text-white hover:bg-carbon-800'
                )}>
                {label}
              </Link>
            ))}

            {status !== 'loading' && (
              <Link
                href={session ? '/avistamientos/nuevo' : '/login?callbackUrl=/avistamientos/nuevo&razon=reporte'}
                onClick={closeAll}
                className="flex items-center gap-2 rounded-md px-3 py-4 text-sm font-medium text-neon-400 hover:text-white hover:bg-carbon-800"
              >
                <Plus className="h-4 w-4" />
                Reportar avistamiento
              </Link>
            )}

            <div className="mt-2 border-t border-white/10 pt-2">
              {session ? (
                <>
                  <Link href="/perfil" onClick={closeAll}
                    className="flex items-center gap-2 rounded-md px-3 py-4 text-sm text-white/80 hover:text-white hover:bg-carbon-800">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={session.user?.name ?? 'Usuario'} width={22} height={22} className="rounded-full ring-1 ring-neon-400" />
                    ) : (
                      <User className="h-5 w-5 text-white/70" />
                    )}
                    Ver perfil
                  </Link>
                  <Link href="/ayuda" onClick={closeAll}
                    className="flex items-center gap-2 rounded-md px-3 py-4 text-sm text-white/70 hover:text-white hover:bg-carbon-800">
                    <HelpCircle className="h-4 w-4" />
                    Centro de ayuda
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); setErrorModalOpen(true) }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-4 text-sm text-white/70 hover:text-white hover:bg-carbon-800"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Informar un error
                  </button>
                  {session.user?.email === ADMIN_EMAIL && (
                    <Link href="/admin" onClick={closeAll}
                      className="flex items-center gap-2 rounded-md px-3 py-4 text-sm text-white/70 hover:text-white hover:bg-carbon-800">
                      <ShieldCheck className="h-4 w-4" />
                      Panel de administrador
                    </Link>
                  )}
                  <Link href="/privacidad" onClick={closeAll}
                    className="flex items-center gap-2 rounded-md px-3 py-4 text-sm text-white/70 hover:text-white hover:bg-carbon-800">
                    <Shield className="h-4 w-4" />
                    Política de privacidad
                  </Link>
                  <Link href="/terminos" onClick={closeAll}
                    className="flex items-center gap-2 rounded-md px-3 py-4 text-sm text-white/70 hover:text-white hover:bg-carbon-800">
                    <FileText className="h-4 w-4" />
                    Términos de Uso
                  </Link>
                  <button
                    onClick={() => { closeAll(); signOut({ callbackUrl: '/' }) }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-4 text-sm text-red-400 hover:text-red-300 hover:bg-carbon-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </>
              ) : status !== 'loading' ? (
                <Link href="/login" onClick={closeAll}
                  className="flex items-center gap-2 rounded-md px-3 py-4 text-sm text-white/70 hover:text-white hover:bg-carbon-800">
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </header>

      {/* Modal — Informar un error */}
      {errorModalOpen && (
        <ErrorReportModal
          userEmail={session?.user?.email ?? null}
          onClose={() => setErrorModalOpen(false)}
        />
      )}
    </>
  )
}

// ── Componentes auxiliares del dropdown ──────────────────────

function DropdownSep() {
  return <div className="my-1 border-t border-stone-100" />
}

function DropdownLink({
  href, icon, children, onClick,
}: {
  href: string; icon: React.ReactNode; children: React.ReactNode; onClick?: () => void
}) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors">
      <span className="text-stone-400">{icon}</span>
      {children}
    </Link>
  )
}

function DropdownButton({
  icon, children, onClick,
}: {
  icon: React.ReactNode; children: React.ReactNode; onClick?: () => void
}) {
  return (
    <button onClick={onClick}
      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors">
      <span className="text-stone-400">{icon}</span>
      {children}
    </button>
  )
}

// ── Modal de reporte de error ─────────────────────────────────

function ErrorReportModal({ userEmail, onClose }: { userEmail: string | null; onClose: () => void }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (!message.trim()) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/report-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userEmail }),
      })
      if (res.ok) {
        setSent(true)
        setTimeout(onClose, 1800)
      } else {
        setError('No se pudo enviar. Inténtalo de nuevo.')
      }
    } catch {
      setError('Error de conexión.')
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-stone-500" />
            <h2 className="font-semibold text-stone-800 text-sm">Informar un error</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-sm font-medium text-stone-700">Reporte enviado. Gracias.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-stone-500 mb-3">
                Describe el error con el mayor detalle posible: qué hiciste, qué esperabas y qué pasó.
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                rows={5}
                placeholder="Ej: Al hacer click en 'Reportar avistamiento' aparece un error en blanco…"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-neon-400 resize-none"
                autoFocus
              />
              <p className="text-right text-xs text-stone-400 mt-1">{message.length}/1000</p>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-neon-400 hover:bg-neon-300 disabled:opacity-50 py-2.5 text-sm font-semibold text-black transition-colors"
              >
                {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar reporte
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Grid Bloom — imagotipo RAYEN v2.0 ─────────────────────────
function GridBloom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      {/* Centro */}
      <circle cx="20" cy="20" r="3.5" fill="#00E676" />
      {/* Anillo hexagonal: 6 círculos r=5, órbita=14 */}
      <circle cx="34"    cy="20"     r="5" fill="#00E676" opacity="0.85" />
      <circle cx="27"    cy="32.12"  r="5" fill="#00E676" opacity="0.85" />
      <circle cx="13"    cy="32.12"  r="5" fill="#00E676" opacity="0.85" />
      <circle cx="6"     cy="20"     r="5" fill="#00E676" opacity="0.85" />
      <circle cx="13"    cy="7.88"   r="5" fill="#00E676" opacity="0.85" />
      <circle cx="27"    cy="7.88"   r="5" fill="#00E676" opacity="0.85" />
    </svg>
  )
}
