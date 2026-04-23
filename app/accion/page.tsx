export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import sql from '@/lib/db'
import { AccionTabs } from '@/components/accion/AccionTabs'

export const metadata = {
  title: 'Acción — Rayen',
  description: 'Firma peticiones, conoce organizaciones conservacionistas, el marco legal ambiental de Chile y qué hacer ante emergencias ambientales.',
}

async function getPetitions(userId: string | null) {
  return sql`
    SELECT
      p.id,
      p.slug,
      p.title,
      p.description,
      p.goal,
      p.signed_count          AS "signedCount",
      p.image_url             AS "imageUrl",
      p.active,
      p.ends_at               AS "endsAt",
      p.created_at            AS "createdAt",
      json_build_object(
        'slug',       s.slug,
        'commonName', s.common_name,
        'uicnStatus', s.uicn_status::text,
        'primaryPhoto', (
          SELECT url FROM media WHERE species_id = s.id AND is_primary = TRUE LIMIT 1
        )
      ) FILTER (WHERE s.id IS NOT NULL)  AS species,
      json_build_object(
        'name',    o.name,
        'slug',    o.slug,
        'logoUrl', o.logo_url
      ) FILTER (WHERE o.id IS NOT NULL) AS organization,
      ${userId
        ? sql`EXISTS (SELECT 1 FROM petition_signatures ps WHERE ps.petition_id = p.id AND ps.user_id = ${userId}::uuid)`
        : sql`FALSE`
      } AS "hasSigned"
    FROM petitions p
    LEFT JOIN species s ON s.id = p.species_id
    LEFT JOIN organizations o ON o.id = p.organization_id
    WHERE p.active = TRUE
    ORDER BY p.created_at DESC
  `
}

async function getOrganizations() {
  return sql`
    SELECT
      o.id, o.slug, o.name,
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
    ORDER BY o.national DESC, o.name ASC
  `
}

async function getLaws() {
  return sql`
    SELECT id, name, number, year, type, description, url
    FROM laws
    ORDER BY year DESC
  `
}

export default async function AccionPage() {
  const session = await auth()
  const userId = session?.user?.dbId ?? null
  const isLoggedIn = !!session?.user?.email

  const [petitions, organizations, laws] = await Promise.all([
    getPetitions(userId),
    getOrganizations(),
    getLaws(),
  ])

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Acción</h1>
        <p className="text-stone-500 max-w-2xl">
          La biodiversidad de Chile necesita defensores. Firma peticiones, conoce las
          organizaciones que trabajan en conservación, entiende el marco legal y aprende
          qué hacer cuando presencias una emergencia ambiental.
        </p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4 text-center">
          <p className="text-2xl font-bold text-teal-700">{petitions.length}</p>
          <p className="text-xs text-teal-600 mt-0.5">Peticiones activas</p>
        </div>
        <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4 text-center">
          <p className="text-2xl font-bold text-violet-700">{organizations.length}</p>
          <p className="text-xs text-violet-600 mt-0.5">Organizaciones aliadas</p>
        </div>
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{laws.length}</p>
          <p className="text-xs text-blue-600 mt-0.5">Leyes de protección</p>
        </div>
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">6</p>
          <p className="text-xs text-amber-600 mt-0.5">Guías de emergencia</p>
        </div>
      </div>

      {/* Tabs con contenido */}
      <AccionTabs
        petitions={JSON.parse(JSON.stringify(petitions))}
        organizations={JSON.parse(JSON.stringify(organizations))}
        laws={JSON.parse(JSON.stringify(laws))}
        isLoggedIn={isLoggedIn}
      />
    </main>
  )
}
