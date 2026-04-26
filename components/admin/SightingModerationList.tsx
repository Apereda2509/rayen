'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2, MapPin, Calendar, User } from 'lucide-react'

export interface PendingSighting {
  id: string
  observedAt: string
  photoUrl: string | null
  notes: string | null
  lat: number
  lng: number
  commonName: string
  scientificName: string
  speciesSlug: string
  userName: string | null
  userEmail: string | null
  userAvatar: string | null
  createdAt: string
}

interface Props {
  initialSightings: PendingSighting[]
}

export function SightingModerationList({ initialSightings }: Props) {
  const [sightings, setSightings] = useState(initialSightings)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ id: string; type: 'approved' | 'rejected' } | null>(null)

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/sightings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        setFeedback({ id, type: action === 'approve' ? 'approved' : 'rejected' })
        setTimeout(() => {
          setSightings((prev) => prev.filter((s) => s.id !== id))
          setFeedback(null)
        }, 900)
      }
    } finally {
      setLoadingId(null)
    }
  }

  if (sightings.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
        <p className="text-lg font-medium">No hay avistamientos pendientes</p>
        <p className="text-sm mt-1">Todo está al día.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sightings.map((s) => {
        const isBusy = loadingId === s.id
        const done = feedback?.id === s.id

        return (
          <div
            key={s.id}
            className={`rounded-2xl border bg-zinc-900 overflow-hidden transition-all ${
              done
                ? feedback?.type === 'approved'
                  ? 'border-[#00E676]/20 bg-zinc-900'
                  : 'border-red-500/20 opacity-60'
                : 'border-zinc-800'
            }`}
          >
            <div className="flex gap-4 p-4">
              {/* Foto */}
              <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-800">
                {s.photoUrl ? (
                  <img
                    src={s.photoUrl}
                    alt="Foto del avistamiento"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-zinc-600">
                    📷
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{s.commonName}</p>
                <p className="text-xs italic text-zinc-500 mb-2">{s.scientificName}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(s.observedAt).toLocaleDateString('es-CL', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {s.userName ?? s.userEmail ?? 'Anónimo'}
                  </span>
                </div>

                {s.notes && (
                  <p className="mt-2 text-xs text-zinc-500 line-clamp-2 italic">"{s.notes}"</p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => handleAction(s.id, 'approve')}
                  disabled={isBusy}
                  className="flex items-center gap-1.5 rounded-xl bg-[#00E676] hover:opacity-90 disabled:opacity-50 px-4 py-2 text-sm font-medium text-black transition-colors"
                >
                  {isBusy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5" />
                  )}
                  Aprobar
                </button>
                <button
                  onClick={() => handleAction(s.id, 'reject')}
                  disabled={isBusy}
                  className="flex items-center gap-1.5 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-600 disabled:opacity-50 px-4 py-2 text-sm text-white transition-colors"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
