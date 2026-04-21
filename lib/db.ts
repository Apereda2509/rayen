// ============================================================
// RAYEN — Database connection (lib/db.ts)
// Usa postgres.js — más rápido que pg para Next.js
// npm install postgres
// ============================================================

import postgres from 'postgres'
import type {
  Species, SpeciesSummary, SpeciesFilters,
  SpeciesSearchResult, Sighting, CreateSightingInput,
} from './types'

// ── Conexión singleton ────────────────────────────────────────

const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL no está configurada en .env.local')
}

const sql = postgres(connectionString, {
  max: 10,              // Pool máximo de conexiones
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,       // Requerido para Supabase con PgBouncer
})

export default sql

// ── Queries de especies ───────────────────────────────────────

export async function getSpeciesSummaries(
  filters: SpeciesFilters = {}
): Promise<SpeciesSearchResult> {
  const {
    type, uicnStatus, chileStatus, isEndemic,
    regionCodes, ecosystemSlugs, colors,
    sizeCategory, dangerLevel, query,
    page = 1, limit = 24,
  } = filters

  const offset = (page - 1) * limit

  // Construir condiciones dinámicamente
  const conditions: string[] = ['s.published = TRUE']
  const params: unknown[] = []
  let p = 1

  if (type?.length) {
    conditions.push(`s.type = ANY($${p}::species_type[])`)
    params.push(type); p++
  }
  if (uicnStatus?.length) {
    conditions.push(`s.uicn_status = ANY($${p}::uicn_status[])`)
    params.push(uicnStatus); p++
  }
  if (chileStatus?.length) {
    conditions.push(`s.chile_status = ANY($${p}::chile_status[])`)
    params.push(chileStatus); p++
  }
  if (isEndemic !== undefined) {
    conditions.push(`s.is_endemic = $${p}`)
    params.push(isEndemic); p++
  }
  if (sizeCategory?.length) {
    conditions.push(`s.size_category = ANY($${p}::size_category[])`)
    params.push(sizeCategory); p++
  }
  if (dangerLevel?.length) {
    conditions.push(`s.danger_level = ANY($${p}::danger_level[])`)
    params.push(dangerLevel); p++
  }
  if (colors?.length) {
    conditions.push(`s.colors && $${p}::text[]`)
    params.push(colors); p++
  }
  if (regionCodes?.length) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM species_regions sr
        JOIN regions r ON r.id = sr.region_id
        WHERE sr.species_id = s.id AND r.code = ANY($${p}::text[])
      )
    `)
    params.push(regionCodes); p++
  }
  if (ecosystemSlugs?.length) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM species_ecosystems se
        JOIN ecosystems e ON e.id = se.ecosystem_id
        WHERE se.species_id = s.id AND e.slug = ANY($${p}::text[])
      )
    `)
    params.push(ecosystemSlugs); p++
  }
  if (query) {
    conditions.push(`(
      s.common_name ILIKE $${p} OR
      s.scientific_name ILIKE $${p} OR
      similarity(s.common_name, $${p + 1}) > 0.2
    )`)
    params.push(`%${query}%`, query); p += 2
  }

  const where = conditions.join(' AND ')

  // Query paginada
  const rows = await sql.unsafe<SpeciesSummary[]>(`
    SELECT
      s.id, s.slug, s.common_name AS "commonName",
      s.scientific_name AS "scientificName",
      s.type, s.uicn_status AS "uicnStatus",
      s.chile_status AS "chileStatus",
      s.is_endemic AS "isEndemic",
      s.size_category AS "sizeCategory",
      s.danger_level AS "dangerLevel",
      s.colors, s.featured,
      (SELECT url FROM media WHERE species_id = s.id AND is_primary = TRUE LIMIT 1) AS "primaryPhoto",
      (SELECT credit FROM media WHERE species_id = s.id AND is_primary = TRUE LIMIT 1) AS "photoCredit",
      (SELECT array_agg(r.code) FROM species_regions sr JOIN regions r ON r.id = sr.region_id WHERE sr.species_id = s.id) AS "regionCodes",
      (SELECT array_agg(e.slug) FROM species_ecosystems se JOIN ecosystems e ON e.id = se.ecosystem_id WHERE se.species_id = s.id) AS "ecosystemSlugs",
      (SELECT COUNT(*)::int FROM sightings WHERE species_id = s.id AND verified = TRUE) AS "verifiedSightings"
    FROM species s
    WHERE ${where}
    ORDER BY s.featured DESC, s.common_name ASC
    LIMIT ${limit} OFFSET ${offset}
  `, params)

  // Count total
  const [{ count }] = await sql.unsafe<[{ count: number }]>(`
    SELECT COUNT(*)::int AS count FROM species s WHERE ${where}
  `, params)

  return {
    data: rows,
    total: count,
    page,
    limit,
    hasMore: offset + rows.length < count,
  }
}

export async function getSpeciesBySlug(slug: string): Promise<Species | null> {
  const [species] = await sql<Species[]>`
    SELECT
      s.*,
      -- Regiones
      COALESCE(
        (SELECT json_agg(r.code) FROM species_regions sr JOIN regions r ON r.id = sr.region_id WHERE sr.species_id = s.id),
        '[]'
      ) AS "regionCodes",
      -- Ecosistemas
      COALESCE(
        (SELECT json_agg(e.slug) FROM species_ecosystems se JOIN ecosystems e ON e.id = se.ecosystem_id WHERE se.species_id = s.id),
        '[]'
      ) AS "ecosystemSlugs",
      -- Media
      COALESCE(
        (SELECT json_agg(m.* ORDER BY m.is_primary DESC, m.created_at ASC) FROM media m WHERE m.species_id = s.id),
        '[]'
      ) AS media,
      -- Organizaciones
      COALESCE(
        (SELECT json_agg(o.*) FROM species_organizations so JOIN organizations o ON o.id = so.org_id WHERE so.species_id = s.id),
        '[]'
      ) AS organizations,
      -- Leyes
      COALESCE(
        (SELECT json_agg(l.*) FROM species_laws sl JOIN laws l ON l.id = sl.law_id WHERE sl.species_id = s.id),
        '[]'
      ) AS laws,
      -- Peticiones
      COALESCE(
        (SELECT json_agg(p.*) FROM petitions p WHERE p.species_id = s.id AND p.active = TRUE),
        '[]'
      ) AS petitions
    FROM species s
    WHERE s.slug = ${slug} AND s.published = TRUE
  `

  return species ?? null
}

export async function searchSpecies(query: string, limit = 10) {
  return sql<{ slug: string; commonName: string; scientificName: string; type: string }[]>`
    SELECT slug,
           common_name AS "commonName",
           scientific_name AS "scientificName",
           type::text
    FROM species
    WHERE published = TRUE AND (
      common_name ILIKE ${'%' + query + '%'} OR
      scientific_name ILIKE ${'%' + query + '%'} OR
      similarity(common_name, ${query}) > 0.2
    )
    ORDER BY similarity(common_name, ${query}) DESC
    LIMIT ${limit}
  `
}

// ── Queries del mapa ─────────────────────────────────────────

export async function getSightingsForMap(filters?: {
  speciesId?: string
  regionCode?: string
  verified?: boolean
  limit?: number
}) {
  const { speciesId, regionCode, verified = true, limit = 500 } = filters ?? {}

  return sql`
    SELECT
      sg.id, sg.species_id AS "speciesId",
      ST_X(sg.location::geometry) AS lng,
      ST_Y(sg.location::geometry) AS lat,
      sg.observed_at AS "observedAt",
      sg.photo_url AS "photoUrl",
      sg.verified,
      s.common_name AS "commonName",
      s.slug,
      s.uicn_status AS "uicnStatus"
    FROM sightings sg
    JOIN species s ON s.id = sg.species_id
    WHERE sg.verified = ${verified}
      ${speciesId ? sql`AND sg.species_id = ${speciesId}` : sql``}
      ${regionCode ? sql`AND sg.region_code = ${regionCode}` : sql``}
    ORDER BY sg.observed_at DESC
    LIMIT ${limit}
  `
}

// ── Queries de avistamientos ─────────────────────────────────

export async function createSighting(
  userId: string,
  input: CreateSightingInput
) {
  const { speciesId, location, observedAt, photoUrl, notes } = input

  const [sighting] = await sql`
    INSERT INTO sightings (
      species_id, user_id, location, observed_at, photo_url, notes
    ) VALUES (
      ${speciesId},
      ${userId},
      ST_SetSRID(ST_MakePoint(${location.lng}, ${location.lat}), 4326),
      ${observedAt},
      ${photoUrl ?? null},
      ${notes ?? null}
    )
    RETURNING *
  `

  return sighting
}

// ── Estadísticas ─────────────────────────────────────────────

export async function getPlatformStats() {
  const [stats] = await sql`
    SELECT
      (SELECT COUNT(*) FROM species WHERE published = TRUE)::int AS total_species,
      (SELECT COUNT(*) FROM species WHERE published = TRUE AND uicn_status IN ('CR','EN'))::int AS endangered,
      (SELECT COUNT(*) FROM species WHERE published = TRUE AND is_endemic = TRUE)::int AS endemic,
      (SELECT COUNT(*) FROM sightings WHERE verified = TRUE)::int AS verified_sightings,
      (SELECT COUNT(*) FROM users)::int AS total_users
  `
  return stats
}
