'use client'

import { useState } from 'react'
import { FileSignature, Building2, Scale, Megaphone } from 'lucide-react'
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

      {/* Tab: Peticiones */}
      {activeTab === 'peticiones' && (
        <div>
          {petitions.length === 0 ? (
            <p className="text-zinc-500 text-center py-12">No hay peticiones activas en este momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {petitions.map(p => (
                <PetitionCard key={p.id} petition={p} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Organizaciones */}
      {activeTab === 'organizaciones' && (
        <div>
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

          {filteredOrgs.length === 0 ? (
            <p className="text-zinc-500 text-center py-12">No hay organizaciones con ese filtro.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOrgs.map(org => (
                <OrganizationCard key={org.id} org={org} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Marco Legal */}
      {activeTab === 'legal' && (
        <LegalSection laws={laws} />
      )}

      {/* Tab: Guías de acción */}
      {activeTab === 'guias' && (
        <ActionGuides />
      )}
    </div>
  )
}
