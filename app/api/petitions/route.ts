// app/api/petitions/route.ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.dbId ?? null

    const petitions = await sql`
      SELECT
        p.id,
        p.slug,
        p.title,
        p.description,
        p.goal,
        p.signed_count    AS "signedCount",
        p.image_url       AS "imageUrl",
        p.active,
        p.ends_at         AS "endsAt",
        p.created_at      AS "createdAt",
        -- Especie relacionada
        CASE WHEN s.id IS NOT NULL THEN json_build_object(
          'slug',       s.slug,
          'commonName', s.common_name,
          'uicnStatus', s.uicn_status::text,
          'primaryPhoto', (
            SELECT url FROM media
            WHERE species_id = s.id AND is_primary = TRUE
            LIMIT 1
          )
        ) END AS species,
        -- Organización relacionada
        CASE WHEN o.id IS NOT NULL THEN json_build_object(
          'name', o.name,
          'slug', o.slug,
          'logoUrl', o.logo_url
        ) END AS organization,
        -- ¿El usuario actual ya firmó?
        ${userId
          ? sql`EXISTS (
              SELECT 1 FROM petition_signatures ps
              WHERE ps.petition_id = p.id AND ps.user_id = ${userId}::uuid
            )`
          : sql`FALSE`
        } AS "hasSigned"
      FROM petitions p
      LEFT JOIN species s ON s.id = p.species_id
      LEFT JOIN organizations o ON o.id = p.organization_id
      WHERE p.active = TRUE
      ORDER BY p.created_at DESC
    `

    return NextResponse.json({ data: petitions })
  } catch (err) {
    console.error('[API/petitions] GET error:', err)
    return NextResponse.json({ error: 'Error al obtener peticiones' }, { status: 500 })
  }
}
