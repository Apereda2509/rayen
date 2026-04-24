// Corrige la foto del Bombus dahlbomii en la tabla media
// Uso: node --env-file=.env.local scripts/fix-bombus-photo.mjs
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL, { prepare: false })

const CORRECT_URL = 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Bombus_dahlbomii.jpg'
const SLUG = 'abejorro-chileno'

try {
  const [species] = await sql`SELECT id, slug, scientific_name, uicn_status FROM species WHERE slug = ${SLUG}`

  if (!species) {
    console.error(`Especie ${SLUG} no encontrada en la BD`)
    process.exit(1)
  }

  console.log(`Especie: ${species.scientific_name} (${species.slug})`)
  console.log(`UICN status actual: ${species.uicn_status}`)

  const [media] = await sql`
    SELECT id, url, is_primary FROM media
    WHERE species_id = ${species.id} AND is_primary = TRUE
  `

  if (media) {
    console.log(`URL actual: ${media.url}`)
    await sql`
      UPDATE media
      SET url    = ${CORRECT_URL},
          credit = 'Wikimedia Commons / Yerlan Abenov',
          license = 'CC-BY-SA-4.0'
      WHERE id = ${media.id}
    `
    console.log(`URL actualizada a: ${CORRECT_URL}`)
  } else {
    // No hay foto primaria — insertar
    await sql`
      INSERT INTO media (species_id, type, url, credit, license, is_primary)
      VALUES (${species.id}, 'foto', ${CORRECT_URL}, 'Wikimedia Commons / Yerlan Abenov', 'CC-BY-SA-4.0', TRUE)
    `
    console.log(`Foto primaria insertada: ${CORRECT_URL}`)
  }

  // Verificar que uicn_status sea CR
  if (species.uicn_status !== 'CR') {
    await sql`UPDATE species SET uicn_status = 'CR', uicn_year = 2021 WHERE id = ${species.id}`
    console.log(`UICN actualizado: ${species.uicn_status} → CR`)
  } else {
    console.log('UICN ya es CR — sin cambios')
  }

  console.log('Listo.')
} finally {
  await sql.end()
}
