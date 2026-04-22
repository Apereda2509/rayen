import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('avatar') as File | null

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
  }
  if (file.size > 3 * 1024 * 1024) {
    return NextResponse.json({ error: 'La imagen no puede superar 3 MB' }, { status: 400 })
  }
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Usa JPG, PNG o WebP' }, { status: 400 })
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary no configurado' }, { status: 503 })
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const folder = 'rayen/avatars'
  const toSign = `folder=${folder}&timestamp=${timestamp}`
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
    return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 })
  }

  const { secure_url } = (await uploadRes.json()) as { secure_url: string }

  await sql`UPDATE users SET avatar_url = ${secure_url} WHERE email = ${session.user.email}`

  return NextResponse.json({ avatarUrl: secure_url })
}
