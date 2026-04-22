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
  { value: 'mamifero', label: 'Mamíferos', icon: '🦁' },
  { value: 'ave', label: 'Aves', icon: '🦅' },
  { value: 'planta', label: 'Plantas', icon: '🌿' },
  { value: 'anfibio', label: 'Anfibios', icon: '🐸' },
  { value: 'reptil', label: 'Reptiles', icon: '🦎' },
  { value: 'pez', label: 'Peces', icon: '🐟' },
  { value: 'insecto', label: 'Insectos', icon: '🦋' },
  { value: 'hongo', label: 'Hongos', icon: '🍄' },
]

export function OnboardingModal() {
  const { data: session, status } = useSession()

  // visible = null mientras carga, true/false según BD
  const [visible, setVisible] = useState<boolean | null>(null)
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [regions, setRegions] = useState<string[]>([])
  const [speciesGroups, setSpeciesGroups] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // Consultar la BD real cuando hay sesión activa
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        // Mostrar modal solo si onboarding_completed es false en la BD
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
    // Cerrar el modal directamente — no depende de cookies ni de update()
    setVisible(false)
    setSaving(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-teal-900/90 backdrop-blur-sm px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌿</div>
          <h1 className="text-2xl font-bold text-white mb-1">Bienvenido/a a Rayen</h1>
          <p className="text-teal-200 text-sm">Cuéntanos sobre ti para personalizar tu experiencia</p>
        </div>

        {/* Progreso */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-all',
                s <= step ? 'bg-emerald-400' : 'bg-teal-800'
              )}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-2xl">

          {/* Paso 1 — Rol */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-stone-800 mb-4">¿Cuál es tu rol?</h2>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    className={cn(
                      'rounded-xl border-2 px-4 py-3 text-sm font-medium text-left transition-all',
                      role === r.value ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-stone-200 text-stone-600 hover:border-teal-300'
                    )}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paso 2 — Experiencia */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-stone-800 mb-4">¿Cuál es tu nivel de experiencia en naturaleza?</h2>
              <div className="space-y-2">
                {EXPERIENCE_LEVELS.map((l) => (
                  <button key={l.value} type="button" onClick={() => setExperienceLevel(l.value)}
                    className={cn(
                      'w-full rounded-xl border-2 px-4 py-3 text-left transition-all',
                      experienceLevel === l.value ? 'border-teal-500 bg-teal-50' : 'border-stone-200 hover:border-teal-300'
                    )}>
                    <p className="font-medium text-stone-800 text-sm">{l.label}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{l.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paso 3 — Regiones */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-stone-800 mb-1">¿En qué regiones de Chile sueles estar?</h2>
              <p className="text-xs text-stone-400 mb-4">Puedes seleccionar varias</p>
              <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1">
                {CHILE_REGIONS.map((r) => (
                  <button key={r.code} type="button" onClick={() => toggleRegion(r.code)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-xs font-medium text-left transition-all',
                      regions.includes(r.code) ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-stone-200 text-stone-600 hover:border-teal-300'
                    )}>
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paso 4 — Grupos de especies */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold text-stone-800 mb-1">¿Qué grupos de especies te interesan más?</h2>
              <p className="text-xs text-stone-400 mb-4">Puedes seleccionar varios</p>
              <div className="grid grid-cols-2 gap-2">
                {SPECIES_GROUPS.map((g) => (
                  <button key={g.value} type="button" onClick={() => toggleGroup(g.value)}
                    className={cn(
                      'rounded-xl border-2 px-4 py-3 text-sm font-medium text-left flex items-center gap-2 transition-all',
                      speciesGroups.includes(g.value) ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-stone-200 text-stone-600 hover:border-teal-300'
                    )}>
                    <span className="text-lg">{g.icon}</span>{g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100">
            <button type="button" onClick={() => finish(true)}
              className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
              Saltar por ahora
            </button>
            <div className="flex gap-2">
              {step > 1 && (
                <button type="button" onClick={() => setStep((s) => s - 1)}
                  className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
                  Atrás
                </button>
              )}
              {step < 4 ? (
                <button type="button" onClick={() => setStep((s) => s + 1)}
                  className="rounded-lg bg-teal-600 hover:bg-teal-700 px-5 py-2 text-sm font-semibold text-white transition-colors">
                  Siguiente
                </button>
              ) : (
                <button type="button" onClick={() => finish(false)} disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 px-5 py-2 text-sm font-semibold text-white transition-colors">
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
