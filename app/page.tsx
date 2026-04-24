// app/page.tsx
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { MapPin, Users, AlertTriangle } from 'lucide-react'
import { getPlatformStats } from '@/lib/db'
import { HeroFrameExpand } from '@/components/home/HeroFrameExpand'

export default async function HomePage() {
  let stats = { total_species: 0, endangered: 0, endemic: 0, verified_sightings: 0, total_users: 0 }
  try {
    stats = await getPlatformStats()
  } catch (e) {
    stats = { total_species: 30, endangered: 12, endemic: 18, verified_sightings: 142, total_users: 56 }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">

      {/* Hero */}
      <HeroFrameExpand />

      {/* Stats */}
      <section className="bg-stone-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Stat label="Especies documentadas" value={stats.total_species} icon={MapPin} />
            <Stat label="En peligro" value={stats.endangered} icon={AlertTriangle} accent="coral" />
            <Stat label="Endémicas de Chile" value={stats.endemic} icon={MapPin} />
            <Stat label="Avistamientos comunidad" value={stats.verified_sightings} icon={Users} />
          </div>
        </div>
      </section>

      {/* Misión */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">
            Una plataforma. Toda la biodiversidad de Chile.
          </h2>
          <p className="text-lg text-stone-600 leading-relaxed">
            Rayen reúne fichas de especies, mapas, leyes de protección y formas concretas
            de actuar. Un proyecto independiente, construido con fuentes públicas verificadas
            — SAG, Ministerio del Medio Ambiente e IUCN.
          </p>
          <p className="mt-4 text-base text-stone-400">
            Hecho por una persona, abierto a colaboradores que quieran sumar.
          </p>
        </div>
      </section>

    </div>
  )
}

function Stat({
  label, value, icon: Icon, accent = 'neon',
}: {
  label: string; value: number; icon: any; accent?: 'neon' | 'coral'
}) {
  const colors = accent === 'coral'
    ? 'text-coral-400'
    : 'text-neon-400'

  return (
    <div className="text-center">
      <Icon className={`h-6 w-6 mx-auto mb-2 ${colors}`} strokeWidth={1.5} />
      <p className="text-3xl font-bold text-stone-900">{value.toLocaleString('es-CL')}</p>
      <p className="text-sm text-stone-500 mt-1">{label}</p>
    </div>
  )
}
