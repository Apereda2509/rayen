'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2, Star } from 'lucide-react'
import Link from 'next/link'

export interface PhotoCandidate {
  id: string
  url: string
  favoritesCount: number
  createdAt: string
  speciesCommonName: string
  speciesScientificName: string
  speciesSlug: string
  userName: string
}

interface Props {
  initialCandidates: PhotoCandidate[]
}

export function PhotoCandidatesList({ initialCandidates }: Props) {
  const [candidates, setCandidates] = useState(initialCandidates)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [feedbackId, setFeedbackId] = useState<{ id: string; type: 'approved' | 'rejected' } | null>(null)

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setLoadingId(id)
    try {
      const url = action === 'approve'
        ? `/api/admin/photos/${id}/approve`
        : `/api/admin/photos/${id}/reject`
      const res = await fetch(url, { method: 'POST' })
      if (res.ok) {
        setFeedbackId({ id, type: action === 'approve' ? 'approved' : 'rejected' })
        setTimeout(() => {
          setCandidates((prev) => prev.filter((c) => c.id !== id))
          setFeedbackId(null)
        }, 900)
      }
    } finally {
      setLoadingId(null)
    }
  }

  if (candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-16 text-center text-zinc-500">
        <CheckCircle className="h-10 w-10 mx-auto mb-3 text-zinc-700" />
        <p className="font-medium">No hay fotos candidatas pendientes</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {candidates.map((c) => {
        const isBusy = loadingId === c.id
        const fb = feedbackId?.id === c.id ? feedbackId.type : null

        return (
          <div key={c.id} className={`rounded-2xl border bg-zinc-900 overflow-hidden transition-all ${
            fb === 'approved' ? 'border-[#00E676]/20'
            : fb === 'rejected' ? 'border-red-500/20 opacity-60'
            : 'border-zinc-800'
          }`}>
            <div className="relative aspect-square overflow-hidden bg-zinc-800">
              <img src={c.url} alt={c.speciesCommonName} className="w-full h-full object-cover" />
              {c.favoritesCount > 0 && (
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {c.favoritesCount}
                </div>
              )}
            </div>
            <div className="p-3">
              <Link href={`/especies/${c.speciesSlug}`} className="hover:text-[#00E676] transition-colors">
                <p className="font-medium text-white text-sm truncate">{c.speciesCommonName}</p>
                <p className="text-xs italic text-zinc-500 truncate">{c.speciesScientificName}</p>
              </Link>
              <p className="text-xs text-zinc-500 mt-1">por {c.userName}</p>
              <div className="flex gap-1.5 mt-3">
                <button
                  onClick={() => handleAction(c.id, 'approve')}
                  disabled={isBusy || !!fb}
                  className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-[#00E676] hover:opacity-90 disabled:opacity-60 py-1.5 text-xs font-medium text-black transition-colors"
                >
                  {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : fb === 'approved' ? <CheckCircle className="h-3.5 w-3.5" />
                    : null}
                  {fb === 'approved' ? 'Aprobada' : 'Aprobar'}
                </button>
                <button
                  onClick={() => handleAction(c.id, 'reject')}
                  disabled={isBusy || !!fb}
                  className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-600 disabled:opacity-60 py-1.5 text-xs font-medium text-white transition-colors"
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
