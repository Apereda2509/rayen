'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'

interface Termino {
  id: string
  termino: string
  definicion: string
  nivel: string
}

interface Props {
  terminos: Termino[]
}

export function GlosarioBuscador({ terminos }: Props) {
  const [query, setQuery] = useState('')

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return terminos
    return terminos.filter(
      (t) =>
        t.termino.toLowerCase().includes(q) ||
        t.definicion.toLowerCase().includes(q)
    )
  }, [query, terminos])

  // Agrupar por letra inicial
  const porLetra = useMemo(() => {
    const grupos: Record<string, Termino[]> = {}
    for (const t of filtrados) {
      const letra = t.termino.charAt(0).toUpperCase()
      if (!grupos[letra]) grupos[letra] = []
      grupos[letra].push(t)
    }
    return grupos
  }, [filtrados])

  const letras = Object.keys(porLetra).sort()

  return (
    <div>
      {/* Buscador */}
      <div className="relative max-w-md mb-10">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar un término…"
          className="w-full rounded-lg bg-zinc-900 border border-zinc-700 text-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#00E676] transition-colors placeholder:text-zinc-600"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="text-zinc-500 text-sm py-8 text-center">
          No se encontraron términos para &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="space-y-10">
          {letras.map((letra) => (
            <div key={letra}>
              <p className="text-zinc-600 text-sm uppercase tracking-wider font-medium mb-4 pb-2 border-b border-zinc-800">
                {letra}
              </p>
              <div className="space-y-6">
                {porLetra[letra].map((t) => (
                  <div key={t.id}>
                    <p className="font-grotesk font-semibold text-white mb-1">
                      {t.termino}
                      {t.nivel === 'avanzado' && (
                        <span className="ml-2 text-[10px] font-medium text-zinc-600 uppercase tracking-wide">
                          avanzado
                        </span>
                      )}
                    </p>
                    <p className="text-zinc-300 text-sm leading-relaxed">{t.definicion}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
