'use client'

import { useState } from 'react'
import { Globe, Mail } from 'lucide-react'

const ORG_TYPE_LABELS: Record<string, string> = {
  ong:           'ONG',
  fundacion:     'Fundación',
  universidad:   'Universidad',
  gobierno:      'Gobierno',
  empresa_b:     'Empresa B',
  activismo:     'Activismo',
  investigacion: 'Investigación',
}

interface Organization {
  id: string
  slug: string | null
  name: string
  type: string
  description: string | null
  website: string | null
  email: string | null
  phone: string | null
  logoUrl: string | null
  national: boolean
  regionName: string | null
}

interface Props {
  org: Organization
}

function OrgInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(w => w.length > 2)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="h-16 w-16 rounded-full bg-zinc-800 border border-zinc-700 flex-shrink-0 flex items-center justify-center font-grotesk font-bold text-[#00E676] text-lg">
      {initials || name.slice(0, 2).toUpperCase()}
    </div>
  )
}

export function OrganizationCard({ org }: Props) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-all flex flex-col gap-4">
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        {org.logoUrl && !imgError ? (
          <img
            src={org.logoUrl}
            alt={org.name}
            className="h-16 w-16 rounded-full object-contain bg-zinc-800 border border-zinc-700 flex-shrink-0 p-1.5"
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <OrgInitials name={org.name} />
        )}
        <div className="min-w-0">
          <h3 className="font-grotesk font-semibold text-white text-sm leading-tight">
            {org.name}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {ORG_TYPE_LABELS[org.type] ?? org.type}
            </span>
            {org.national && (
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-500">
                Nacional
              </span>
            )}
            {org.regionName && !org.national && (
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 truncate">
                {org.regionName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Descripción */}
      {org.description && (
        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed flex-1">
          {org.description}
        </p>
      )}

      {/* Links */}
      <div className="flex gap-4 mt-auto pt-1">
        {org.website && (
          <a
            href={org.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-[#00E676] transition-colors"
            aria-label="Sitio web"
          >
            <Globe className="h-4 w-4" />
          </a>
        )}
        {org.email && (
          <a
            href={`mailto:${org.email}`}
            className="text-zinc-500 hover:text-[#00E676] transition-colors"
            aria-label="Email"
          >
            <Mail className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  )
}
