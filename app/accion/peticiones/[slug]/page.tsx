export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/auth'
import sql from '@/lib/db'
import { PetitionDetailClient } from '@/components/accion/PetitionDetailClient'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const rows = await sql<{ title: string; description: string }[]>`
    SELECT title, description FROM petitions
    WHERE slug = ${params.slug} AND active = TRUE
    LIMIT 1
  `
  if (!rows.length) return { title: 'Petición — Rayen' }
  return {
    title: `${rows[0].title} — Rayen`,
    description: rows[0].description.slice(0, 160),
  }
}

export default async function PetitionDetailPage({ params }: Props) {
  const session = await auth()
  const userId = session?.user?.dbId ?? null

  const rows = await sql<any[]>`
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
      CASE WHEN o.id IS NOT NULL THEN json_build_object(
        'id',      o.id,
        'name',    o.name,
        'slug',    o.slug,
        'logoUrl', o.logo_url,
        'website', o.website
      ) END AS organization,
      CASE WHEN s.id IS NOT NULL THEN json_build_object(
        'slug',         s.slug,
        'commonName',   s.common_name,
        'uicnStatus',   s.uicn_status::text,
        'primaryPhoto', (
          SELECT url FROM media WHERE species_id = s.id AND is_primary = TRUE LIMIT 1
        )
      ) END AS species,
      ${userId
        ? sql`EXISTS (
            SELECT 1 FROM petition_signatures ps
            WHERE ps.petition_id = p.id AND ps.user_id = ${userId}::uuid
          )`
        : sql`FALSE`
      } AS "hasSigned"
    FROM petitions p
    LEFT JOIN organizations o ON o.id = p.organization_id
    LEFT JOIN species s ON s.id = p.species_id
    WHERE p.slug = ${params.slug} AND p.active = TRUE
    LIMIT 1
  `

  if (!rows.length) notFound()

  return (
    <PetitionDetailClient
      petition={JSON.parse(JSON.stringify(rows[0]))}
      userEmail={session?.user?.email ?? null}
      userId={userId}
      isLoggedIn={!!session?.user?.email}
    />
  )
}
