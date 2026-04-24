import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  const rows = await sql<{
    id: string
    name: string
    username: string | null
    avatar_url: string | null
    region_code: string | null
    sightings_count: number
    unique_species: number
    top_region: string | null
  }[]>`
    SELECT
      u.id,
      u.name,
      u.username,
      u.avatar_url,
      u.region_code,
      COUNT(sg.id)::int                            AS sightings_count,
      COUNT(DISTINCT sg.species_id)::int           AS unique_species,
      (
        SELECT sg2.region_code
        FROM sightings sg2
        WHERE sg2.user_id = u.id AND sg2.region_code IS NOT NULL
        GROUP BY sg2.region_code
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ) AS top_region
    FROM users u
    LEFT JOIN sightings sg ON sg.user_id = u.id
    GROUP BY u.id
    HAVING COUNT(sg.id) > 0
    ORDER BY sightings_count DESC, unique_species DESC
    LIMIT 50
  `

  return NextResponse.json({ observers: rows })
}
