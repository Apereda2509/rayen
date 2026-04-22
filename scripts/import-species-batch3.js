#!/usr/bin/env node
// scripts/import-species-batch3.js
//
// Importa las 15 fichas del batch 3 desde data/seed/species-batch3.json a la base de datos.
// Uso: node scripts/import-species-batch3.js
//
// Requiere variable DATABASE_URL en .env.local

require('dotenv').config({ path: '.env.local' })
const postgres = require('postgres')
const fs = require('fs')
const path = require('path')

const sql = postgres(process.env.DATABASE_URL, { prepare: false })

async function main() {
  const file = path.join(__dirname, '../data/seed/species-batch3.json')
  const { species } = JSON.parse(fs.readFileSync(file, 'utf-8'))

  console.log(`Importando ${species.length} especies...`)

  let ok = 0
  let errors = 0

  for (const sp of species) {
    try {
      // 1. Insertar especie
      const [inserted] = await sql`
        INSERT INTO species (
          slug, common_name, scientific_name, alternative_names,
          indigenous_names, type, taxonomy,
          uicn_status, uicn_year, uicn_url,
          chile_status, chile_decree,
          population_trend, estimated_population,
          is_endemic, is_national_symbol, cites_appendix,
          altitude_min, altitude_max, countries,
          type_diet, diet_description,
          size_data, size_category, weight_kg_avg, lifespan_years,
          active_period, danger_level, colors,
          description, fun_facts, ecosystem_role,
          human_impact_daily,
          threats_local, threats_global,
          visitor_tips, resident_tips, emergency_contacts,
          published, featured
        ) VALUES (
          ${sp.slug}, ${sp.commonName}, ${sp.scientificName}, ${sp.alternativeNames ?? null},
          ${sql.json(sp.indigenousNames ?? null)}, ${sp.type}, ${sql.json(sp.taxonomy)},
          ${sp.uicnStatus ?? null}, ${sp.uicnYear ?? null}, ${sp.uicnUrl ?? null},
          ${sp.chileStatus ?? null}, ${sp.chileDecree ?? null},
          ${sp.populationTrend ?? 'desconocida'}, ${sp.estimatedPopulation ?? null},
          ${sp.isEndemic ?? false}, ${sp.isNationalSymbol ?? false}, ${sp.citesAppendix ?? null},
          ${sp.altitudeMin ?? null}, ${sp.altitudeMax ?? null}, ${sp.countries ?? null},
          ${sp.typeDiet ?? null}, ${sp.dietDescription ?? null},
          ${sql.json(sp.sizeData ?? null)}, ${sp.sizeCategory ?? null},
          ${sp.weightKgAvg ?? null}, ${sp.lifespanYears ?? null},
          ${sp.activePeriod ?? null}, ${sp.dangerLevel ?? 'ninguno'}, ${sp.colors ?? null},
          ${sp.description}, ${sql.json(sp.funFacts ?? null)}, ${sp.ecosystemRole ?? null},
          ${sp.humanImpactDaily ?? null},
          ${sql.json(sp.threatsLocal ?? null)}, ${sql.json(sp.threatsGlobal ?? null)},
          ${sp.visitorTips ?? null}, ${sp.residentTips ?? null},
          ${sql.json(sp.emergencyContacts ?? null)},
          true, ${sp.isNationalSymbol ?? false}
        )
        ON CONFLICT (slug) DO UPDATE SET
          common_name = EXCLUDED.common_name,
          updated_at = NOW()
        RETURNING id, slug
      `

      console.log(`  ✓ ${inserted.slug}`)
      ok++

      // 2. Insertar relaciones con regiones
      if (sp.regionCodes?.length) {
        for (const code of sp.regionCodes) {
          await sql`
            INSERT INTO species_regions (species_id, region_id)
            SELECT ${inserted.id}, id FROM regions WHERE code = ${code}
            ON CONFLICT DO NOTHING
          `
        }
      }

      // 3. Insertar relaciones con ecosistemas
      if (sp.ecosystemSlugs?.length) {
        for (const slug of sp.ecosystemSlugs) {
          await sql`
            INSERT INTO species_ecosystems (species_id, ecosystem_id)
            SELECT ${inserted.id}, id FROM ecosystems WHERE slug = ${slug}
            ON CONFLICT DO NOTHING
          `
        }
      }

      // 4. Insertar media
      if (sp.media?.length) {
        for (const m of sp.media) {
          await sql`
            INSERT INTO media (species_id, type, url, credit, license, is_primary)
            VALUES (
              ${inserted.id}, ${m.type ?? 'foto'}, ${m.url},
              ${m.credit}, ${m.license ?? null}, ${m.isPrimary ?? false}
            )
            ON CONFLICT DO NOTHING
          `
        }
      }

    } catch (err) {
      console.error(`  ✗ ${sp.slug}: ${err.message}`)
      errors++
    }
  }

  console.log(`\n✓ Importación completa: ${ok} correctas, ${errors} errores`)
  await sql.end()
  process.exit(0)
}

main().catch((err) => {
  console.error('Error fatal:', err)
  process.exit(1)
})
