#!/usr/bin/env node
// scripts/db-accion-migration.mjs
// Migración sección Acción — ejecutar desde raíz del proyecto:
//   node --env-file=.env.local scripts/db-accion-migration.mjs
// O desde el directorio principal:
//   DATABASE_URL=... node scripts/db-accion-migration.mjs

import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no definida. Usa --env-file=.env.local o exporta la variable.')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, { prepare: false })

async function run() {
  console.log('🔄 Aplicando migración sección Acción...\n')

  // 1. Mejoras a petitions
  console.log('1/4 Actualizando tabla petitions...')
  await sql.unsafe(`
    ALTER TABLE petitions
      ADD COLUMN IF NOT EXISTS slug            TEXT,
      ADD COLUMN IF NOT EXISTS goal            INT,
      ADD COLUMN IF NOT EXISTS signed_count    INT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS image_url       TEXT,
      ADD COLUMN IF NOT EXISTS ends_at         TIMESTAMPTZ;
    ALTER TABLE petitions ALTER COLUMN url DROP NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_petitions_slug ON petitions (slug) WHERE slug IS NOT NULL;
  `)
  console.log('   ✓ petitions actualizada')

  // 2. Mejoras a organizations
  console.log('2/4 Actualizando tabla organizations...')
  await sql.unsafe(`
    ALTER TABLE organizations
      ADD COLUMN IF NOT EXISTS slug    TEXT,
      ADD COLUMN IF NOT EXISTS website TEXT,
      ADD COLUMN IF NOT EXISTS phone   TEXT,
      ADD COLUMN IF NOT EXISTS active  BOOLEAN NOT NULL DEFAULT TRUE;
    UPDATE organizations SET website = url WHERE website IS NULL AND url IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_slug ON organizations (slug) WHERE slug IS NOT NULL;
  `)
  console.log('   ✓ organizations actualizada')

  // 3. Crear petition_signatures
  console.log('3/4 Creando tabla petition_signatures...')
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS petition_signatures (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      petition_id UUID NOT NULL REFERENCES petitions(id)  ON DELETE CASCADE,
      user_id     UUID NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (petition_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_petition_sigs_petition ON petition_signatures (petition_id);
    CREATE INDEX IF NOT EXISTS idx_petition_sigs_user     ON petition_signatures (user_id);
  `)
  console.log('   ✓ petition_signatures creada')

  // 4. Trigger signed_count
  console.log('4/4 Creando trigger de conteo...')
  await sql.unsafe(`
    CREATE OR REPLACE FUNCTION sync_petition_signed_count()
    RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        UPDATE petitions SET signed_count = signed_count + 1 WHERE id = NEW.petition_id;
      ELSIF TG_OP = 'DELETE' THEN
        UPDATE petitions SET signed_count = GREATEST(signed_count - 1, 0) WHERE id = OLD.petition_id;
      END IF;
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_petition_signed_count ON petition_signatures;
    CREATE TRIGGER trigger_petition_signed_count
      AFTER INSERT OR DELETE ON petition_signatures
      FOR EACH ROW EXECUTE FUNCTION sync_petition_signed_count();
  `)
  console.log('   ✓ trigger creado')

  console.log('\n✅ Migración completada exitosamente.')
  await sql.end()
}

run().catch(err => {
  console.error('❌ Error en migración:', err.message ?? err)
  process.exit(1)
})
