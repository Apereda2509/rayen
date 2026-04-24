'use client'

import { useState, useEffect, useCallback, useRef, forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

// ── helpers ──────────────────────────────────────────────────────────────────

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function passwordStrength(s: string): 0 | 1 | 2 | 3 | 4 {
  if (s.length === 0) return 0
  if (s.length < 8) return 1
  let n = 2
  if (s.length >= 12) n++
  if (/[^A-Za-z0-9]/.test(s)) n++
  return Math.min(n, 4) as 0 | 1 | 2 | 3 | 4
}

const STRENGTH_COLOR = ['', '#D85A30', '#f59e0b', '#84cc16', '#00E676']
const STRENGTH_LABEL = ['', 'Muy débil', 'Débil', 'Buena', 'Fuerte']
const TOTAL = 4

// ── sub-components ────────────────────────────────────────────────────────────

function GridBloom() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="2.5" fill="#00E676" />
      <circle cx="16" cy="7" r="3.5" fill="#00E676" />
      <circle cx="23.8" cy="11.5" r="3.5" fill="#00E676" />
      <circle cx="23.8" cy="20.5" r="3.5" fill="#00E676" />
      <circle cx="16" cy="25" r="3.5" fill="#00E676" />
      <circle cx="8.2" cy="20.5" r="3.5" fill="#00E676" />
      <circle cx="8.2" cy="11.5" r="3.5" fill="#00E676" />
    </svg>
  )
}

function BackArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const MinimalInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => (
    <input
      ref={ref}
      {...props}
      className="w-full max-w-lg bg-transparent text-white text-2xl border-0 border-b border-zinc-700 focus:border-[#00E676] focus:outline-none pb-3 placeholder:text-zinc-600 transition-colors duration-200"
    />
  )
)
MinimalInput.displayName = 'MinimalInput'

function ContinueButton({ show, onClick }: { show: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 right-8 font-grotesk text-sm tracking-wide transition-all duration-200 ${
        show ? 'text-zinc-400 hover:text-white opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      Continuar →
    </button>
  )
}

function StepShell({ question, children }: { question?: string; children: React.ReactNode }) {
  return (
    <div className="w-full flex flex-col items-center">
      {question && (
        <h1 className="font-grotesk font-bold text-5xl md:text-7xl text-white text-center mb-12 leading-tight max-w-2xl">
          {question}
        </h1>
      )}
      {children}
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function RegistroPage() {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const router = useRouter()
  const reduced = !!useReducedMotion()
  const inputRef = useRef<HTMLInputElement>(null)

  const emailInvalid = emailTouched && email.length > 0 && !isValidEmail(email)
  const strength = passwordStrength(password)

  const canAdvance = [
    name.trim().length > 0,
    isValidEmail(email),
    password.length >= 8,
    true,
  ][step]

  const goNext = useCallback(() => {
    if (!canAdvance || loading || step >= 3) return
    setDir(1)
    setStep(s => s + 1)
  }, [canAdvance, loading, step])

  function goBack() {
    if (step === 0) {
      router.push('/login')
      return
    }
    setDir(-1)
    setStep(s => s - 1)
  }

  async function handleSubmit() {
    setLoading(true)
    setServerError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.error ?? 'Error al registrar')
        setLoading(false)
        return
      }
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        setServerError('Cuenta creada. Inicia sesión en /login.')
        setLoading(false)
        return
      }
      router.push('/')
    } catch {
      setServerError('Error de conexión. Intenta de nuevo.')
      setLoading(false)
    }
  }

  // Focus input after step transition
  useEffect(() => {
    const delay = reduced ? 0 : 560
    const t = setTimeout(() => inputRef.current?.focus(), delay)
    return () => clearTimeout(t)
  }, [step, reduced])

  // Keyboard: Enter advances
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && step < 3) goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, goNext])

  const progress = ((step + 1) / TOTAL) * 100
  const stepLabel = `${String(step + 1).padStart(2, '0')} / ${String(TOTAL).padStart(2, '0')}`

  const variants = {
    enter: (d: number) => ({ y: d > 0 ? '100vh' : '-100vh', opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (d: number) => ({ y: d > 0 ? '-100vh' : '100vh', opacity: 0 }),
  }
  const transition = { duration: 0.5, ease: [0.76, 0, 0.24, 1] as [number, number, number, number] }

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] overflow-hidden">

      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 h-[2px] bg-[#00E676] z-50"
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-start justify-between px-6 pt-6 pointer-events-none">
        <div className="flex flex-col gap-3 pointer-events-auto">
          <span className="font-grotesk text-xs text-zinc-500 tracking-widest tabular-nums">
            {stepLabel}
          </span>
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-70 transition-opacity">
            <GridBloom />
            <span className="font-grotesk font-bold text-sm tracking-widest uppercase">Rayen</span>
          </Link>
        </div>

        <button
          onClick={goBack}
          className="mt-1 text-zinc-500 hover:text-white transition-colors pointer-events-auto"
          aria-label={step === 0 ? 'Volver al login' : 'Paso anterior'}
        >
          <BackArrow />
        </button>
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          variants={reduced ? undefined : variants}
          initial={reduced ? false : 'enter'}
          animate={reduced ? {} : 'center'}
          exit={reduced ? {} : 'exit'}
          transition={transition}
          className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20"
        >
          {/* Step 1 — Nombre */}
          {step === 0 && (
            <StepShell question="¿Cómo te llamamos?">
              <MinimalInput
                ref={inputRef}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre..."
                autoComplete="name"
                aria-label="Tu nombre"
              />
              <ContinueButton show={canAdvance} onClick={goNext} />
            </StepShell>
          )}

          {/* Step 2 — Email */}
          {step === 1 && (
            <StepShell question="¿Cuál es tu correo?">
              <MinimalInput
                ref={inputRef}
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailTouched(true) }}
                onBlur={() => setEmailTouched(true)}
                placeholder="tu@correo.com"
                autoComplete="email"
                aria-label="Tu correo electrónico"
              />
              {emailInvalid && (
                <p className="mt-3 text-sm font-grotesk w-full max-w-lg" style={{ color: '#D85A30' }}>
                  Ingresa un correo válido
                </p>
              )}
              <ContinueButton show={canAdvance} onClick={goNext} />
            </StepShell>
          )}

          {/* Step 3 — Contraseña */}
          {step === 2 && (
            <StepShell question="Elige una contraseña">
              <MinimalInput
                ref={inputRef}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                aria-label="Contraseña"
              />
              {password.length > 0 && (
                <div className="mt-4 w-full max-w-lg">
                  <div className="h-[3px] rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      animate={{
                        width: `${(strength / 4) * 100}%`,
                        backgroundColor: STRENGTH_COLOR[strength],
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-grotesk text-zinc-500">
                    {STRENGTH_LABEL[strength]}
                    {password.length < 8 && ' — mínimo 8 caracteres'}
                  </p>
                </div>
              )}
              <ContinueButton show={canAdvance} onClick={goNext} />
            </StepShell>
          )}

          {/* Step 4 — Confirmación */}
          {step === 3 && (
            <div className="text-center max-w-2xl">
              <h1 className="font-grotesk font-bold text-5xl md:text-7xl text-white leading-tight">
                Hola, {name}.
              </h1>
              <p className="font-grotesk font-bold text-5xl md:text-7xl leading-tight" style={{ color: '#00E676' }}>
                Ya eres parte de Rayen.
              </p>
              <p className="mt-8 text-lg text-zinc-400 leading-relaxed max-w-lg mx-auto">
                Explora las especies, reporta avistamientos y ayuda a documentar la biodiversidad de Chile.
              </p>
              {serverError && (
                <p className="mt-4 text-sm font-grotesk" style={{ color: '#D85A30' }}>
                  {serverError}
                </p>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-10 inline-flex items-center gap-2 px-8 py-4 rounded-lg font-grotesk font-medium text-black text-lg transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#00E676' }}
              >
                {loading ? 'Creando cuenta…' : (
                  <>Empezar <ArrowRight /></>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
