import { NextResponse } from 'next/server'
import sql from '@/lib/db'

const LIMIT = 20

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const offset = (page - 1) * LIMIT

  const rows = await sql<{
    id: string
    observed_at: string
    region_code: string | null
    photo_url: string | null
    notes: string | null
    verified: boolean
    species_slug: string
    species_common_name: string
    species_scientific_name: string
    species_uicn_status: string | null
    user_name: string | null
    user_username: string | null
    user_avatar: string | null
  }[]>`
    SELECT
      sg.id,
      sg.observed_at,
      sg.region_code,
      sg.photo_url,
      sg.notes,
      sg.verified,
      s.slug        AS species_slug,
      s.common_name AS species_common_name,
      s.scientific_name AS species_scientific_name,
      s.uicn_status::text AS species_uicn_status,
      u.name        AS user_name,
      u.username    AS user_username,
      u.avatar_url  AS user_avatar
    FROM sightings sg
    JOIN species s ON s.id = sg.species_id
    LEFT JOIN users u ON u.id = sg.user_id
    ORDER BY sg.observed_at DESC
    LIMIT ${LIMIT} OFFSET ${offset}
  `

  const [{ total }] = await sql<{ total: number }[]>`
    SELECT COUNT(*)::int AS total FROM sightings
  `

  return NextResponse.json({
    sightings: rows,
    total,
    page,
    hasMore: offset + rows.length < total,
  })
}
