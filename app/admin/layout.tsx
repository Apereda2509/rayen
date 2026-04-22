import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminNav } from '@/components/admin/AdminNav'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'angelperedajimenez@gmail.com'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user?.email) redirect('/login?callbackUrl=/admin')

  if (session.user.email !== ADMIN_EMAIL) {
    return (
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🚫</p>
        <h1 className="text-xl font-bold text-stone-800 mb-2">Acceso restringido</h1>
        <p className="text-stone-500 text-sm">No tienes permiso para acceder a esta sección.</p>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-6">
          <AdminNav />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
