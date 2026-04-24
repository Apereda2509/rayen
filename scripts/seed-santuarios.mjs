// scripts/seed-santuarios.mjs
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read DATABASE_URL from .env.local
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const match = envContent.match(/^DATABASE_URL=(.+)$/m)
if (!match) throw new Error('DATABASE_URL not found in .env.local')
const DATABASE_URL = match[1].trim()

const { default: postgres } = await import('postgres')
const sql = postgres(DATABASE_URL, { prepare: false })

try {
  await sql`
    INSERT INTO protected_areas (name, slug, type, region_name, centroid, description, photo_url)
    VALUES
      (
        'Santuario de la Naturaleza Yerba Loca',
        'santuario-yerba-loca',
        'santuario_naturaleza',
        'Metropolitana',
        ST_SetSRID(ST_MakePoint(-70.47, -33.20), 4326),
        'Ubicado en el cajón del río Yerba Loca, en las comunas de Lo Barnechea y Colina. Protege ecosistemas de alta montaña y una importante diversidad de flora y fauna andina.',
        'https://upload.wikimedia.org/wikipedia/commons/e/e8/Estero_Yerba_loca.jpg'
      ),
      (
        'Santuario de la Naturaleza Laguna El Peral',
        'santuario-laguna-el-peral',
        'santuario_naturaleza',
        'Valparaíso',
        ST_SetSRID(ST_MakePoint(-71.61, -33.58), 4326),
        'Humedal costero ubicado en El Quisco. Refugio de aves acuáticas migratorias y residentes, incluyendo especies amenazadas.',
        'https://upload.wikimedia.org/wikipedia/commons/1/1a/Laguna_el_peral%2C_Chile.JPG'
      ),
      (
        'Santuario de la Naturaleza Carlos Anwandter',
        'santuario-carlos-anwandter',
        'santuario_naturaleza',
        'Los Ríos',
        ST_SetSRID(ST_MakePoint(-73.14, -39.77), 4326),
        'Humedal del río Cruces, cerca de Valdivia. Sitio Ramsar y hábitat crítico para el cisne de cuello negro y otras aves acuáticas.',
        'https://upload.wikimedia.org/wikipedia/commons/e/e2/Humedales_de_los_rios_cruces_y_chorocomayo_en_la_ciudad_de_Valdivia%2C_Chile_02.jpg'
      )
    ON CONFLICT (slug) DO UPDATE SET
      name        = EXCLUDED.name,
      type        = EXCLUDED.type,
      region_name = EXCLUDED.region_name,
      centroid    = EXCLUDED.centroid,
      description = EXCLUDED.description,
      photo_url   = EXCLUDED.photo_url
  `
  console.log('✓ 3 santuarios insertados correctamente')
} catch (err) {
  console.error('Error:', err.message)
  process.exit(1)
} finally {
  await sql.end()
}
