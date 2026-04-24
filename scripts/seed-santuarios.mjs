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
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Cerro_El_Plomo.jpg/1280px-Cerro_El_Plomo.jpg'
      ),
      (
        'Santuario de la Naturaleza Laguna El Peral',
        'santuario-laguna-el-peral',
        'santuario_naturaleza',
        'Valparaíso',
        ST_SetSRID(ST_MakePoint(-71.61, -33.58), 4326),
        'Humedal costero ubicado en El Quisco. Refugio de aves acuáticas migratorias y residentes, incluyendo especies amenazadas.',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Laguna_el_peral.jpg/1280px-Laguna_el_peral.jpg'
      ),
      (
        'Santuario de la Naturaleza Carlos Anwandter',
        'santuario-carlos-anwandter',
        'santuario_naturaleza',
        'Los Ríos',
        ST_SetSRID(ST_MakePoint(-73.14, -39.77), 4326),
        'Humedal del río Cruces, cerca de Valdivia. Sitio Ramsar y hábitat crítico para el cisne de cuello negro y otras aves acuáticas.',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Cisnes_de_cuello_negro_en_el_r%C3%ADo_Cruces.jpg/1280px-Cisnes_de_cuello_negro_en_el_r%C3%ADo_Cruces.jpg'
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
