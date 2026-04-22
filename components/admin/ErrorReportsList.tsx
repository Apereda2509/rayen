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
      <div className="rounded-2xl border border-stone-200 bg-white py-16 text-center text-stone-400">
        <CheckCircle className="h-10 w-10 mx-auto mb-3 text-stone-200" />
        <p className="font-medium">No hay reportes de errores</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div key={r.id} className={cn(
          'rounded-2xl border bg-white p-4 transition-all',
          r.resolved ? 'border-stone-100 opacity-60' : 'border-stone-200'
        )}>
          <div className="flex items-start gap-3">
            <div className={cn(
              'mt-0.5 flex-shrink-0 rounded-full p-1.5',
              r.resolved ? 'bg-stone-100 text-stone-400' : 'bg-red-50 text-red-500'
            )}>
              {r.resolved
                ? <CheckCircle className="h-3.5 w-3.5" />
                : <AlertCircle className="h-3.5 w-3.5" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-1.5">
                <span className="text-xs text-stone-400">
                  {new Date(r.createdAt).toLocaleString('es-CL', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                {r.userEmail && (
                  <span className="text-xs font-medium text-stone-600">{r.userEmail}</span>
                )}
                {r.resolved && (
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-600">
                    Resuelto
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{r.message}</p>
            </div>

            {!r.resolved && (
              <button
                onClick={() => resolve(r.id)}
                disabled={loadingId === r.id}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-60 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                {loadingId === r.id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <CheckCircle className="h-3.5 w-3.5" />}
                Resuelto
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
