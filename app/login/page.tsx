'use client'

import { signIn } from 'next-auth/react'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function GridBloom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="3.5" fill="currentColor" />
      <circle cx="34"   cy="20"     r="5" fill="currentColor" opacity="0.85" />
      <circle cx="27"   cy="32.12"  r="5" fill="currentColor" opacity="0.85" />
      <circle cx="13"   cy="32.12"  r="5" fill="currentColor" opacity="0.85" />
      <circle cx="6"    cy="20"     r="5" fill="currentColor" opacity="0.85" />
      <circle cx="13"   cy="7.88"   r="5" fill="currentColor" opacity="0.85" />
      <circle cx="27"   cy="7.88"   r="5" fill="currentColor" opacity="0.85" />
    </svg>
  )
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function LoginForm() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const razon = searchParams.get('razon')

  async function handleGoogle() {
    setLoading(true)
    await signIn('google', { callbackUrl })
  }

  return (
    <div className="relative w-full max-w-md mx-6">
      {/* Orbes de fondo */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full bg-[#00E676]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[#00E676]/5 blur-3xl" />

      {/* Card */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <GridBloom className="h-10 w-10 text-[#00E676]" />
          <span
            className="font-bold text-2xl text-white tracking-wide"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            RAYEN
          </span>
        </div>

        {/* Título */}
        <h1
          className="font-bold text-3xl text-white text-center mt-2"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          Bienvenido a Rayen
        </h1>
        <p className="text-zinc-400 text-base text-center mt-2 mb-8 leading-relaxed">
          {razon === 'reporte'
            ? 'Para reportar un avistamiento necesitas iniciar sesión con Google. Es gratis y toma 10 segundos.'
            : 'Chile florece cuando lo conocemos'}
        </p>

        {/* Botón Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-white hover:bg-zinc-100 disabled:opacity-60 px-6 py-3.5 text-sm font-medium text-zinc-900 transition-colors"
        >
          <GoogleLogo />
          {loading ? 'Redirigiendo…' : 'Continuar con Google'}
        </button>

        {/* Separador + legal */}
        <div className="border-t border-zinc-800 mt-8 pt-6">
          <p className="text-center text-xs text-zinc-600">
            Al iniciar sesión aceptas nuestros{' '}
            <a href="/sobre" className="text-zinc-400 hover:text-white underline transition-colors">
              términos de uso
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-[#0A0A0A] px-4">
      <Suspense fallback={
        <div className="w-full max-w-md mx-6 h-96 rounded-3xl bg-zinc-900 border border-zinc-800 animate-pulse" />
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
