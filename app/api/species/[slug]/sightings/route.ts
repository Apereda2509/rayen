export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSightingsBySpecies } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const dateFrom = searchParams.get('dateFrom') ?? undefined
    const dateTo = searchParams.get('dateTo') ?? undefined
    const regionCodes = searchParams.getAll('region')
    const areaSlug = searchParams.get('area') ?? undefined

    const data = await getSightingsBySpecies(params.slug, {
      dateFrom,
      dateTo,
      regionCodes: regionCodes.length ? regionCodes : undefined,
      areaSlug,
    })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[sightings] Error:', err)
    return NextResponse.json({ error: 'Error al obtener avistamientos' }, { status: 500 })
  }
}
