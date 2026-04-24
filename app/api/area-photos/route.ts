import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'
import crypto from 'crypto'

// GET /api/area-photos?areaSlug=...&page=1
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const areaSlug = searchParams.get('areaSlug')
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit    = 24
  const offset   = (page - 1) * limit

  const rows = await sql<{
    id: string
    url: string
    caption: string | null
    created_at: string
    area_id: string
    area_name: string
    area_slug: string
    user_name: string | null
    user_username: string | null
    user_avatar: string | null
  }[]>`
    SELECT
      ap.id,
      ap.url,
      ap.caption,
      ap.created_at,
      pa.id   AS area_id,
      pa.name AS area_name,
      pa.slug AS area_slug,
      u.name        AS user_name,
      u.username    AS user_username,
      u.avatar_url  AS user_avatar
    FROM area_photos ap
    JOIN protected_areas pa ON pa.id = ap.protected_area_id
    LEFT JOIN users u ON u.id = ap.user_id
    WHERE ap.approved = TRUE
      ${areaSlug ? sql`AND pa.slug = ${areaSlug}` : sql``}
    ORDER BY ap.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `

  const [{ total }] = await sql<{ total: number }[]>`
    SELECT COUNT(*)::int AS total
    FROM area_photos ap
    JOIN protected_areas pa ON pa.id = ap.protected_area_id
    WHERE ap.approved = TRUE
      ${areaSlug ? sql`AND pa.slug = ${areaSlug}` : sql``}
  `

  return NextResponse.json({ photos: rows, total, page, hasMore: offset + rows.length < total })
}

// POST /api/area-photos — sube foto de área
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'FormData inválido' }, { status: 400 })
  }

  const areaSlug = formData.get('areaSlug')?.toString()
  const caption  = formData.get('caption')?.toString() ?? null
  const file     = formData.get('photo') instanceof File ? (formData.get('photo') as File) : null

  if (!areaSlug) return NextResponse.json({ error: 'Área requerida' }, { status: 400 })
  if (!file)     return NextResponse.json({ error: 'Foto requerida' }, { status: 400 })

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'La foto no puede superar los 10 MB' }, { status: 400 })
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return NextResponse.json({ error: 'Formato no válido. Usa JPG, PNG o WebP' }, { status: 400 })
  }

  // Resolver área
  const [area] = await sql<{ id: string }[]>`SELECT id FROM protected_areas WHERE slug = ${areaSlug}`
  if (!area) return NextResponse.json({ error: 'Área no encontrada' }, { status: 404 })

  // Resolver usuario
  const [dbUser] = await sql<{ id: string }[]>`SELECT id FROM users WHERE email = ${session.user.email}`
  if (!dbUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  // Subir a Cloudinary
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary no configurado' }, { status: 500 })
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const folder    = 'rayen/area-photos'
  const toSign    = `folder=${folder}&timestamp=${timestamp}`
  const signature = crypto.createHash('sha1').update(toSign + apiSecret).digest('hex')

  const cloudForm = new FormData()
  const bytes = await file.arrayBuffer()
  cloudForm.append('file', new Blob([bytes], { type: file.type }), file.name)
  cloudForm.append('timestamp', String(timestamp))
  cloudForm.append('api_key', apiKey)
  cloudForm.append('signature', signature)
  cloudForm.append('folder', folder)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: cloudForm }
  )

  if (!uploadRes.ok) {
    const err = await uploadRes.text()
    console.error('[area-photos] Cloudinary error:', err)
    return NextResponse.json({ error: 'Error al subir la foto' }, { status: 502 })
  }

  const { secure_url: url } = await uploadRes.json() as { secure_url: string }

  // Insertar en BD con approved: false (pendiente de revisión)
  const [inserted] = await sql<{ id: string }[]>`
    INSERT INTO area_photos (user_id, protected_area_id, url, caption, approved)
    VALUES (${dbUser.id}, ${area.id}, ${url}, ${caption}, FALSE)
    RETURNING id
  `

  return NextResponse.json({ id: inserted.id }, { status: 201 })
}
