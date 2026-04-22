import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await req.json()
  const { role, experienceLevel, regions, speciesGroups, skip } = body

  const onboardingData = skip
    ? null
    : { role, experienceLevel, regions: regions ?? [], speciesGroups: speciesGroups ?? [] }

  await sql`
    UPDATE users
    SET
      onboarding_completed = TRUE,
      onboarding_data = ${onboardingData ? JSON.stringify(onboardingData) : null}
    WHERE email = ${session.user.email}
  `

  return NextResponse.json({ ok: true })
}
