// app/api/organizations/route.ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 600 // 10 min caché

import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const region = searchParams.get('region')

    const orgs = await sql`
      SELECT
        o.id,
        o.slug,
        o.name,
        o.type::text,
        o.description,
        o.website,
        o.email,
        o.phone,
        o.logo_url  AS "logoUrl",
        o.national,
        r.name      AS "regionName",
        r.code      AS "regionCode"
      FROM organizations o
      LEFT JOIN regions r ON r.id = o.region_id
      WHERE o.active = TRUE
        ${type ? sql`AND o.type = ${type}::org_type` : sql``}
        ${region ? sql`AND r.code = ${region}` : sql``}
      ORDER BY o.national DESC, o.name ASC
    `

    return NextResponse.json({ data: orgs })
  } catch (err) {
    console.error('[API/organizations] GET error:', err)
    return NextResponse.json({ error: 'Error al obtener organizaciones' }, { status: 500 })
  }
}
