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
  const params: any[] = []
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
      s.common_name          AS "commonName",
      s.scientific_name      AS "scientificName",
      s.alternative_names    AS "alternativeNames",
      s.indigenous_names     AS "indigenousNames",
      s.uicn_status          AS "uicnStatus",
      s.uicn_year            AS "uicnYear",
      s.uicn_url             AS "uicnUrl",
      s.chile_status         AS "chileStatus",
      s.chile_decree         AS "chileDecree",
      s.population_trend     AS "populationTrend",
      s.estimated_population AS "estimatedPopulation",
      s.is_endemic           AS "isEndemic",
      s.is_national_symbol   AS "isNationalSymbol",
      s.cites_appendix       AS "citesAppendix",
      s.altitude_min         AS "altitudeMin",
      s.altitude_max         AS "altitudeMax",
      s.type_diet            AS "typeDiet",
      s.diet_description     AS "dietDescription",
      s.size_data            AS "sizeData",
      s.size_category        AS "sizeCategory",
      s.weight_kg_avg        AS "weightKgAvg",
      s.lifespan_years       AS "lifespanYears",
      s.active_period        AS "activePeriod",
      s.danger_level         AS "dangerLevel",
      s.fun_facts            AS "funFacts",
      s.ecosystem_role       AS "ecosystemRole",
      s.human_impact_daily   AS "humanImpactDaily",
      s.threats_local        AS "threatsLocal",
      s.threats_global       AS "threatsGlobal",
      s.visitor_tips         AS "visitorTips",
      s.resident_tips        AS "residentTips",
      s.emergency_contacts   AS "emergencyContacts",
      s.created_at           AS "createdAt",
      s.updated_at           AS "updatedAt",
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
      -- Media con claves camelCase
      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'id', m.id,
            'speciesId', m.species_id,
            'type', m.type,
            'url', m.url,
            'credit', m.credit,
            'license', m.license,
            'isPrimary', m.is_primary,
            'createdAt', m.created_at
          )
          ORDER BY m.is_primary DESC, m.created_at ASC
        ) FROM media m WHERE m.species_id = s.id),
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
  return sql<{ slug: string; commonName: string; scientificName: string; type: string; primaryPhoto: string | null }[]>`
    SELECT s.slug,
           s.common_name AS "commonName",
           s.scientific_name AS "scientificName",
           s.type::text,
           (SELECT url FROM media WHERE species_id = s.id AND is_primary = TRUE AND type = 'foto' LIMIT 1) AS "primaryPhoto"
    FROM species s
    WHERE s.published = TRUE AND (
      s.common_name ILIKE ${'%' + query + '%'} OR
      s.scientific_name ILIKE ${'%' + query + '%'} OR
      similarity(s.common_name, ${query}) > 0.2
    )
    ORDER BY similarity(s.common_name, ${query}) DESC
    LIMIT ${limit}
  `
}

// ── Queries del mapa ─────────────────────────────────────────

export async function getSightingsForMap(filters?: {
  speciesId?: string
  regionCode?: string
  verified?: boolean
  limit?: number
  type?: string[]
  uicnStatus?: string[]
  isEndemic?: boolean
  ecosystemSlugs?: string[]
  dateFrom?: string
  dateTo?: string
}) {
  const { speciesId, regionCode, verified = true, limit = 500,
    type, uicnStatus, isEndemic, ecosystemSlugs, dateFrom, dateTo } = filters ?? {}

  return sql`
    SELECT
      sg.id, sg.species_id AS "speciesId",
      ST_X(sg.location::geometry) AS lng,
      ST_Y(sg.location::geometry) AS lat,
      sg.observed_at AS "observedAt",
      sg.photo_url AS "photoUrl",
      sg.verified,
      s.common_name AS "commonName",
      s.scientific_name AS "scientificName",
      s.slug,
      s.type,
      s.uicn_status AS "uicnStatus",
      s.is_endemic AS "isEndemic",
      (SELECT url FROM media WHERE species_id = s.id AND is_primary = TRUE LIMIT 1) AS "primaryPhoto",
      u.name AS "observerName",
      sg.region_code AS "regionCode"
    FROM sightings sg
    JOIN species s ON s.id = sg.species_id
    LEFT JOIN users u ON u.id = sg.user_id
    WHERE sg.verified = ${verified}
      ${speciesId ? sql`AND sg.species_id = ${speciesId}` : sql``}
      ${regionCode ? sql`AND sg.region_code = ${regionCode}` : sql``}
      ${type?.length ? sql`AND s.type = ANY(${type}::species_type[])` : sql``}
      ${uicnStatus?.length ? sql`AND s.uicn_status = ANY(${uicnStatus}::uicn_status[])` : sql``}
      ${isEndemic !== undefined ? sql`AND s.is_endemic = ${isEndemic}` : sql``}
      ${ecosystemSlugs?.length ? sql`AND EXISTS (
        SELECT 1 FROM species_ecosystems se
        JOIN ecosystems e ON e.id = se.ecosystem_id
        WHERE se.species_id = s.id AND e.slug = ANY(${ecosystemSlugs})
      )` : sql``}
      ${dateFrom ? sql`AND sg.observed_at >= ${dateFrom}::timestamptz` : sql``}
      ${dateTo ? sql`AND sg.observed_at <= ${dateTo}::timestamptz + INTERVAL '1 day'` : sql``}
    ORDER BY sg.observed_at DESC
    LIMIT ${limit}
  `
}

export async function getSightingsBySpecies(
  slug: string,
  filters?: { dateFrom?: string; dateTo?: string; regionCodes?: string[]; areaSlug?: string }
) {
  const { dateFrom, dateTo, regionCodes, areaSlug } = filters ?? {}
  return sql<{
    id: string; lat: number; lng: number
    observedAt: string; regionCode: string | null; notes: string | null
  }[]>`
    SELECT
      sg.id,
      ST_Y(sg.location::geometry) AS lat,
      ST_X(sg.location::geometry) AS lng,
      sg.observed_at AS "observedAt",
      sg.region_code AS "regionCode",
      sg.notes
    FROM sightings sg
    JOIN species s ON s.id = sg.species_id
    ${areaSlug ? sql`JOIN protected_areas pa ON pa.slug = ${areaSlug}` : sql``}
    WHERE s.slug = ${slug} AND sg.verified = TRUE
      ${dateFrom ? sql`AND sg.observed_at >= ${dateFrom}::timestamptz` : sql``}
      ${dateTo ? sql`AND sg.observed_at <= ${dateTo}::timestamptz + INTERVAL '1 day'` : sql``}
      ${regionCodes?.length ? sql`AND sg.region_code = ANY(${regionCodes})` : sql``}
      ${areaSlug ? sql`AND ST_DWithin(sg.location::geography, pa.centroid::geography, 100000)` : sql``}
    ORDER BY sg.observed_at DESC
    LIMIT 200
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

// ── Especies destacadas para el home ─────────────────────────

export async function getFeaturedSpecies(limit = 6): Promise<SpeciesSummary[]> {
  const result = await getSpeciesSummaries({ limit, page: 1 })
  return result.data
}

// ── Estadísticas ─────────────────────────────────────────────

export async function getPlatformStats() {
  const [stats] = await sql<{ total_species: number; endangered: number; endemic: number; verified_sightings: number; total_users: number }[]>`
    SELECT
      (SELECT COUNT(*) FROM species WHERE published = TRUE)::int AS total_species,
      (SELECT COUNT(*) FROM species WHERE published = TRUE AND uicn_status IN ('CR','EN'))::int AS endangered,
      (SELECT COUNT(*) FROM species WHERE published = TRUE AND is_endemic = TRUE)::int AS endemic,
      (SELECT COUNT(*) FROM sightings WHERE verified = TRUE)::int AS verified_sightings,
      (SELECT COUNT(*) FROM users)::int AS total_users
  `
  return stats
}

// ── Áreas protegidas ─────────────────────────────────────────

export interface ProtectedAreaBasic {
  id: string
  name: string
  slug: string
  type: string
  regionName: string | null
  areaHa: number | null
  centroidLng: number | null
  centroidLat: number | null
  conafUrl: string | null
  description: string | null
  photoUrl: string | null
}

export async function getProtectedAreas(): Promise<ProtectedAreaBasic[]> {
  return sql<ProtectedAreaBasic[]>`
    SELECT
      id,
      name,
      slug,
      type::text,
      region_name AS "regionName",
      area_ha AS "areaHa",
      ST_X(centroid) AS "centroidLng",
      ST_Y(centroid) AS "centroidLat",
      conaf_url AS "conafUrl",
      description,
      photo_url AS "photoUrl"
    FROM protected_areas
    WHERE centroid IS NOT NULL
    ORDER BY name
  `
}

export async function getProtectedAreaBySlug(slug: string) {
  const [area] = await sql<(ProtectedAreaBasic & { sightingsCount: number })[  ]>`
    SELECT
      pa.id,
      pa.name,
      pa.slug,
      pa.type::text,
      pa.region_name AS "regionName",
      pa.area_ha AS "areaHa",
      ST_X(pa.centroid) AS "centroidLng",
      ST_Y(pa.centroid) AS "centroidLat",
      pa.conaf_url AS "conafUrl",
      pa.description,
      pa.photo_url AS "photoUrl",
      COUNT(DISTINCT s.id)::int AS "sightingsCount"
    FROM protected_areas pa
    LEFT JOIN sightings s ON ST_DWithin(
      s.location::geography,
      pa.centroid::geography,
      50000
    )
    WHERE pa.slug = ${slug}
    GROUP BY pa.id
  `
  return area ?? null
}

// ── Foto principal de especie por popularidad ────────────────

export async function getPrimaryPhotoForSpecies(speciesId: string): Promise<string | null> {
  // 1. Foto aprobada con más favoritos
  const [approved] = await sql<{ url: string }[]>`
    SELECT url FROM photos
    WHERE species_id = ${speciesId} AND candidate_approved = TRUE
    ORDER BY favorites_count DESC, created_at ASC
    LIMIT 1
  `
  if (approved) return approved.url

  // 2. Fallback: foto primaria de media (Wikimedia)
  const [media] = await sql<{ url: string }[]>`
    SELECT url FROM media WHERE species_id = ${speciesId} AND is_primary = TRUE LIMIT 1
  `
  return media?.url ?? null
}

export async function getSightingsNearArea(slug: string, limit = 20) {
  return sql<{
    id: string; slug: string; commonName: string; scientificName: string;
    uicnStatus: string | null; photoUrl: string | null; observedAt: string
  }[]>`
    SELECT DISTINCT ON (sp.id)
      sp.id, sp.slug,
      sp.common_name AS "commonName",
      sp.scientific_name AS "scientificName",
      sp.uicn_status::text AS "uicnStatus",
      (SELECT url FROM media WHERE species_id = sp.id AND is_primary = TRUE AND type = 'foto' LIMIT 1) AS "photoUrl",
      si.observed_at AS "observedAt"
    FROM sightings si
    JOIN species sp ON si.species_id = sp.id
    JOIN protected_areas pa ON pa.slug = ${slug}
    WHERE ST_DWithin(si.location::geography, pa.centroid::geography, 50000)
      AND si.verified = TRUE
    ORDER BY sp.id, si.observed_at DESC
    LIMIT ${limit}
  `
}
