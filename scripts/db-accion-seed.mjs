#!/usr/bin/env node
// scripts/db-accion-seed.mjs
// Seed de organizaciones chilenas y peticiones para la sección Acción
// Uso desde raíz: node --env-file=.env.local scripts/db-accion-seed.mjs

import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no definida.')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, { prepare: false })

async function run() {
  console.log('🌱 Insertando datos sección Acción...\n')

  // ── 1. Actualizar slugs de organizaciones existentes ────────
  console.log('1/3 Actualizando slugs de organizaciones existentes...')
  const slugUpdates = [
    ['CONAF — Corporación Nacional Forestal', 'conaf'],
    ['Wildlife Conservation Society Chile', 'wcs-chile'],
    ['Instituto de Ecología y Biodiversidad (IEB)', 'ieb-chile'],
    ['Tompkins Conservation Chile', 'tompkins-conservation'],
    ['Oceana Chile', 'oceana-chile'],
    ['Aves Chile', 'aves-chile'],
    ['Fundación Bosque Nativo', 'fundacion-bosque-nativo'],
    ['Universidad Austral de Chile — IES', 'uach-ies'],
  ]
  for (const [name, slug] of slugUpdates) {
    await sql`UPDATE organizations SET slug = ${slug} WHERE name = ${name} AND slug IS NULL`
  }
  console.log('   ✓ slugs actualizados')

  // ── 2. Insertar nuevas organizaciones chilenas ──────────────
  console.log('2/3 Insertando nuevas organizaciones...')

  const newOrgs = [
    {
      slug: 'wwf-chile',
      name: 'WWF Chile',
      type: 'ong',
      website: 'https://wwf.cl',
      email: 'info@wwf.cl',
      description: 'Organización mundial de conservación con fuerte presencia en Chile. Trabaja en protección de ecosistemas patagónicos, glaciares y biodiversidad marina.',
      phone: null,
      logo_url: null,
      national: false,
    },
    {
      slug: 'rewilding-chile',
      name: 'Fundación Rewilding Chile',
      type: 'fundacion',
      website: 'https://rewildingchile.org',
      email: 'contacto@rewildingchile.org',
      description: 'Fundación dedicada a la restauración de ecosistemas en la Patagonia. Reintroduce fauna nativa y promueve la conectividad ecológica en paisajes degradados.',
      phone: null,
      logo_url: null,
      national: false,
    },
    {
      slug: 'codeff',
      name: 'CODEFF — Comité Nacional Pro Defensa de la Fauna y Flora',
      type: 'ong',
      website: 'https://codeff.cl',
      email: 'codeff@codeff.cl',
      description: 'Una de las organizaciones ambientales más antiguas de Chile. Fundada en 1968, trabaja en educación ambiental, defensa legal y monitoreo de fauna.',
      phone: null,
      logo_url: null,
      national: true,
    },
    {
      slug: 'ballena-azul',
      name: 'ONG Ballena Azul',
      type: 'ong',
      website: 'https://ballenaazul.org',
      email: 'contacto@ballenaazul.org',
      description: 'Organización chilena especializada en cetáceos y mamíferos marinos. Monitoreo de ballenas, delfines y marsopas en aguas chilenas.',
      phone: null,
      logo_url: null,
      national: true,
    },
    {
      slug: 'fundacion-pumalin',
      name: 'Fundación Pumalín',
      type: 'fundacion',
      website: 'https://fundacionpumalin.cl',
      email: null,
      description: 'Administra el Parque Pumalín Douglas Tompkins. Protección del bosque templado lluvioso de la Patagonia norte con el bosque de alerce más extenso del mundo.',
      phone: null,
      logo_url: null,
      national: false,
    },
    {
      slug: 'ccc-chile',
      name: 'Centro de Conservación Cetáceos (CCC)',
      type: 'ong',
      website: 'https://ccc-chile.org',
      email: 'ccc@ccc-chile.org',
      description: 'Investigación y conservación de cetáceos en Chile. Campaña activa contra el cautiverio de cetáceos y por la creación de áreas marinas protegidas.',
      phone: '+56 32 274 7800',
      logo_url: null,
      national: true,
    },
    {
      slug: 'red-observadores-aves',
      name: 'Red de Observadores de Aves (ROC)',
      type: 'ong',
      website: 'https://redobservadores.cl',
      email: 'contacto@redobservadores.cl',
      description: 'Comunidad chilena de observadores de aves. Registros ciudadanos, listados de aves de Chile y programas de ciencia ciudadana para monitoreo de avifauna.',
      phone: null,
      logo_url: null,
      national: true,
    },
  ]

  let inserted = 0
  for (const org of newOrgs) {
    const existing = await sql`SELECT id FROM organizations WHERE slug = ${org.slug}`
    if (existing.length > 0) {
      console.log(`   ⏭ ${org.name} ya existe`)
      continue
    }
    await sql`
      INSERT INTO organizations (slug, name, type, website, email, description, phone, logo_url, national, active)
      VALUES (
        ${org.slug}, ${org.name}, ${org.type}::org_type,
        ${org.website}, ${org.email ?? null}, ${org.description},
        ${org.phone ?? null}, ${org.logo_url ?? null},
        ${org.national}, TRUE
      )
    `
    inserted++
    console.log(`   ✓ ${org.name}`)
  }
  console.log(`   ${inserted} organizaciones insertadas`)

  // ── 3. Insertar peticiones ──────────────────────────────────
  console.log('\n3/3 Insertando peticiones...')

  const petitions = [
    {
      slug: 'protejamos-habitat-huemul-aysen',
      title: 'Protejamos el hábitat del huemul en Aysén',
      description: 'El huemul (Hippocamelus bisulcus), ciervo nativo emblema del escudo de Chile, enfrenta una crisis crítica con menos de 1.500 individuos. La expansión ganadera y la fragmentación del bosque andino-patagónico en Aysén amenazan sus últimos refugios. Pedimos al MMA y CONAF ampliar la zona de amortiguación en el entorno del Parque Nacional Cerro Castillo y restringir el pastoreo en corredores biológicos clave.',
      goal: 1000,
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Hippocamelus_bisulcus_-_Huemul.jpg/640px-Hippocamelus_bisulcus_-_Huemul.jpg',
      species_slug: 'huemul',
      ends_at: '2025-12-31',
    },
    {
      slug: 'detengamos-litio-salar-flamenco-andino',
      title: 'Detengamos la extracción de litio en los salares del flamenco andino',
      description: 'Los salares del norte de Chile son el hogar del flamenco andino (Phoenicoparrus andinus) y otras dos especies de flamencos amenazados. La creciente demanda de litio para baterías impulsa proyectos de extracción que drenan el agua subterránea de estos ecosistemas hipersalinos únicos. Exigimos una moratoria en nuevas concesiones de litio dentro de 10 km de bofedales y lagunas altiplánicas con colonias reproductoras de flamencos.',
      goal: 2000,
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Parina_Grande.jpg/640px-Parina_Grande.jpg',
      species_slug: 'flamenco-andino',
      ends_at: '2025-12-31',
    },
    {
      slug: 'salvemos-zorro-darwin-chiloe',
      title: 'Salvemos al zorro de Darwin en Chiloé',
      description: 'El zorro de Darwin (Lycalopex fulvipes) es uno de los cánidos más amenazados del mundo, con una población estimada de apenas 200 a 500 individuos, casi exclusivamente en la Isla de Chiloé. La urbanización, los perros domésticos asilvestrados y la fragmentación del bosque templado son sus principales amenazas. Pedimos al SAG un plan de manejo de perros domésticos en las áreas de distribución del zorro y la ampliación del Parque Nacional Chiloé.',
      goal: 500,
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Lycalopex_fulvipes_2.jpg/640px-Lycalopex_fulvipes_2.jpg',
      species_slug: 'zorro-de-darwin',
      ends_at: '2025-09-30',
    },
  ]

  for (const p of petitions) {
    const existing = await sql`SELECT id FROM petitions WHERE slug = ${p.slug}`
    if (existing.length > 0) {
      console.log(`   ⏭ "${p.title}" ya existe`)
      continue
    }

    // Buscar species_id por slug
    const [species] = await sql`SELECT id FROM species WHERE slug = ${p.species_slug}`
    const speciesId = species?.id ?? null

    await sql`
      INSERT INTO petitions (slug, title, description, goal, signed_count, image_url, species_id, active, ends_at)
      VALUES (
        ${p.slug}, ${p.title}, ${p.description},
        ${p.goal}, 0, ${p.image_url},
        ${speciesId}, TRUE, ${p.ends_at}::date
      )
    `
    console.log(`   ✓ "${p.title}"${speciesId ? '' : ' (especie no encontrada por slug)'}`)
  }

  console.log('\n✅ Seed completado.')
  await sql.end()
}

run().catch(err => {
  console.error('❌ Error en seed:', err.message ?? err)
  process.exit(1)
})
