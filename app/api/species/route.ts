// app/api/species/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSpeciesSummaries, searchSpecies } from '@/lib/db'
import type { SpeciesFilters } from '@/lib/types'

export const runtime = 'nodejs'
export const revalidate = 300 // 5 minutos de caché

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Modo búsqueda rápida (autocompletado)
    const q = searchParams.get('q')
    if (q && q.length >= 2) {
      const results = await searchSpecies(q, 10)
      return NextResponse.json({ data: results })
    }

    // Modo listado con filtros
    const filters: SpeciesFilters = {
      page:    parseInt(searchParams.get('page')  ?? '1'),
      limit:   parseInt(searchParams.get('limit') ?? '24'),
      query:   searchParams.get('query') ?? undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
    }

    // Arrays (vienen como ?type=mamifero&type=ave)
    const types = searchParams.getAll('type')
    if (types.length) filters.type = types as SpeciesFilters['type']

    const uicn = searchParams.getAll('uicn')
    if (uicn.length) filters.uicnStatus = uicn as SpeciesFilters['uicnStatus']

    const chile = searchParams.getAll('chile')
    if (chile.length) filters.chileStatus = chile as SpeciesFilters['chileStatus']

    const regions = searchParams.getAll('region')
    if (regions.length) filters.regionCodes = regions

    const ecosystems = searchParams.getAll('ecosystem')
    if (ecosystems.length) filters.ecosystemSlugs = ecosystems

    const colors = searchParams.getAll('color')
    if (colors.length) filters.colors = colors

    const sizes = searchParams.getAll('size')
    if (sizes.length) filters.sizeCategory = sizes as SpeciesFilters['sizeCategory']

    const endemic = searchParams.get('endemic')
    if (endemic !== null) filters.isEndemic = endemic === 'true'

    const result = await getSpeciesSummaries(filters)
    return NextResponse.json(result)

  } catch (error) {
    console.error('[API/species] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener las especies' },
      { status: 500 }
    )
  }
}
