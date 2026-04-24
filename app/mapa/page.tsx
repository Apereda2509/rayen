// app/mapa/page.tsx
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { MapLayout } from '@/components/map/MapLayout'
import { getSightingsForMap } from '@/lib/db'

export const metadata = {
  title: 'Mapa interactivo',
  description: 'Explora la biodiversidad chilena en el mapa. Encuentra especies por región, ecosistema y estado de conservación.',
}

interface Props {
  searchParams: { [key: string]: string | string[] | undefined }
}

function asArray(val: string | string[] | undefined): string[] {
  if (!val) return []
  return Array.isArray(val) ? val : [val]
}

export default async function MapaPage({ searchParams }: Props) {
  const types = asArray(searchParams['type'])
  const uicn = asArray(searchParams['uicn'])
  const ecosystems = asArray(searchParams['ecosystem'])
  const endemic = searchParams['endemic'] === 'true' ? true
    : searchParams['endemic'] === 'false' ? false
    : undefined

  const dateFrom = typeof searchParams['dateFrom'] === 'string' ? searchParams['dateFrom'] : undefined
  const dateTo = typeof searchParams['dateTo'] === 'string' ? searchParams['dateTo'] : undefined
  const showProtectedAreas = searchParams['areas'] === '1'
  const selectedAreaSlugs = asArray(searchParams['area'])

  let rawSightings: any[] = []
  try {
    rawSightings = await getSightingsForMap({
      verified: true,
      limit: 1000,
      type: types.length ? types : undefined,
      uicnStatus: uicn.length ? uicn : undefined,
      isEndemic: endemic,
      ecosystemSlugs: ecosystems.length ? ecosystems : undefined,
      dateFrom,
      dateTo,
    })
  } catch (err) {
    console.error('[mapa]', err instanceof Error ? err.message : err)
  }

  const features = rawSightings.map((s: any) => ({
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: [s.lng, s.lat] as [number, number],
    },
    properties: {
      id: s.id,
      speciesId: s.speciesId,
      slug: s.slug,
      commonName: s.commonName,
      scientificName: s.scientificName ?? '',
      uicnStatus: s.uicnStatus,
      photoUrl: s.primaryPhoto ?? s.photoUrl,
      observedAt: s.observedAt ?? null,
      observerName: s.observerName ?? null,
    },
  }))

  const speciesMap = new Map<string, {
    slug: string
    commonName: string
    scientificName: string
    uicnStatus: string | null
    count: number
  }>()
  for (const f of features) {
    const { slug, commonName, scientificName, uicnStatus } = f.properties
    const existing = speciesMap.get(slug)
    if (existing) {
      existing.count++
    } else {
      speciesMap.set(slug, { slug, commonName, scientificName, uicnStatus, count: 1 })
    }
  }
  const speciesList = Array.from(speciesMap.values()).sort((a, b) => b.count - a.count)

  return (
    <Suspense fallback={<PageSkeleton />}>
      <MapLayout
        sightings={features}
        speciesList={speciesList}
        showProtectedAreas={showProtectedAreas || selectedAreaSlugs.length > 0}
        selectedAreaSlugs={selectedAreaSlugs}
      />
    </Suspense>
  )
}

function PageSkeleton() {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="h-12 w-12 mx-auto rounded-full border-2 border-[#00E676] border-t-transparent animate-spin" />
        <p className="mt-4 text-sm text-zinc-400">Cargando mapa...</p>
      </div>
    </div>
  )
}
