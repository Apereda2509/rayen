import { NextResponse } from 'next/server'
import sql from '@/lib/db'

interface Props { params: { slug: string } }

export async function GET(_req: Request, { params }: Props) {
  const [row] = await sql<{
    id: string; slug: string; titulo: string; nivel: string
    slides: unknown[]; species_id: string | null
    species_common_name: string | null; species_slug: string | null
  }[]>`
    SELECT
      p.id, p.slug, p.titulo, p.nivel, p.slides, p.species_id,
      s.common_name AS species_common_name,
      s.slug        AS species_slug
    FROM presentaciones p
    LEFT JOIN species s ON s.id = p.species_id
    WHERE p.slug = ${params.slug} AND p.published = TRUE
  `
  if (!row) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  return NextResponse.json(row)
}
