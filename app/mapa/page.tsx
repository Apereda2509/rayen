// app/mapa/page.tsx
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import nextDynamic from 'next/dynamic'
import { MapFilters } from '@/components/map/MapFilters'
import { MapLegend } from '@/components/map/MapLegend'
import { MobileFiltersButton } from '@/components/map/MobileFiltersButton'
import { getSightingsForMap } from '@/lib/db'

const RayenMap = nextDynamic(
  () => import('@/components/map/RayenMap').then((m) => m.RayenMap),
  { ssr: false, loading: () => <MapSkeleton /> }
)

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
    },
  }))

  return (
    <div className="relative h-[calc(100vh-3.5rem)] flex">
      <aside className="hidden lg:block w-64 border-r border-stone-200 bg-white overflow-y-auto scroll-thin">
        <Suspense fallback={<div className="p-4 text-sm text-stone-400">Cargando filtros…</div>}>
          <MapFilters />
        </Suspense>
      </aside>

      <div className="flex-1 relative">
        <Suspense fallback={<MapSkeleton />}>
          <RayenMap
            sightings={features}
            showProtectedAreas={showProtectedAreas || selectedAreaSlugs.length > 0}
            selectedAreaSlugs={selectedAreaSlugs}
          />
        </Suspense>

        <div className="absolute bottom-4 left-4 z-10">
          <MapLegend />
        </div>

        <MobileFiltersButton />
      </div>
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-stone-100">
      <div className="text-center">
        <div className="h-12 w-12 mx-auto rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
        <p className="mt-4 text-sm text-stone-500">Cargando mapa...</p>
      </div>
    </div>
  )
}
