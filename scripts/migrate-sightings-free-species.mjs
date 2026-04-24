// Hace species_id nullable en sightings y agrega columna species_name_free
// Uso: node --env-file=.env.local scripts/migrate-sightings-free-species.mjs
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL, { prepare: false })

try {
  await sql`ALTER TABLE sightings ALTER COLUMN species_id DROP NOT NULL`
  console.log('species_id ahora es nullable')

  await sql`ALTER TABLE sightings ADD COLUMN IF NOT EXISTS species_name_free TEXT`
  console.log('columna species_name_free agregada')

  console.log('Migración completada.')
} catch (err) {
  console.error('Error en migración:', err)
  process.exit(1)
} finally {
  await sql.end()
}
