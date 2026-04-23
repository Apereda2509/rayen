// app/api/admin/petitions/route.ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

const ADMIN_EMAIL = 'angelperedajimenez@gmail.com'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const petitions = await sql`
    SELECT
      p.id, p.slug, p.title, p.description,
      p.goal, p.signed_count AS "signedCount",
      p.active, p.image_url AS "imageUrl",
      p.ends_at AS "endsAt", p.created_at AS "createdAt",
      s.common_name AS "speciesName", s.slug AS "speciesSlug"
    FROM petitions p
    LEFT JOIN species s ON s.id = p.species_id
    ORDER BY p.created_at DESC
  `

  return NextResponse.json({ data: petitions })
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, goal, imageUrl, speciesSlug, endsAt } = body

  if (!title || !goal) {
    return NextResponse.json({ error: 'title y goal son requeridos' }, { status: 400 })
  }

  // Generar slug desde título
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
    .slice(0, 80)

  // Garantizar unicidad del slug
  let slug = baseSlug
  let attempt = 1
  while (true) {
    const [exists] = await sql`SELECT id FROM petitions WHERE slug = ${slug}`
    if (!exists) break
    slug = `${baseSlug}-${attempt++}`
  }

  // Buscar species_id si se proveyó slug
  let speciesId: string | null = null
  if (speciesSlug) {
    const [sp] = await sql<{ id: string }[]>`SELECT id FROM species WHERE slug = ${speciesSlug}`
    speciesId = sp?.id ?? null
  }

  const [petition] = await sql`
    INSERT INTO petitions (slug, title, description, goal, signed_count, image_url, species_id, active, ends_at)
    VALUES (
      ${slug}, ${title}, ${description ?? null}, ${Number(goal)}, 0,
      ${imageUrl ?? null}, ${speciesId}, TRUE,
      ${endsAt ? endsAt : null}
    )
    RETURNING id, slug, title, goal, signed_count AS "signedCount", active, created_at AS "createdAt"
  `

  return NextResponse.json({ data: petition }, { status: 201 })
}
