'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Eye, Camera, Users, AlertCircle, ShieldCheck, FileSignature,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/admin',              label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/admin/avistamientos', label: 'Avistamientos', icon: Eye },
  { href: '/admin/fotos',        label: 'Fotos',          icon: Camera },
  { href: '/admin/errores',      label: 'Errores',        icon: AlertCircle },
  { href: '/admin/usuarios',     label: 'Usuarios',       icon: Users },
  { href: '/admin/petitions',    label: 'Peticiones',     icon: FileSignature },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="w-48 flex-shrink-0">
      <div className="sticky top-20">
        <div className="flex items-center gap-2 mb-5 px-3">
          <ShieldCheck className="h-4 w-4 text-teal-600" />
          <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Admin</span>
        </div>
        <nav className="space-y-0.5">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                )}
              >
                <Icon className={cn('h-4 w-4', active ? 'text-teal-600' : 'text-stone-400')} />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
