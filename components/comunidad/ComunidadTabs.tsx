'use client'

import { useState } from 'react'
import { AvistamientosFeed } from './AvistamientosFeed'
import { AreaFotosFeed } from './AreaFotosFeed'
import { ObservadoresFeed } from './ObservadoresFeed'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'avistamientos', label: 'Avistamientos' },
  { key: 'fotos-areas',   label: 'Fotos de áreas' },
  { key: 'observadores',  label: 'Observadores' },
] as const

type TabKey = typeof TABS[number]['key']

export function ComunidadTabs() {
  const [active, setActive] = useState<TabKey>('avistamientos')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-zinc-800 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
              active === tab.key
                ? 'border-[#00E676] text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {active === 'avistamientos' && <AvistamientosFeed />}
      {active === 'fotos-areas'   && <AreaFotosFeed />}
      {active === 'observadores'  && <ObservadoresFeed />}
    </div>
  )
}
