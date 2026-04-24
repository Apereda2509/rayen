import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import sql from '@/lib/db'
import { Users, Eye, Camera, AlertCircle } from 'lucide-react'

export const metadata = { title: 'Panel de administrador — Rayen' }

const ADMIN_EMAIL = 'angelperedajimenez@gmail.com'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) redirect('/login')

  // Asegurar columna resolved en error_reports
  await sql`ALTER TABLE error_reports ADD COLUMN IF NOT EXISTS resolved BOOLEAN NOT NULL DEFAULT FALSE`

  const [stats] = await sql<{
    total_users: number
    pending_sightings: number
    pending_photos: number
    unresolved_errors: number
  }[]>`
    SELECT
      (SELECT COUNT(*)::int FROM users)                                                               AS total_users,
      (SELECT COUNT(*)::int FROM sightings WHERE verified = FALSE)                                    AS pending_sightings,
      (SELECT COUNT(*)::int FROM photos WHERE is_species_candidate = TRUE AND candidate_approved = FALSE) AS pending_photos,
      (SELECT COUNT(*)::int FROM error_reports WHERE resolved = FALSE)                                AS unresolved_errors
  `

  const cards = [
    { label: 'Usuarios registrados', value: stats.total_users,       icon: Users,       href: '/admin/usuarios',      color: 'bg-blue-50 text-blue-600' },
    { label: 'Avistamientos pendientes', value: stats.pending_sightings, icon: Eye,     href: '/admin/avistamientos', color: 'bg-amber-50 text-amber-600' },
    { label: 'Fotos candidatas',      value: stats.pending_photos,    icon: Camera,      href: '/admin/fotos',         color: 'bg-purple-50 text-purple-600' },
    { label: 'Errores sin revisar',   value: stats.unresolved_errors, icon: AlertCircle, href: '/admin/errores',       color: 'bg-red-50 text-red-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-stone-200 bg-white p-5 hover:border-neon-400/40 hover:shadow-sm transition-all"
          >
            <div className={`inline-flex items-center justify-center rounded-xl p-2.5 mb-3 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-stone-900">{value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/admin/avistamientos', label: '→ Moderar avistamientos' },
            { href: '/admin/fotos',         label: '→ Aprobar fotos de especie' },
            { href: '/admin/errores',       label: '→ Revisar errores reportados' },
            { href: '/admin/usuarios',      label: '→ Ver todos los usuarios' },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="rounded-xl bg-stone-50 hover:bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 hover:text-neon-600 transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
