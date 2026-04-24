'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Presentacion {
  id: string
  slug: string
  titulo: string
  nivel: string
  slides: unknown[]
  species_common_name: string | null
}

interface Props {
  presentaciones: Presentacion[]
}

const NIVELES = [
  {
    key: 'kinder',
    label: 'Kínder a 2° básico',
    rango: '5–8 años',
    descripcion: 'Ilustraciones y lenguaje simple',
  },
  {
    key: 'basica',
    label: '3° a 6° básico',
    rango: '8–12 años',
    descripcion: 'Fotos reales y datos curiosos',
  },
  {
    key: 'media_baja',
    label: '7° a 2° medio',
    rango: '12–16 años',
    descripcion: 'Contenido científico y análisis',
  },
  {
    key: 'media_alta',
    label: '3° y 4° medio',
    rango: '16–18 años',
    descripcion: 'Profundidad científica y debate',
  },
] as const

type NivelKey = typeof NIVELES[number]['key']

export function NivelSelector({ presentaciones }: Props) {
  const [nivelActivo, setNivelActivo] = useState<NivelKey | null>(null)

  const presentacionesFiltradas = nivelActivo
    ? presentaciones.filter((p) => p.nivel === nivelActivo)
    : []

  return (
    <div>
      {/* Pregunta */}
      <div className="text-center mb-10">
        <h1 className="font-grotesk font-bold text-4xl md:text-5xl text-white mb-3">
          ¿Para qué nivel es tu clase?
        </h1>
        <p className="text-zinc-400">Selecciona un nivel para ver las presentaciones disponibles.</p>
      </div>

      {/* Grid de niveles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
        {NIVELES.map((n) => (
          <button
            key={n.key}
            onClick={() => setNivelActivo(nivelActivo === n.key ? null : n.key)}
            className={cn(
              'text-left rounded-2xl border p-6 transition-all',
              nivelActivo === n.key
                ? 'border-[#00E676] bg-[#00E676]/5'
                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
            )}
          >
            <p className={cn(
              'font-grotesk font-bold text-xl mb-1 transition-colors',
              nivelActivo === n.key ? 'text-[#00E676]' : 'text-white'
            )}>
              {n.label}
            </p>
            <p className="text-zinc-500 text-sm mb-2">{n.rango}</p>
            <p className="text-zinc-400 text-sm">{n.descripcion}</p>
          </button>
        ))}
      </div>

      {/* Presentaciones del nivel seleccionado */}
      {nivelActivo && (
        <div className="max-w-3xl mx-auto">
          <h2 className="font-grotesk font-semibold text-lg text-white mb-4">
            Presentaciones disponibles
          </h2>

          {presentacionesFiltradas.length === 0 ? (
            <p className="text-zinc-500 text-sm py-8 text-center rounded-xl border border-zinc-800">
              No hay presentaciones para este nivel aún.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {presentacionesFiltradas.map((p) => (
                <Link
                  key={p.id}
                  href={`/educacion/aula/${p.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-600 px-5 py-4 transition-colors"
                >
                  <div>
                    <p className="font-grotesk font-semibold text-white group-hover:text-[#00E676] transition-colors">
                      {p.titulo}
                    </p>
                    {p.species_common_name && (
                      <p className="text-zinc-500 text-sm mt-0.5">{p.species_common_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <span className="text-zinc-600 text-xs">
                      {Array.isArray(p.slides) ? p.slides.length : 0} slides
                    </span>
                    <span className="text-[#00E676] text-sm font-medium">
                      Ver presentación →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
