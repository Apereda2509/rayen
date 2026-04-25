'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle } from 'lucide-react'

// ── Regiones de Chile en orden geográfico ──────────────────────
const CHILE_REGIONS = [
  'Región de Arica y Parinacota',
  'Región de Tarapacá',
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de Coquimbo',
  'Región de Valparaíso',
  'Región Metropolitana de Santiago',
  "Región del Libertador General Bernardo O'Higgins",
  'Región del Maule',
  'Región de Ñuble',
  'Región del Biobío',
  'Región de La Araucanía',
  'Región de Los Ríos',
  'Región de Los Lagos',
  'Región de Aysén del General Carlos Ibáñez del Campo',
  'Región de Magallanes y la Antártica Chilena',
]

// ── Algoritmo Módulo 11 para RUT chileno ───────────────────────
function validateRut(rut: string): boolean {
  const clean = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase()
  if (clean.length < 2) return false

  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)

  if (!/^\d+$/.test(body)) return false

  const digits = body.split('').reverse().map(Number)
  const series = [2, 3, 4, 5, 6, 7]
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * series[i % 6]
  }
  const remainder = 11 - (sum % 11)

  let expected: string
  if (remainder === 11) expected = '0'
  else if (remainder === 10) expected = 'K'
  else expected = String(remainder)

  return dv === expected
}

function formatRut(raw: string): string {
  const clean = raw.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length === 0) return ''
  if (clean.length === 1) return clean

  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted}-${dv}`
}

// ── Confetti ───────────────────────────────────────────────────
const CONFETTI_PIECES = Array.from({ length: 45 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.6,
  size: Math.random() * 7 + 4,
  rotate: Math.random() * 720 - 360,
  color: i % 4 === 0 ? '#ffffff' : i % 4 === 1 ? '#52F599' : '#00E676',
}))

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {CONFETTI_PIECES.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ left: `${p.x}%`, top: -16, width: p.size, height: p.size, backgroundColor: p.color }}
          animate={{ y: '110vh', rotate: p.rotate, opacity: [1, 1, 0.4, 0] }}
          transition={{ duration: 2.2, delay: p.delay, ease: 'linear' }}
        />
      ))}
    </div>
  )
}

// ── Props ──────────────────────────────────────────────────────
interface Props {
  petitionId: string
  petitionTitle: string
  userEmail: string | null
  isLoggedIn: boolean
  onClose: () => void
  onSuccess: (newCount: number) => void
}

export function SignPetitionModal({
  petitionId, petitionTitle, userEmail, isLoggedIn, onClose, onSuccess,
}: Props) {
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [rut, setRut] = useState('')
  const [correo, setCorreo] = useState(userEmail ?? '')
  const [region, setRegion] = useState('')
  const [razon, setRazon] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  function handleRutChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRut(formatRut(e.target.value))
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!nombres.trim()) next.nombres = 'Campo requerido'
    if (!apellidos.trim()) next.apellidos = 'Campo requerido'
    if (!rut.trim()) {
      next.rut = 'Campo requerido'
    } else if (!validateRut(rut)) {
      next.rut = 'RUT inválido — verifica el dígito verificador'
    }
    if (!correo.trim()) {
      next.correo = 'Campo requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      next.correo = 'Correo electrónico inválido'
    }
    if (!region) next.region = 'Selecciona una región'
    if (!consent) next.consent = 'Debes aceptar para continuar'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/petitions/${petitionId}/sign-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombres, apellidos, rut, correo, region, razon: razon || null }),
      })
      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setShowConfetti(true)
        onSuccess(data.signedCount)
        setTimeout(() => setShowConfetti(false), 2400)
      } else if (res.status === 409) {
        if (data.error === 'rut_already_signed') {
          setErrors({ rut: 'Ya registraste una firma con este RUT' })
        } else if (data.error === 'email_already_signed') {
          setErrors({ correo: 'Ya registraste una firma con este correo' })
        } else {
          setErrors({ general: 'Ya has firmado esta petición' })
        }
      } else {
        setErrors({ general: data.message ?? 'Error al registrar tu firma. Intenta nuevamente.' })
      }
    } catch {
      setErrors({ general: 'Error de red. Intenta nuevamente.' })
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00E676] placeholder-zinc-600'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5'
  const errorCls = 'text-red-400 text-xs mt-1'

  return (
    <>
      {showConfetti && <Confetti />}

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <div>
                <h2
                  className="font-bold text-white"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  Firmar petición
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{petitionTitle}</p>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Estado: éxito */}
            {success ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <CheckCircle className="h-16 w-16 text-[#00E676] mx-auto mb-4" />
                </motion.div>
                <h3
                  className="font-bold text-white text-xl mb-2"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  ¡Gracias por firmar!
                </h3>
                <p className="text-zinc-400 text-sm">Tu firma ha sido registrada.</p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-[#00E676] hover:bg-[#52F599] text-black font-semibold transition-colors text-sm"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Aviso login si no está logueado */}
                {!isLoggedIn && (
                  <div className="rounded-xl bg-zinc-800/60 border border-zinc-700 p-3 text-sm text-zinc-400">
                    ¿Tienes cuenta?{' '}
                    <a href="/login" className="text-[#00E676] hover:underline font-medium">
                      Inicia sesión con Google
                    </a>{' '}
                    para firmar más rápido.
                  </div>
                )}

                {/* Nombres + Apellidos */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Nombres *</label>
                    <input
                      type="text"
                      value={nombres}
                      onChange={e => setNombres(e.target.value)}
                      placeholder="María"
                      className={inputCls}
                    />
                    {errors.nombres && <p className={errorCls}>{errors.nombres}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Apellidos *</label>
                    <input
                      type="text"
                      value={apellidos}
                      onChange={e => setApellidos(e.target.value)}
                      placeholder="González"
                      className={inputCls}
                    />
                    {errors.apellidos && <p className={errorCls}>{errors.apellidos}</p>}
                  </div>
                </div>

                {/* RUT */}
                <div>
                  <label className={labelCls}>RUT *</label>
                  <input
                    type="text"
                    value={rut}
                    onChange={handleRutChange}
                    placeholder="12.345.678-9"
                    maxLength={12}
                    className={inputCls}
                  />
                  {errors.rut && <p className={errorCls}>{errors.rut}</p>}
                </div>

                {/* Correo */}
                <div>
                  <label className={labelCls}>Correo electrónico *</label>
                  <input
                    type="email"
                    value={correo}
                    onChange={e => setCorreo(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className={inputCls}
                  />
                  {errors.correo && <p className={errorCls}>{errors.correo}</p>}
                </div>

                {/* Región */}
                <div>
                  <label className={labelCls}>Región *</label>
                  <select
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    className={`${inputCls} bg-zinc-800`}
                  >
                    <option value="">Selecciona tu región</option>
                    {CHILE_REGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {errors.region && <p className={errorCls}>{errors.region}</p>}
                </div>

                {/* Razón (opcional) */}
                <div>
                  <label className={labelCls}>¿Por qué quieres firmar esta petición? (opcional)</label>
                  <textarea
                    value={razon}
                    onChange={e => setRazon(e.target.value.slice(0, 300))}
                    rows={3}
                    placeholder="Cuéntanos tu motivación…"
                    className={`${inputCls} resize-none`}
                  />
                  <p className="text-right text-xs text-zinc-600 mt-1">{razon.length}/300</p>
                </div>

                {/* Consentimiento */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={e => setConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 flex-shrink-0 accent-[#00E676]"
                    />
                    <span className="text-xs text-zinc-400 leading-relaxed">
                      Acepto que mis datos personales (nombres, apellidos, RUT, correo y región) sean
                      utilizados exclusivamente para validar y contabilizar mi firma en esta petición,
                      y no serán compartidos con terceros ni utilizados para ningún otro fin.
                    </span>
                  </label>
                  {errors.consent && <p className={errorCls}>{errors.consent}</p>}
                </div>

                {/* Error general */}
                {errors.general && (
                  <div className="rounded-lg bg-red-950 border border-red-800 p-3 text-sm text-red-300">
                    {errors.general}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#00E676] hover:bg-[#52F599] disabled:opacity-60 text-black font-semibold transition-colors text-sm"
                >
                  {submitting ? 'Registrando firma…' : 'Confirmar firma'}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
