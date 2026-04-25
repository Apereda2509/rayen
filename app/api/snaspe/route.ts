// app/api/snaspe/route.ts
// Devuelve las áreas protegidas SNASPE como FeatureCollection GeoJSON.
// Los 2.754 polígonos originales ya están pre-fusionados en la tabla
// (ST_Union por nombre+tipo → 76 features únicos).

import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export const revalidate = 3600 // ISR: revalidar cada hora

export async function GET() {
  try {
    const rows = await sql<{
      nombre: string
      tipo: string | null
      region: string | null
      superficie_ha: number | null
      rayen_slug: string | null
      geometry: object
    }[]>`
      SELECT
        nombre,
        tipo,
        region,
        ROUND(superficie_ha::numeric, 0)  AS superficie_ha,
        rayen_slug,
        ST_AsGeoJSON(geom)::json           AS geometry
      FROM protected_area_polygons
      ORDER BY superficie_ha DESC NULLS LAST
    `

    const featureCollection = {
      type: 'FeatureCollection',
      features: rows.map((row) => ({
        type: 'Feature',
        geometry: row.geometry,
        properties: {
          nombre:       row.nombre,
          tipo:         row.tipo,
          region:       row.region,
          superficie_ha: row.superficie_ha,
          rayen_slug:   row.rayen_slug,
        },
      })),
    }

    return NextResponse.json(featureCollection, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    console.error('[api/snaspe]', err instanceof Error ? err.message : err)
    // Devolver FeatureCollection vacía si la tabla aún no existe
    return NextResponse.json(
      { type: 'FeatureCollection', features: [] },
      { status: 200 }
    )
  }
}
