'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ErrorReport {
  id: string
  userEmail: string | null
  message: string
  resolved: boolean
  createdAt: string
}

interface Props { initialReports: ErrorReport[] }

export function ErrorReportsList({ initialReports }: Props) {
  const [reports, setReports] = useState(initialReports)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function resolve(id: string) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/errors/${id}/resolve`, { method: 'POST' })
      if (res.ok) {
        setReports((prev) => prev.map((r) => r.id === id ? { ...r, resolved: true } : r))
      }
    } finally {
      setLoadingId(null)
    }
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-16 text-center text-zinc-500">
        <CheckCircle className="h-10 w-10 mx-auto mb-3 text-zinc-700" />
        <p className="font-medium">No hay reportes de errores</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div key={r.id} className={cn(
          'rounded-2xl border bg-zinc-900 p-4 transition-all',
          r.resolved ? 'border-zinc-800 opacity-60' : 'border-zinc-800'
        )}>
          <div className="flex items-start gap-3">
            <div className={cn(
              'mt-0.5 flex-shrink-0 rounded-full p-1.5',
              r.resolved ? 'bg-zinc-800 text-zinc-500' : 'bg-red-500/10 text-red-400'
            )}>
              {r.resolved
                ? <CheckCircle className="h-3.5 w-3.5" />
                : <AlertCircle className="h-3.5 w-3.5" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-1.5">
                <span className="text-xs text-zinc-500">
                  {new Date(r.createdAt).toLocaleString('es-CL', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                {r.userEmail && (
                  <span className="text-xs font-medium text-zinc-300">{r.userEmail}</span>
                )}
                {r.resolved && (
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-[#00E676]">
                    Resuelto
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{r.message}</p>
            </div>

            {!r.resolved && (
              <button
                onClick={() => resolve(r.id)}
                disabled={loadingId === r.id}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-600 disabled:opacity-60 px-4 py-2 text-sm text-white transition-colors"
              >
                {loadingId === r.id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <CheckCircle className="h-3.5 w-3.5" />}
                Resolver
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
