import { NextResponse } from 'next/server'
import { scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'
import { z } from 'zod'
import sql from '@/lib/db'

const scryptAsync = promisify(scrypt)

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const hash = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${hash.toString('hex')}`
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  try {
    // Agrega columna si no existe (idempotente)
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`

    const [existing] = await sql<{ id: string }[]>`
      SELECT id FROM users WHERE email = ${email}
    `
    if (existing) {
      return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')

    let username = base
    let attempt = 0
    while (true) {
      const candidate = attempt === 0 ? username : `${username}${attempt}`
      const [taken] = await sql<{ id: string }[]>`
        SELECT id FROM users WHERE username = ${candidate}
      `
      if (!taken) { username = candidate; break }
      attempt++
    }

    await sql`
      INSERT INTO users (email, name, username, password_hash, last_seen)
      VALUES (${email}, ${name}, ${username}, ${passwordHash}, NOW())
    `

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Error al registrar. Intenta de nuevo.' }, { status: 500 })
  }
}
