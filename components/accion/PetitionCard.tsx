'use client'

import { useState } from 'react'
import Image from 'next/image'
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
        setMessage('¡Gracias por tu firma!')
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
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden hover:border-teal-300 hover:shadow-md transition-all flex flex-col">
      {/* Imagen */}
      <div className="relative h-44 bg-stone-100 flex-shrink-0">
        {petition.imageUrl ? (
          <img
            src={petition.imageUrl}
            alt={petition.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
        {petition.species?.uicnStatus && (
          <div className="absolute top-3 left-3">
            <ConservationBadge
              status={petition.species.uicnStatus as UICNStatus}
              size="sm"
              showLabel={true}
            />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Especie relacionada */}
        {petition.species && (
          <p className="text-xs text-teal-600 font-medium mb-1.5">
            Especie: {petition.species.commonName}
          </p>
        )}

        {/* Título */}
        <h3 className="font-semibold text-stone-900 leading-snug mb-2 text-base">
          {petition.title}
        </h3>

        {/* Descripción truncada */}
        <p className="text-sm text-stone-500 line-clamp-3 mb-4 flex-1">
          {petition.description}
        </p>

        {/* Progreso */}
        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-2xl font-bold text-stone-900">
              {signedCount.toLocaleString('es-CL')}
            </span>
            <span className="text-xs text-stone-400">
              de {petition.goal.toLocaleString('es-CL')} firmas
            </span>
          </div>
          <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {progress.toFixed(0)}% completado
          </p>
        </div>

        {/* Botón firmar */}
        <button
          onClick={handleSign}
          disabled={hasSigned || loading}
          className={`
            w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all
            ${hasSigned
              ? 'bg-emerald-50 text-emerald-700 cursor-default border border-emerald-200'
              : loading
                ? 'bg-teal-100 text-teal-500 cursor-wait'
                : 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
            }
          `}
        >
          {hasSigned ? '✓ Ya firmaste' : loading ? 'Firmando...' : 'Firmar petición'}
        </button>

        {/* Mensaje de feedback */}
        {message && (
          <p className={`text-xs mt-2 text-center ${
            message.startsWith('¡') ? 'text-emerald-600' : 'text-stone-500'
          }`}>
            {message}
            {message.includes('sesión') && (
              <a href="/login" className="ml-1 text-teal-600 underline">→ Ingresar</a>
            )}
          </p>
        )}

        {/* Fecha límite */}
        {petition.endsAt && (
          <p className="text-xs text-stone-400 text-center mt-2">
            Cierra: {new Date(petition.endsAt).toLocaleDateString('es-CL', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        )}
      </div>
    </div>
  )
}
