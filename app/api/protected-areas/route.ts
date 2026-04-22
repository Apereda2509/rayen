export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 3600 // 1 hora

import { NextResponse } from 'next/server'
import { getProtectedAreas } from '@/lib/db'

export async function GET() {
  try {
    const areas = await getProtectedAreas()

    // Devuelve GeoJSON FeatureCollection para uso directo en Mapbox
    const geojson = {
      type: 'FeatureCollection' as const,
      features: areas
        .filter(a => a.centroidLng !== null && a.centroidLat !== null)
        .map(a => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [a.centroidLng!, a.centroidLat!] as [number, number],
          },
          properties: {
            id: a.id,
            name: a.name,
            slug: a.slug,
            type: a.type,
            regionName: a.regionName,
            areaHa: a.areaHa,
            conafUrl: a.conafUrl,
            description: a.description,
          },
        })),
    }

    return NextResponse.json(geojson)
  } catch (error) {
    console.error('[API/protected-areas]', error)
    return NextResponse.json({ error: 'Error al obtener áreas protegidas' }, { status: 500 })
  }
}
