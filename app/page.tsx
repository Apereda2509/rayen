// app/page.tsx
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowRight, MapPin, Users, AlertTriangle } from 'lucide-react'
import { getPlatformStats } from '@/lib/db'

export default async function HomePage() {
  let stats = { total_species: 0, endangered: 0, endemic: 0, verified_sightings: 0, total_users: 0 }
  try {
    stats = await getPlatformStats()
  } catch (e) {
    // DB no disponible aún en desarrollo, usar valores demo
    stats = { total_species: 30, endangered: 12, endemic: 18, verified_sightings: 142, total_users: 56 }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">

      {/* Hero */}
      <section className="relative overflow-hidden bg-teal-900 text-white">
        {/* Video de fondo — URL configurada en NEXT_PUBLIC_HERO_VIDEO_URL */}
        {process.env.NEXT_PUBLIC_HERO_VIDEO_URL && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          >
            <source src={process.env.NEXT_PUBLIC_HERO_VIDEO_URL} type="video/mp4" />
          </video>
        )}
        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-teal-950/65" aria-hidden="true" />

        {/* Contenido sobre el video */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-emerald-300 text-sm font-medium uppercase tracking-wider mb-4">
              Plataforma de biodiversidad chilena
            </p>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight tracking-tight">
              Chile florece <br />
              <span className="text-emerald-300">cuando lo conocemos.</span>
            </h1>
            <p className="mt-6 text-lg text-emerald-100/90 leading-relaxed max-w-2xl">
              Explora la fauna y flora nativa de Chile, conoce su estado de conservación
              y descubre cómo cada especie sostiene los ecosistemas que también te sostienen a ti.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/mapa"
                className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-teal-900 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Explorar el mapa
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/especies"
                className="inline-flex items-center gap-2 border border-emerald-400/40 hover:border-emerald-400 text-emerald-100 px-6 py-3 rounded-lg transition-colors"
              >
                Ver especies
              </Link>
            </div>
          </div>
        </div>
      </section>

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
            Rayen reúne en un solo lugar fichas de especies, mapas interactivos,
            avistamientos ciudadanos, leyes de protección y formas concretas de actuar.
            Todo el contenido es de código abierto, verificado y construido en colaboración
            con universidades y organizaciones chilenas.
          </p>
        </div>
      </section>
    </div>
  )
}

function Stat({
  label, value, icon: Icon, accent = 'teal',
}: {
  label: string; value: number; icon: any; accent?: 'teal' | 'coral'
}) {
  const colors = accent === 'coral'
    ? 'text-coral-400'
    : 'text-teal-400'

  return (
    <div className="text-center">
      <Icon className={`h-6 w-6 mx-auto mb-2 ${colors}`} strokeWidth={1.5} />
      <p className="text-3xl font-bold text-stone-900">{value.toLocaleString('es-CL')}</p>
      <p className="text-sm text-stone-500 mt-1">{label}</p>
    </div>
  )
}
