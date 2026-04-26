'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROLES = [
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'investigador', label: 'Investigador/a' },
  { value: 'fotografo', label: 'Fotógrafo/a' },
  { value: 'naturalista', label: 'Naturalista aficionado/a' },
  { value: 'educador', label: 'Educador/a' },
  { value: 'otro', label: 'Otro' },
]

const EXPERIENCE_LEVELS = [
  { value: 'principiante', label: 'Principiante', desc: 'Recién empiezo a interesarme en la naturaleza' },
  { value: 'intermedio', label: 'Intermedio', desc: 'Tengo alguna experiencia observando especies' },
  { value: 'experto', label: 'Experto', desc: 'Llevo años estudiando o fotografiando naturaleza' },
]

const CHILE_REGIONS = [
  { code: 'XV', name: 'Arica y Parinacota' },
  { code: 'I', name: 'Tarapacá' },
  { code: 'II', name: 'Antofagasta' },
  { code: 'III', name: 'Atacama' },
  { code: 'IV', name: 'Coquimbo' },
  { code: 'V', name: 'Valparaíso' },
  { code: 'RM', name: 'Metropolitana' },
  { code: 'VI', name: "O'Higgins" },
  { code: 'VII', name: 'Maule' },
  { code: 'XVI', name: 'Ñuble' },
  { code: 'VIII', name: 'Biobío' },
  { code: 'IX', name: 'La Araucanía' },
  { code: 'XIV', name: 'Los Ríos' },
  { code: 'X', name: 'Los Lagos' },
  { code: 'XI', name: 'Aysén' },
  { code: 'XII', name: 'Magallanes' },
]

const SPECIES_GROUPS = [
  { value: 'mamifero', label: 'Mamíferos' },
  { value: 'ave', label: 'Aves' },
  { value: 'planta', label: 'Plantas' },
  { value: 'anfibio', label: 'Anfibios' },
  { value: 'reptil', label: 'Reptiles' },
  { value: 'pez', label: 'Peces' },
  { value: 'insecto', label: 'Insectos' },
  { value: 'hongo', label: 'Hongos' },
]

const STEP_TITLES = [
  '¿Cuál es tu rol?',
  '¿Cuál es tu nivel de experiencia?',
  '¿En qué regiones sueles estar?',
  '¿Qué grupos de especies te interesan?',
]

const STEP_SUBTITLES = [
  'Cuéntanos cómo te relacionas con la naturaleza.',
  'Esto nos ayuda a mostrarte contenido relevante.',
  'Puedes seleccionar varias regiones.',
  'Puedes seleccionar varios grupos.',
]

export function OnboardingModal() {
  const { data: session, status } = useSession()

  const [visible, setVisible] = useState<boolean | null>(null)
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [regions, setRegions] = useState<string[]>([])
  const [speciesGroups, setSpeciesGroups] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        setVisible(data.onboarding_completed === false)
      })
      .catch(() => setVisible(false))
  }, [status])

  function toggleRegion(code: string) {
    setRegions((prev) => prev.includes(code) ? prev.filter((r) => r !== code) : [...prev, code])
  }
  function toggleGroup(value: string) {
    setSpeciesGroups((prev) => prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value])
  }

  async function finish(skip = false) {
    setSaving(true)
    try {
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skip, role, experienceLevel, regions, speciesGroups }),
      })
    } catch { /* ignore */ }
    setVisible(false)
    setSaving(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-8">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-block bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase font-medium mb-4">
            Primeros pasos
          </span>
          <h1
            className="font-bold text-3xl text-white"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            {STEP_TITLES[step - 1]}
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            {STEP_SUBTITLES[step - 1]}
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex gap-2 justify-center mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                s === step ? 'w-6 bg-[#00E676]' : s < step ? 'w-2 bg-[#00E676]/40' : 'w-2 bg-zinc-700'
              )}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">

          {/* Paso 1 — Rol */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button key={r.value} type="button" onClick={() => setRole(r.value)}
                  className={cn(
                    'rounded-xl border-2 px-4 py-3 text-sm font-medium text-left transition-all',
                    role === r.value
                      ? 'border-[#00E676] bg-[#00E676]/10 text-white'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                  )}>
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {/* Paso 2 — Experiencia */}
          {step === 2 && (
            <div className="space-y-2">
              {EXPERIENCE_LEVELS.map((l) => (
                <button key={l.value} type="button" onClick={() => setExperienceLevel(l.value)}
                  className={cn(
                    'w-full rounded-xl border-2 px-4 py-3 text-left transition-all',
                    experienceLevel === l.value
                      ? 'border-[#00E676] bg-[#00E676]/10'
                      : 'border-zinc-700 hover:border-zinc-500'
                  )}>
                  <p className={cn('font-medium text-sm', experienceLevel === l.value ? 'text-white' : 'text-zinc-300')}>{l.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{l.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* Paso 3 — Regiones */}
          {step === 3 && (
            <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1">
              {CHILE_REGIONS.map((r) => (
                <button key={r.code} type="button" onClick={() => toggleRegion(r.code)}
                  className={cn(
                    'rounded-xl border px-3 py-2 text-xs font-medium text-left transition-all',
                    regions.includes(r.code)
                      ? 'border-[#00E676] bg-[#00E676]/10 text-white'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                  )}>
                  {r.name}
                </button>
              ))}
            </div>
          )}

          {/* Paso 4 — Grupos de especies */}
          {step === 4 && (
            <div className="grid grid-cols-2 gap-2">
              {SPECIES_GROUPS.map((g) => (
                <button key={g.value} type="button" onClick={() => toggleGroup(g.value)}
                  className={cn(
                    'rounded-xl border-2 px-4 py-3 text-sm font-medium text-left transition-all',
                    speciesGroups.includes(g.value)
                      ? 'border-[#00E676] bg-[#00E676]/10 text-white'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                  )}>
                  {g.label}
                </button>
              ))}
            </div>
          )}

          {/* Navegación */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-zinc-800">
            <button type="button" onClick={() => finish(true)}
              className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors">
              Saltar por ahora
            </button>
            <div className="flex gap-2">
              {step > 1 && (
                <button type="button" onClick={() => setStep((s) => s - 1)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors">
                  Atrás
                </button>
              )}
              {step < 4 ? (
                <button type="button" onClick={() => setStep((s) => s + 1)}
                  className="rounded-xl bg-[#00E676] hover:bg-emerald-400 px-5 py-2 text-sm font-semibold text-black transition-colors">
                  Siguiente
                </button>
              ) : (
                <button type="button" onClick={() => finish(false)} disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[#00E676] hover:bg-emerald-400 disabled:opacity-60 px-5 py-2 text-sm font-semibold text-black transition-colors">
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Comenzar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
