import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function POST(req: Request) {
  // Auth
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Debes iniciar sesión para reportar un avistamiento.' }, { status: 401 })
  }

  const formData = await req.formData()
  const speciesSlug        = formData.get('speciesSlug')        as string | null
  const speciesNameFree    = formData.get('speciesNameFree')    as string | null
  const observedAt         = formData.get('observedAt')         as string | null
  const latRaw             = formData.get('lat')                as string | null
  const lngRaw             = formData.get('lng')                as string | null
  const notes              = formData.get('notes')              as string | null
  const photo              = formData.get('photo')              as File | null
  const isSpeciesCandidate = formData.get('isSpeciesCandidate') === 'true'

  // Validation
  if ((!speciesSlug && !speciesNameFree) || !observedAt || !latRaw || !lngRaw) {
    return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 })
  }

  const lat = parseFloat(latRaw)
  const lng = parseFloat(lngRaw)
  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Coordenadas inválidas.' }, { status: 400 })
  }

  // No admitir fechas futuras
  if (new Date(observedAt) > new Date()) {
    return NextResponse.json({ error: 'La fecha no puede ser futura.' }, { status: 400 })
  }

  // Resolve species id by slug (optional — puede ser texto libre)
  let speciesId: string | null = null
  if (speciesSlug) {
    const [species] = await sql<{ id: string }[]>`
      SELECT id FROM species WHERE slug = ${speciesSlug} AND published = TRUE
    `
    if (!species) {
      return NextResponse.json({ error: 'Especie no encontrada.' }, { status: 404 })
    }
    speciesId = species.id
  }

  // Resolve DB user id by email
  const [dbUser] = await sql<{ id: string }[]>`
    SELECT id FROM users WHERE email = ${session.user.email}
  `
  if (!dbUser) {
    return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 })
  }

  // Upload photo to Cloudinary (optional)
  let photoUrl: string | null = null
  if (photo && photo.size > 0) {
    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'La foto no puede superar 5 MB.' }, { status: 400 })
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(photo.type)) {
      return NextResponse.json({ error: 'Formato de foto no válido. Usa JPG, PNG o WebP.' }, { status: 400 })
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey    = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (cloudName && apiKey && apiSecret) {
      const timestamp = Math.floor(Date.now() / 1000)
      const folder    = 'rayen/sightings'

      // Signed upload
      const toSign = `folder=${folder}&timestamp=${timestamp}`
      const signature = crypto.createHash('sha1').update(toSign + apiSecret).digest('hex')

      const cloudForm = new FormData()
      const bytes = await photo.arrayBuffer()
      cloudForm.append('file', new Blob([bytes], { type: photo.type }), photo.name)
      cloudForm.append('timestamp', String(timestamp))
      cloudForm.append('api_key', apiKey)
      cloudForm.append('signature', signature)
      cloudForm.append('folder', folder)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: cloudForm }
      )

      if (uploadRes.ok) {
        const uploadData = (await uploadRes.json()) as { secure_url: string }
        photoUrl = uploadData.secure_url
      }
      // If upload fails we continue without photo — no fatal error
    }
  }

  // Determine region code from coordinates (approx bounding box of Chile)
  // Stored directly in sightings.region_code if available; we leave it null for now
  // (full reverse geocoding can be added later via PostGIS)

  const [sighting] = await sql`
    INSERT INTO sightings (species_id, species_name_free, user_id, location, observed_at, photo_url, notes)
    VALUES (
      ${speciesId},
      ${speciesNameFree ?? null},
      ${dbUser.id},
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
      ${observedAt},
      ${photoUrl},
      ${notes ?? null}
    )
    RETURNING id, observed_at AS "observedAt", verified
  `

  // Registrar foto en tabla photos si se subió (solo si hay species_id)
  if (photoUrl && speciesId) {
    await sql`
      INSERT INTO photos (user_id, species_id, sighting_id, url, is_species_candidate)
      VALUES (${dbUser.id}, ${speciesId}, ${sighting.id}, ${photoUrl}, ${isSpeciesCandidate})
    `
  }

  return NextResponse.json({ sighting }, { status: 201 })
}
