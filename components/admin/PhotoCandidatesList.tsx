'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, Star } from 'lucide-react'
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
  const [approvedId, setApprovedId] = useState<string | null>(null)

  async function approve(id: string) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/photos/${id}/approve`, { method: 'POST' })
      if (res.ok) {
        setApprovedId(id)
        setTimeout(() => {
          setCandidates((prev) => prev.filter((c) => c.id !== id))
          setApprovedId(null)
        }, 1000)
      }
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {candidates.map((c) => {
        const isApproved = approvedId === c.id
        const isBusy = loadingId === c.id

        return (
          <div
            key={c.id}
            className={`rounded-2xl border bg-white overflow-hidden transition-all ${
              isApproved ? 'border-teal-300 bg-teal-50' : 'border-stone-200'
            }`}
          >
            <div className="relative aspect-square overflow-hidden bg-stone-100">
              <img
                src={c.url}
                alt={c.speciesCommonName}
                className="w-full h-full object-cover"
              />
              {c.favoritesCount > 0 && (
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {c.favoritesCount}
                </div>
              )}
            </div>
            <div className="p-3">
              <Link href={`/especies/${c.speciesSlug}`} className="hover:text-teal-600 transition-colors">
                <p className="font-medium text-stone-800 text-sm truncate">{c.speciesCommonName}</p>
                <p className="text-xs italic text-stone-400 truncate">{c.speciesScientificName}</p>
              </Link>
              <p className="text-xs text-stone-400 mt-1">por {c.userName}</p>
              <button
                onClick={() => approve(c.id)}
                disabled={isBusy || isApproved}
                className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-60 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                {isBusy
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : isApproved
                    ? <><CheckCircle className="h-3.5 w-3.5" />Aprobada</>
                    : 'Aprobar como foto de especie'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
