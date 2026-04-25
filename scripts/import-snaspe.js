#!/usr/bin/env node
// scripts/import-snaspe.js
//
// Importa los polígonos SNASPE del GeoJSON oficial de CONAF a la base de datos.
// Fusiona polígonos del mismo área con ST_Union → 76 filas únicas.
//
// Uso:
//   node scripts/import-snaspe.js [ruta-al-geojson]
//
// Ejemplo:
//   node scripts/import-snaspe.js ~/Downloads/Áreas_SNASPE_de_Chile.geojson
//
// Requiere DATABASE_URL en .env.local
// Requiere haber ejecutado: db/migrations/004_snaspe_polygons.sql
// ============================================================

require('dotenv').config({ path: '.env.local' })
const postgres = require('postgres')
const fs = require('fs')
const path = require('path')

const DEFAULT_GEOJSON = path.join(
  process.env.HOME || '',
  'Downloads',
  'Áreas_SNASPE_de_Chile.geojson'
)
const GEOJSON_PATH = process.argv[2] || DEFAULT_GEOJSON

if (!fs.existsSync(GEOJSON_PATH)) {
  console.error(`Error: archivo no encontrado en ${GEOJSON_PATH}`)
  console.error('Uso: node scripts/import-snaspe.js [ruta-al-geojson]')
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL no está definida en .env.local')
  process.exit(1)
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false })

async function main() {
  console.log(`Leyendo GeoJSON desde: ${GEOJSON_PATH}`)
  const raw = fs.readFileSync(GEOJSON_PATH, 'utf-8')
  const geojson = JSON.parse(raw)
  const features = geojson.features

  console.log(`Total features: ${features.length}`)

  // ── Paso 1: vaciar tabla ──────────────────────────────────
  console.log('Vaciando tabla protected_area_polygons...')
  await sql`TRUNCATE TABLE protected_area_polygons`

  // ── Paso 2: agrupar features por nombre + tipo ────────────
  const groups = new Map()
  for (const f of features) {
    const p = f.properties
    const key = `${p.SNASPE}||${p.TIPO}`
    if (!groups.has(key)) {
      groups.set(key, {
        nombre: p.SNASPE,
        tipo: p.TIPO || null,
        region: p.NOM_REGION || null,
        superficie_ha: 0,
        polygons: [],
        properties: p,
      })
    }
    const g = groups.get(key)
    g.superficie_ha += p.SUPERFICIE || 0
    g.polygons.push(JSON.stringify(f.geometry))
  }

  const uniqueAreas = Array.from(groups.values())
  console.log(`Áreas únicas (nombre + tipo): ${uniqueAreas.length}`)

  // ── Paso 3: insertar en batches ───────────────────────────
  const BATCH = 10
  let inserted = 0

  for (let i = 0; i < uniqueAreas.length; i += BATCH) {
    const batch = uniqueAreas.slice(i, i + BATCH)

    await Promise.all(batch.map(async (area) => {
      const geomJsons = area.polygons

      if (geomJsons.length === 1) {
        await sql`
          INSERT INTO protected_area_polygons
            (nombre, tipo, region, superficie_ha, geom, properties)
          VALUES (
            ${area.nombre},
            ${area.tipo},
            ${area.region},
            ${area.superficie_ha},
            ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(${geomJsons[0]}), 4326)),
            ${JSON.stringify(area.properties)}
          )
        `
      } else {
        const placeholders = geomJsons.map(
          (g) => `ST_SetSRID(ST_GeomFromGeoJSON('${g.replace(/'/g, "''")}'), 4326)`
        ).join(', ')

        await sql.unsafe(`
          INSERT INTO protected_area_polygons
            (nombre, tipo, region, superficie_ha, geom, properties)
          VALUES (
            $1, $2, $3, $4,
            ST_Multi(ST_Union(ARRAY[${placeholders}])),
            $5::jsonb
          )
        `, [
          area.nombre,
          area.tipo,
          area.region,
          area.superficie_ha,
          JSON.stringify(area.properties),
        ])
      }
    }))

    inserted += batch.length
    process.stdout.write(`\rProgreso: ${inserted}/${uniqueAreas.length} áreas`)
  }

  console.log(`\n\nImportación completada.`)
  console.log(`  Áreas insertadas: ${inserted}`)
  await sql.end()
}

main().catch((err) => {
  console.error('\nError durante importación:', err.message)
  process.exit(1)
})
