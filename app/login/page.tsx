'use client'

import { signIn } from 'next-auth/react'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

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
    <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-carbon-900">
          <RayenFlower className="h-8 w-8 text-neon-400" />
        </div>
        <h1 className="text-2xl font-semibold text-stone-900">Bienvenido a Rayen</h1>
        <p className="mt-2 text-sm text-stone-500 leading-relaxed">
          {razon === 'reporte'
            ? 'Para reportar un avistamiento necesitas iniciar sesión con Google. Es gratis y toma 10 segundos.'
            : 'Chile florece cuando lo conocemos'}
        </p>
      </div>

      <button
        onClick={handleGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50 disabled:opacity-60"
      >
        <GoogleLogo />
        {loading ? 'Redirigiendo…' : 'Iniciar sesión con Google'}
      </button>

      <p className="mt-6 text-center text-xs text-stone-400">
        Al iniciar sesión aceptas nuestros{' '}
        <a href="/sobre" className="underline hover:text-neon-600">términos de uso</a>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-stone-50 px-4">
      <Suspense fallback={<div className="w-full max-w-sm h-64 rounded-2xl bg-white animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

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
