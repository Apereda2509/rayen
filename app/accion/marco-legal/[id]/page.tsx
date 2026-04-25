export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import sql from '@/lib/db'
import { LawDetailClient } from '@/components/accion/LawDetailClient'

interface Props {
  params: { id: string }
}

async function getLaw(id: string) {
  const rows = await sql`
    SELECT
      id, name, number, year, type::text, description, url,
      emisor, image_url AS "imageUrl",
      short_description AS "shortDescription",
      full_description  AS "fullDescription",
      relevance
    FROM laws
    WHERE id = ${id}
    LIMIT 1
  `
  return rows[0] ?? null
}

export async function generateMetadata({ params }: Props) {
  const law = await getLaw(params.id)
  if (!law) return { title: 'Ley no encontrada' }
  return {
    title: `${law.name} — Marco Legal — Rayen`,
    description: law.shortDescription ?? law.description ?? '',
  }
}

export default async function LawDetailPage({ params }: Props) {
  const law = await getLaw(params.id)
  if (!law) notFound()
  return <LawDetailClient law={law as any} />
}
