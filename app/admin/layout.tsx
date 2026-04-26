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
      <main className="max-w-lg mx-auto px-4 py-20 text-center bg-[#0A0A0A] min-h-screen">
        <p className="text-4xl mb-4">🚫</p>
        <h1 className="text-xl font-bold text-white mb-2">Acceso restringido</h1>
        <p className="text-zinc-500 text-sm">No tienes permiso para acceder a esta sección.</p>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      <AdminNav />
      <main className="flex-1 min-w-0 p-8 bg-[#0A0A0A]">{children}</main>
    </div>
  )
}
