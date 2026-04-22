#!/usr/bin/env node
// scripts/fix-wikimedia-photos.js
//
// Reemplaza URLs de Wikimedia en la tabla media por URLs de iNaturalist,
// que sí permite hotlinking sin restricciones.
// También elimina filas duplicadas en media dejando solo una por especie.
//
// Uso: node scripts/fix-wikimedia-photos.js

require('dotenv').config({ path: '.env.local' })
const postgres = require('postgres')
const sql = postgres(process.env.DATABASE_URL, { prepare: false })

async function fetchInaturalistPhoto(scientificName) {
  const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}&per_page=3&rank=species`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Rayen/1.0 (biodiversidad chilena)' },
  })
  if (!res.ok) throw new Error(`iNaturalist API error: ${res.status}`)
  const data = await res.json()

  for (const taxon of data.results ?? []) {
    const photo = taxon.default_photo
    if (photo?.medium_url) return { url: photo.medium_url, credit: photo.attribution ?? 'iNaturalist' }
    if (photo?.url) {
      const medium = photo.url.replace('square', 'medium')
      return { url: medium, credit: photo.attribution ?? 'iNaturalist' }
    }
  }
  return null
}

async function main() {
  // 1. Obtener todas las filas de media con URLs de Wikimedia
  const rows = await sql`
    SELECT m.id AS media_id, m.species_id, s.slug, s.scientific_name
    FROM media m
    JOIN species s ON s.id = m.species_id
    WHERE m.url LIKE '%wikimedia%'
    ORDER BY s.slug, m.created_at ASC
  `

  // Agrupar por especie para procesar cada una una sola vez
  const bySpecies = new Map()
  for (const row of rows) {
    if (!bySpecies.has(row.slug)) bySpecies.set(row.slug, [])
    bySpecies.get(row.slug).push(row)
  }

  console.log(`Procesando ${bySpecies.size} especies con URLs de Wikimedia...\n`)

  for (const [slug, mediaRows] of bySpecies) {
    const { scientific_name } = mediaRows[0]

    try {
      // Buscar foto en iNaturalist
      const photo = await fetchInaturalistPhoto(scientific_name)
      if (!photo) {
        console.error(`  ✗ ${slug}: sin foto en iNaturalist`)
        continue
      }

      // Mantener solo la primera fila, eliminar duplicados
      const [keep, ...duplicates] = mediaRows
      if (duplicates.length > 0) {
        await sql`DELETE FROM media WHERE id = ANY(${duplicates.map(d => d.media_id)})`
      }

      // Actualizar URL y crédito
      await sql`
        UPDATE media
        SET url = ${photo.url}, credit = ${photo.credit}, license = 'CC-BY-NC'
        WHERE id = ${keep.media_id}
      `

      console.log(`  ✓ ${slug}`)
      console.log(`    → ${photo.url.substring(0, 70)}...`)

      // Pequeña pausa para no saturar la API de iNaturalist
      await new Promise(r => setTimeout(r, 300))

    } catch (err) {
      console.error(`  ✗ ${slug}: ${err.message}`)
    }
  }

  console.log('\n✓ Proceso completo')
  await sql.end()
  process.exit(0)
}

main().catch(err => {
  console.error('Error fatal:', err)
  process.exit(1)
})
