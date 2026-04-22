import { NextResponse } from 'next/server'
import sql from '@/lib/db'

const ADMIN_EMAIL = 'angelperedajimenez@gmail.com'

export async function POST(req: Request) {
  const { message, userEmail } = await req.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 })
  }

  // Guardar en BD (tabla creada si no existe)
  await sql`
    CREATE TABLE IF NOT EXISTS error_reports (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_email TEXT,
      message    TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    INSERT INTO error_reports (user_email, message)
    VALUES (${userEmail ?? null}, ${message.trim()})
  `

  // Intentar enviar email si hay credenciales SMTP configuradas
  const smtpUrl = process.env.SMTP_URL
  if (smtpUrl) {
    try {
      // nodemailer-style con fetch a Resend / Mailgun si está configurado
      // Se deja como extensión futura; el reporte siempre queda en BD
    } catch { /* no bloquear */ }
  }

  return NextResponse.json({ ok: true })
}
