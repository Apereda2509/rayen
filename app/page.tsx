// app/page.tsx
export const dynamic = 'force-dynamic'

import { getPlatformStats, getFeaturedSpecies } from '@/lib/db'
import { HeroFrameExpand } from '@/components/home/HeroFrameExpand'
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

      {/* Hero con frame expand */}
      <HeroFrameExpand />

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
