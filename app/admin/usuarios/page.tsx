import Image from 'next/image'
import sql from '@/lib/db'
import { User, CheckCircle, Clock } from 'lucide-react'

export const metadata = { title: 'Usuarios — Admin Rayen' }

export default async function AdminUsuariosPage() {
  const users = await sql<{
    id: string; name: string; email: string; avatar_url: string | null
    username: string | null; role: string; onboarding_completed: boolean
    created_at: string; sightings_count: number
  }[]>`
    SELECT
      u.id, u.name, u.email, u.avatar_url, u.username,
      u.role::text, u.onboarding_completed, u.created_at,
      COUNT(s.id)::int AS sightings_count
    FROM users u
    LEFT JOIN sightings s ON s.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-stone-900">Usuarios registrados</h1>
        <p className="text-sm text-stone-500 mt-0.5">{users.length} usuarios en total</p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Avistamientos</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider hidden md:table-cell">Onboarding</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider hidden lg:table-cell">Registrado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-stone-100">
                      {u.avatar_url ? (
                        <Image src={u.avatar_url} alt={u.name} width={32} height={32} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-4 w-4 text-stone-300" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-stone-800 leading-tight">{u.name}</p>
                      {u.username && <p className="text-xs text-stone-400">@{u.username}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-stone-500 text-xs">{u.email}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-semibold text-stone-700">{u.sightings_count}</span>
                </td>
                <td className="px-4 py-3 text-center hidden md:table-cell">
                  {u.onboarding_completed ? (
                    <CheckCircle className="h-4 w-4 text-teal-500 mx-auto" />
                  ) : (
                    <Clock className="h-4 w-4 text-stone-300 mx-auto" />
                  )}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs text-stone-400">
                    {new Date(u.created_at).toLocaleDateString('es-CL', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
