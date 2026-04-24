// app/page.tsx
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getPlatformStats, getFeaturedSpecies } from '@/lib/db'
import { HomeStats } from '@/components/home/HomeStats'
import { HomeParallaxSections } from '@/components/home/HomeParallaxSections'
import type { SpeciesSummary } from '@/lib/types'

export default async function HomePage() {
  let stats = { total_species: 35, endangered: 12, endemic: 18 }
  let featuredSpecies: SpeciesSummary[] = []

  try {
    const raw = await getPlatformStats()
    stats = { total_species: raw.total_species, endangered: raw.endangered, endemic: raw.endemic }
  } catch {
    // fallback values are already set above
  }

  try {
    featuredSpecies = await getFeaturedSpecies(6)
  } catch {
    featuredSpecies = []
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">

      {/* Hero — no tocar */}
      <section className="relative overflow-hidden bg-carbon-900 text-white h-screen">
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
        <div className="absolute inset-0 bg-carbon-900/70" aria-hidden="true" />

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
            <div className="max-w-3xl">
              <p className="font-grotesk text-neon-400 text-sm font-medium uppercase tracking-wider mb-4">
                Plataforma de biodiversidad chilena
              </p>
              <h1 className="font-grotesk text-4xl lg:text-6xl font-bold leading-tight tracking-tight">
                Chile florece <br />
                <span className="text-neon-400">cuando lo conocemos.</span>
              </h1>
              <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-2xl">
                Explora la fauna y flora nativa de Chile, conoce su estado de conservación
                y descubre cómo cada especie sostiene los ecosistemas que también te sostienen a ti.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/mapa"
                  className="inline-flex items-center gap-2 bg-neon-400 hover:bg-neon-300 text-black font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  Explorar el mapa
                </Link>
                <Link
                  href="/especies"
                  className="inline-flex items-center gap-2 border border-neon-400/40 hover:border-neon-400 text-white/90 px-6 py-3 rounded-lg transition-colors"
                >
                  Ver especies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats animados */}
      <HomeStats
        totalSpecies={stats.total_species}
        endangered={stats.endangered}
        endemic={stats.endemic}
      />

      {/* Secciones parallax */}
      <HomeParallaxSections species={featuredSpecies} />

    </div>
  )
}
