// scripts/migrate-users-photos.js
// Migración: añade campos de perfil a users y crea tablas photos, photo_favorites, species_favorites
// Uso: node scripts/migrate-users-photos.js

require('dotenv').config({ path: '.env.local' })
const postgres = require('postgres')

const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
})

async function main() {
  console.log('🔄 Iniciando migración...')

  // 1. Añadir columnas a users
  await sql`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS username         TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS bio              TEXT,
      ADD COLUMN IF NOT EXISTS instagram        TEXT,
      ADD COLUMN IF NOT EXISTS linkedin         TEXT,
      ADD COLUMN IF NOT EXISTS inaturalist      TEXT,
      ADD COLUMN IF NOT EXISTS twitter          TEXT,
      ADD COLUMN IF NOT EXISTS website          TEXT,
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS onboarding_data  JSONB
  `
  console.log('✅ Columnas añadidas a users')

  // Generar usernames desde email para usuarios existentes que no tienen username
  const usersWithoutUsername = await sql`
    SELECT id, email FROM users WHERE username IS NULL
  `
  for (const u of usersWithoutUsername) {
    const base = u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')
    let username = base
    let attempt = 0
    while (true) {
      const candidate = attempt === 0 ? username : `${username}${attempt}`
      const [existing] = await sql`SELECT id FROM users WHERE username = ${candidate} AND id != ${u.id}`
      if (!existing) { username = candidate; break }
      attempt++
    }
    await sql`UPDATE users SET username = ${username} WHERE id = ${u.id}`
  }
  console.log(`✅ Usernames generados para ${usersWithoutUsername.length} usuarios`)

  // 2. Crear tabla photos
  await sql`
    CREATE TABLE IF NOT EXISTS photos (
      id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      species_id            UUID REFERENCES species(id) ON DELETE SET NULL,
      sighting_id           UUID REFERENCES sightings(id) ON DELETE SET NULL,
      url                   TEXT NOT NULL,
      cloudinary_id         TEXT,
      license               TEXT NOT NULL DEFAULT 'public' CHECK (license IN ('public', 'view_only')),
      is_species_candidate  BOOLEAN NOT NULL DEFAULT FALSE,
      candidate_approved    BOOLEAN NOT NULL DEFAULT FALSE,
      candidate_approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
      candidate_approved_at TIMESTAMPTZ,
      favorites_count       INTEGER NOT NULL DEFAULT 0,
      created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  console.log('✅ Tabla photos creada')

  // 3. Crear tabla photo_favorites
  await sql`
    CREATE TABLE IF NOT EXISTS photo_favorites (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      photo_id   UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS photo_favorites_user_photo_idx
    ON photo_favorites(user_id, photo_id)
  `
  console.log('✅ Tabla photo_favorites creada')

  // 4. Crear tabla species_favorites
  await sql`
    CREATE TABLE IF NOT EXISTS species_favorites (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      species_id UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS species_favorites_user_species_idx
    ON species_favorites(user_id, species_id)
  `
  console.log('✅ Tabla species_favorites creada')

  await sql.end()
  console.log('🎉 Migración completada exitosamente')
}

main().catch((err) => {
  console.error('❌ Error en migración:', err)
  process.exit(1)
})
