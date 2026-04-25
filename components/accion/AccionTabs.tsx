'use client'

import { useState, useRef } from 'react'
import { FileSignature, Building2, Scale, Megaphone } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { PetitionCard } from './PetitionCard'
import { OrganizationCard } from './OrganizationCard'
import { LegalSection } from './LegalSection'
import { ActionGuides } from './ActionGuides'

const ORG_TYPE_OPTIONS = [
  { value: '',             label: 'Todos' },
  { value: 'ong',         label: 'ONG' },
  { value: 'fundacion',   label: 'Fundación' },
  { value: 'universidad', label: 'Universidad' },
  { value: 'gobierno',    label: 'Gobierno' },
]

const TABS = [
  { id: 'peticiones',     label: 'Peticiones',      icon: FileSignature },
  { id: 'organizaciones', label: 'Organizaciones',  icon: Building2 },
  { id: 'legal',          label: 'Marco legal',     icon: Scale },
  { id: 'guias',          label: 'Guías de acción', icon: Megaphone },
]

type TabId = 'peticiones' | 'organizaciones' | 'legal' | 'guias'

interface Props {
  petitions: any[]
  organizations: any[]
  laws: any[]
  isLoggedIn: boolean
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export function AccionTabs({ petitions, organizations, laws, isLoggedIn }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('peticiones')
  const [orgTypeFilter, setOrgTypeFilter] = useState('')

  const filteredOrgs = orgTypeFilter
    ? organizations.filter(o => o.type === orgTypeFilter)
    : organizations

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-8 border-b border-zinc-800 pb-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as TabId)}
            className={`
              inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl border-b-2 transition-colors
              ${activeTab === id
                ? 'text-[#00E676] border-[#00E676] bg-zinc-900'
                : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900/50'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Peticiones — cards con fadeInUp escalonado */}
      {activeTab === 'peticiones' && (
        <div>
          {petitions.length === 0 ? (
            <p className="text-zinc-500 text-center py-12">No hay peticiones activas en este momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {petitions.map((p, i) => (
                <PetitionCard key={p.id} petition={p} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Organizaciones */}
      {activeTab === 'organizaciones' && (
        <div>
          <SectionTitle>
            <div className="flex flex-wrap gap-2 mb-6">
              {ORG_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setOrgTypeFilter(opt.value)}
                  className={`
                    text-sm px-3 py-1.5 rounded-lg font-medium transition-colors
                    ${orgTypeFilter === opt.value
                      ? 'bg-[#00E676] text-black'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </SectionTitle>

          {filteredOrgs.length === 0 ? (
            <p className="text-zinc-500 text-center py-12">No hay organizaciones con ese filtro.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOrgs.map((org, i) => (
                <motion.div
                  key={org.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.07 }}
                >
                  <OrganizationCard org={org} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Marco Legal */}
      {activeTab === 'legal' && (
        <div>
          <SectionTitle>
            <h2
              className="text-2xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Marco legal de protección
            </h2>
          </SectionTitle>
          <LegalSection laws={laws} />
        </div>
      )}

      {/* Tab: Guías de acción */}
      {activeTab === 'guias' && (
        <div>
          <SectionTitle>
            <h2
              className="text-2xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Guías de acción
            </h2>
          </SectionTitle>
          <ActionGuides />
        </div>
      )}
    </div>
  )
}
