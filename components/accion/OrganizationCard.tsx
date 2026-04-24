import { Globe, Mail, Phone } from 'lucide-react'

const ORG_TYPE_LABELS: Record<string, string> = {
  ong:           'ONG',
  fundacion:     'Fundación',
  universidad:   'Universidad',
  gobierno:      'Gobierno',
  empresa_b:     'Empresa B',
  activismo:     'Activismo',
  investigacion: 'Investigación',
}

const ORG_TYPE_COLORS: Record<string, string> = {
  ong:           'bg-stone-100 text-stone-700',
  fundacion:     'bg-violet-50 text-violet-700',
  universidad:   'bg-blue-50  text-blue-700',
  gobierno:      'bg-amber-50 text-amber-700',
  empresa_b:     'bg-stone-100 text-stone-700',
  activismo:     'bg-red-50   text-red-700',
  investigacion: 'bg-indigo-50 text-indigo-700',
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

export function OrganizationCard({ org }: Props) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 hover:border-neon-400/40 hover:shadow-sm transition-all flex flex-col gap-3">
      {/* Cabecera */}
      <div className="flex items-start gap-3">
        {org.logoUrl ? (
          <img
            src={org.logoUrl}
            alt={org.name}
            className="h-12 w-12 rounded-xl object-contain bg-stone-50 border border-stone-100 flex-shrink-0 p-1"
          />
        ) : (
          <div className="h-12 w-12 rounded-xl bg-stone-100 border border-stone-200 flex-shrink-0 flex items-center justify-center text-stone-600 font-bold text-lg">
            {org.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-stone-900 text-sm leading-tight line-clamp-2">
            {org.name}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${ORG_TYPE_COLORS[org.type] ?? 'bg-stone-100 text-stone-600'}`}>
              {ORG_TYPE_LABELS[org.type] ?? org.type}
            </span>
            {org.national && (
              <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-500">
                Nacional
              </span>
            )}
            {org.regionName && !org.national && (
              <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-500 truncate">
                {org.regionName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Descripción */}
      {org.description && (
        <p className="text-sm text-stone-500 line-clamp-3 leading-relaxed">
          {org.description}
        </p>
      )}

      {/* Contacto */}
      <div className="flex flex-wrap gap-2 mt-auto pt-1">
        {org.website && (
          <a
            href={org.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            Sitio web
          </a>
        )}
        {org.email && (
          <a
            href={`mailto:${org.email}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </a>
        )}
        {org.phone && (
          <a
            href={`tel:${org.phone}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            {org.phone}
          </a>
        )}
      </div>
    </div>
  )
}
