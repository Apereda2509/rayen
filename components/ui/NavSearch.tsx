'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X, Loader2 } from 'lucide-react'

interface SearchResult {
  slug: string
  commonName: string
  scientificName: string
  type: string
  primaryPhoto: string | null
}

export function NavSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cierra al hacer click fuera
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSearch()
      }
    }
    if (open) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  // Escape cierra
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSearch()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // Debounce de búsqueda
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/species?q=${encodeURIComponent(query)}`)
        const json = await res.json()
        setResults(json.data ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  function openSearch() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function closeSearch() {
    setOpen(false)
    setQuery('')
    setResults([])
    setSelected(-1)
  }

  function navigateTo(slug: string) {
    router.push(`/especies/${slug}`)
    closeSearch()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && selected >= 0) {
      e.preventDefault()
      navigateTo(results[selected].slug)
    }
  }

  const showDropdown = open && query.length >= 2

  return (
    <div ref={containerRef} className="relative">
      {!open ? (
        <button
          onClick={openSearch}
          aria-label="Buscar especie"
          className="flex items-center gap-1.5 rounded-full bg-teal-700 hover:bg-teal-600 px-3 py-1.5 text-sm text-emerald-100 transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Buscar especie</span>
        </button>
      ) : (
        <div className="flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-3 py-1 w-56 sm:w-72">
          <Search className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(-1) }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar especie…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-emerald-300/60 outline-none min-w-0"
            aria-label="Buscar especie"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
          />
          {loading
            ? <Loader2 className="h-3.5 w-3.5 shrink-0 text-emerald-300 animate-spin" />
            : <button onClick={closeSearch} aria-label="Cerrar búsqueda">
                <X className="h-3.5 w-3.5 shrink-0 text-emerald-300 hover:text-white transition-colors" />
              </button>
          }
        </div>
      )}

      {/* Dropdown de resultados */}
      {showDropdown && (
        <div
          role="listbox"
          className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden z-50"
        >
          {results.length === 0 && !loading && (
            <p className="px-4 py-3 text-sm text-stone-500">Sin resultados para &ldquo;{query}&rdquo;</p>
          )}
          {results.map((r, i) => (
            <button
              key={r.slug}
              role="option"
              aria-selected={i === selected}
              onClick={() => navigateTo(r.slug)}
              onMouseEnter={() => setSelected(i)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors ${
                i === selected ? 'bg-teal-50' : 'hover:bg-stone-50'
              }`}
            >
              {/* Miniatura */}
              <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center">
                {r.primaryPhoto ? (
                  <Image
                    src={r.primaryPhoto}
                    alt={r.commonName}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg select-none">{typeEmoji(r.type)}</span>
                )}
              </div>
              {/* Nombres */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">{r.commonName}</p>
                <p className="text-xs text-stone-500 italic truncate">{r.scientificName}</p>
              </div>
            </button>
          ))}
          {results.length > 0 && (
            <div className="border-t border-stone-100 px-3 py-2">
              <button
                onClick={() => { router.push(`/especies?query=${encodeURIComponent(query)}`); closeSearch() }}
                className="text-xs text-teal-700 hover:text-teal-900 font-medium"
              >
                Ver todos los resultados →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function typeEmoji(type: string) {
  const map: Record<string, string> = {
    ave: '🐦', mamifero: '🦊', planta: '🌿', anfibio: '🐸',
    reptil: '🦎', pez: '🐟', insecto: '🦋', hongo: '🍄',
  }
  return map[type] ?? '🌱'
}
