'use client'

import { useState } from 'react'
import { FileText, CheckCircle } from 'lucide-react'
import { ConservationBadge } from '@/components/species/ConservationBadge'
import type { UICNStatus } from '@/lib/types'

interface Petition {
  id: string
  slug: string
  title: string
  description: string
  goal: number
  signedCount: number
  imageUrl: string | null
  endsAt: string | null
  hasSigned: boolean
  species: {
    slug: string
    commonName: string
    uicnStatus: string | null
    primaryPhoto: string | null
  } | null
  organization: {
    name: string
    slug: string
    logoUrl: string | null
  } | null
}

interface Props {
  petition: Petition
  isLoggedIn: boolean
}

export function PetitionCard({ petition, isLoggedIn }: Props) {
  const [signedCount, setSignedCount] = useState(petition.signedCount)
  const [hasSigned, setHasSigned] = useState(petition.hasSigned)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const progress = petition.goal > 0
    ? Math.min((signedCount / petition.goal) * 100, 100)
    : 0

  async function handleSign() {
    if (!isLoggedIn) {
      setMessage('Inicia sesión para firmar esta petición')
      return
    }
    if (hasSigned || loading) return

    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/petitions/${petition.id}/sign`, { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        setSignedCount(data.signedCount)
        setHasSigned(true)
        setMessage('Gracias por tu firma.')
      } else if (res.status === 409) {
        setHasSigned(true)
        setMessage('Ya habías firmado esta petición')
      } else if (res.status === 401) {
        setMessage('Inicia sesión para firmar esta petición')
      } else {
        setMessage('Error al procesar tu firma. Intenta nuevamente.')
      }
    } catch {
      setMessage('Error de red. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden min-h-48 transition-transform duration-200 hover:scale-[1.01]">
      {/* Imagen izquierda — 40% */}
      <div className="relative w-2/5 flex-shrink-0">
        {petition.imageUrl ? (
          <img
            src={petition.imageUrl}
            alt={petition.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <FileText className="h-12 w-12 text-zinc-600" />
          </div>
        )}
        {petition.species?.uicnStatus && (
          <div className="absolute top-3 left-3">
            <ConservationBadge
              status={petition.species.uicnStatus as UICNStatus}
              size="sm"
              showLabel
            />
          </div>
        )}
      </div>

      {/* Contenido derecha — 60% */}
      <div className="p-4 flex flex-col flex-1 min-w-0">
        <h3 className="font-grotesk font-semibold text-white leading-snug mb-2 text-sm">
          {petition.title}
        </h3>

        <p className="text-xs text-zinc-400 line-clamp-3 mb-3 flex-1 leading-relaxed">
          {petition.description}
        </p>

        {/* Barra de progreso */}
        <div className="mb-3">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-base font-bold text-white font-grotesk">
              {signedCount.toLocaleString('es-CL')}
            </span>
            <span className="text-[10px] text-zinc-500">
              / {petition.goal.toLocaleString('es-CL')}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-[#00E676] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {petition.organization && (
          <p className="text-[10px] text-zinc-500 mb-3 truncate">
            Dirigida a: {petition.organization.name}
          </p>
        )}

        <button
          onClick={handleSign}
          disabled={hasSigned || loading}
          className={`
            w-full py-2 px-3 rounded-xl font-medium text-xs transition-all
            ${hasSigned
              ? 'bg-zinc-800 text-zinc-500 cursor-default'
              : loading
                ? 'bg-zinc-800 text-zinc-500 cursor-wait'
                : 'bg-[#00E676] hover:bg-[#52F599] text-black cursor-pointer'
            }
          `}
        >
          {hasSigned
            ? <span className="flex items-center justify-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" /> Ya firmaste</span>
            : loading ? 'Firmando...' : 'Firmar petición'}
        </button>

        {message && (
          <p className={`text-[10px] mt-1.5 text-center ${
            message.startsWith('Gracias') ? 'text-[#00E676]' : 'text-zinc-500'
          }`}>
            {message}
            {message.includes('sesión') && (
              <a href="/login" className="ml-1 text-[#00E676] underline">Ingresar</a>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
