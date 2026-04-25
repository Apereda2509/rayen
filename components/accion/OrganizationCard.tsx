'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const ORG_TYPE_LABELS: Record<string, string> = {
  ong:           'ONG',
  fundacion:     'Fundación',
  universidad:   'Universidad',
  gobierno:      'Gobierno',
  empresa_b:     'Empresa B',
  activismo:     'Activismo',
  investigacion: 'Investigación',
}

const orgMeta: Record<string, { foco: string; zona: string }> = {
  'aves-chile':                   { foco: 'Aves nativas',                    zona: 'Todo Chile' },
  'centro-conservacion-cetaceos': { foco: 'Cetáceos y mamíferos marinos',    zona: 'Zona costera' },
  'codeff':                       { foco: 'Fauna y flora silvestre',          zona: 'Todo Chile' },
  'conaf':                        { foco: 'Áreas silvestres protegidas',      zona: 'Todo Chile' },
  'fundacion-bosque-nativo':      { foco: 'Bosque nativo',                   zona: 'Zona sur' },
  'ieb':                          { foco: 'Investigación en biodiversidad',   zona: 'Todo Chile' },
  'ministerio-medio-ambiente':    { foco: 'Política ambiental',              zona: 'Todo Chile' },
  'ong-ballena-azul':             { foco: 'Cetáceos y mamíferos marinos',    zona: 'Zona costera' },
  'red-observadores-aves':        { foco: 'Observación de aves',             zona: 'Todo Chile' },
  'sbap':                         { foco: 'Áreas protegidas',                zona: 'Todo Chile' },
  'universidad-austral':          { foco: 'Investigación ambiental',         zona: 'Zona sur' },
  'fundacion-rewilding-chile':    { foco: 'Rewilding y restauración',        zona: 'Patagonia' },
}

function LeafIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.5 1.5C10.5 1.5 6 1 3 4C1 6 1.5 9.5 1.5 9.5C1.5 9.5 5 10 7 8C10 5 10.5 1.5 10.5 1.5Z"
        fill="#00E676"
      />
      <path d="M1.5 9.5L4.5 6.5" stroke="#00E676" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 1C4.34 1 3 2.34 3 4C3 6.25 6 11 6 11C6 11 9 6.25 9 4C9 2.34 7.66 1 6 1Z"
        fill="#00E676"
      />
      <circle cx="6" cy="4" r="1.2" fill="#0A0A0A" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="7" cy="7" rx="2.5" ry="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 7h11" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="3" width="11" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 4l5.5 4 5.5-4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
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
  index: number
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
    <div className="h-16 w-16 rounded-xl bg-zinc-800 flex-shrink-0 flex items-center justify-center font-grotesk font-bold text-[#00E676] text-xl">
      {initials || name.slice(0, 2).toUpperCase()}
    </div>
  )
}

export function OrganizationCard({ org, index }: Props) {
  const [imgError, setImgError] = useState(false)
  const meta = (org.slug ? orgMeta[org.slug] : undefined) ?? { foco: 'Conservación ambiental', zona: 'Chile' }

  return (
    <div className="flex items-center gap-6 w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
      {/* Logo o iniciales */}
      {org.logoUrl && !imgError ? (
        <img
          src={org.logoUrl}
          alt={org.name}
          className="h-16 w-16 rounded-xl object-contain bg-zinc-800 p-1 flex-shrink-0"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <OrgInitials name={org.name} />
      )}

      {/* Contenido */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        {/* Fila 1 — Nombre + badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-grotesk font-semibold text-white text-base leading-tight">
            {org.name}
          </span>
          <span className="rounded-full px-2.5 py-0.5 text-xs bg-zinc-800 text-zinc-400">
            {ORG_TYPE_LABELS[org.type] ?? org.type}
          </span>
          {org.national && (
            <span className="rounded-full px-2.5 py-0.5 text-xs bg-zinc-800 text-zinc-400">
              Nacional
            </span>
          )}
        </div>

        {/* Fila 2 — Descripción */}
        {org.description && (
          <p className="text-zinc-400 text-sm line-clamp-2 font-inter">
            {org.description}
          </p>
        )}

        {/* Fila 3 — Chips foco + zona */}
        <motion.div
          className="flex gap-2 flex-wrap mt-0.5"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.07 + 0.2 }}
        >
          <span className="bg-zinc-800 rounded-full px-3 py-1 text-xs text-zinc-300 flex items-center gap-1.5">
            <LeafIcon />
            {meta.foco}
          </span>
          <span className="bg-zinc-800 rounded-full px-3 py-1 text-xs text-zinc-300 flex items-center gap-1.5">
            <PinIcon />
            {meta.zona}
          </span>
        </motion.div>

        {/* Fila 4 — Links */}
        {(org.website || org.email) && (
          <div className="flex gap-3 mt-1">
            {org.website && (
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-[#00E676] transition-colors text-xs flex items-center"
                aria-label="Sitio web"
              >
                <GlobeIcon />
              </a>
            )}
            {org.email && (
              <a
                href={`mailto:${org.email}`}
                className="text-zinc-500 hover:text-[#00E676] transition-colors text-xs flex items-center"
                aria-label="Email"
              >
                <MailIcon />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
