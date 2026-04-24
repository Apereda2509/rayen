'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Loader2, Search, ChevronDown, LogIn } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

interface FeedPhoto {
  id: string; url: string; license: string; favorites_count: number; created_at: string
  species_slug: string; species_common_name: string; species_scientific_name: string
  region_code: string | null; observed_at: string | null
  user_username: string | null; user_name: string; user_avatar: string | null
  viewer_favorited: boolean
}

interface SpeciesOption { slug: string; commonName: string; scientificName: string; type: string }

const REGION_NAMES: Record<string, string> = {
  XV: 'Arica y Parinacota', I: 'Tarapacá', II: 'Antofagasta', III: 'Atacama',
  IV: 'Coquimbo', V: 'Valparaíso', RM: 'Metropolitana', VI: "O'Higgins",
  VII: 'Maule', XVI: 'Ñuble', VIII: 'Biobío', IX: 'La Araucanía',
  XIV: 'Los Ríos', X: 'Los Lagos', XI: 'Aysén', XII: 'Magallanes',
}

export function ComunidadFeed() {
  const { data: session } = useSession()

  const [photos, setPhotos] = useState<FeedPhoto[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedSpecies, setSelectedSpecies] = useState<string>('')
  const [order, setOrder] = useState<'recent' | 'popular'>('recent')
  const [speciesSearch, setSpeciesSearch] = useState('')
  const [speciesList, setSpeciesList] = useState<SpeciesOption[]>([])
  const [speciesDropdownOpen, setSpeciesDropdownOpen] = useState(false)
  const [favoritedMap, setFavoritedMap] = useState<Record<string, boolean>>({})
  const [favCountMap, setFavCountMap] = useState<Record<string, number>>({})
  const [favLoading, setFavLoading] = useState<string | null>(null)
  const [loginPrompt, setLoginPrompt] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<FeedPhoto | null>(null)

  const fetchPhotos = useCallback(async (p: number, species: string, ord: string, append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), order: ord })
      if (species) params.set('species', species)
      const res = await fetch(`/api/comunidad?${params}`)
      const data = await res.json()
      const newPhotos: FeedPhoto[] = data.photos ?? []
      if (append) {
        setPhotos((prev) => [...prev, ...newPhotos])
      } else {
        setPhotos(newPhotos)
        // Init fav state from server
        const fm: Record<string, boolean> = {}
        const cm: Record<string, number> = {}
        newPhotos.forEach((ph) => { fm[ph.id] = ph.viewer_favorited; cm[ph.id] = ph.favorites_count })
        setFavoritedMap(fm)
        setFavCountMap(cm)
      }
      setHasMore(data.hasMore)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    setPage(1)
    fetchPhotos(1, selectedSpecies, order, false)
  }, [selectedSpecies, order, fetchPhotos])

  function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPhotos(nextPage, selectedSpecies, order, true)
  }

  // Buscar especies para filtro
  useEffect(() => {
    if (!speciesSearch.trim()) { setSpeciesList([]); return }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/species?q=${encodeURIComponent(speciesSearch)}`)
      const data = await res.json()
      setSpeciesList(Array.isArray(data) ? data.slice(0, 10) : [])
    }, 300)
    return () => clearTimeout(t)
  }, [speciesSearch])

  async function toggleFavorite(photoId: string) {
    if (!session?.user) { setLoginPrompt(true); return }
    setFavLoading(photoId)
    try {
      const res = await fetch(`/api/photos/${photoId}/favorite`, { method: 'POST' })
      if (res.ok) {
        const { favorited } = await res.json()
        setFavoritedMap((prev) => ({ ...prev, [photoId]: favorited }))
        setFavCountMap((prev) => ({
          ...prev,
          [photoId]: favorited ? (prev[photoId] ?? 0) + 1 : Math.max(0, (prev[photoId] ?? 0) - 1),
        }))
      }
    } finally {
      setFavLoading(null)
    }
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Filtro especie */}
        <div className="relative">
          <div className="flex items-center rounded-xl border border-stone-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-neon-400 min-w-[200px]">
            <Search className="ml-3 h-4 w-4 text-stone-400 flex-shrink-0" />
            <input
              type="text"
              value={selectedSpecies ? (speciesList.find((s) => s.slug === selectedSpecies)?.commonName ?? selectedSpecies) : speciesSearch}
              onChange={(e) => {
                setSpeciesSearch(e.target.value)
                setSelectedSpecies('')
                setSpeciesDropdownOpen(true)
              }}
              onFocus={() => speciesList.length > 0 && setSpeciesDropdownOpen(true)}
              placeholder="Filtrar por especie…"
              className="flex-1 px-2 py-2 text-sm text-stone-700 outline-none"
            />
            {selectedSpecies && (
              <button
                type="button"
                onClick={() => { setSelectedSpecies(''); setSpeciesSearch(''); setSpeciesList([]) }}
                className="mr-2 text-stone-400 hover:text-stone-600"
              >
                ×
              </button>
            )}
          </div>
          {speciesDropdownOpen && speciesList.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-stone-200 bg-white shadow-lg max-h-52 overflow-y-auto">
              {speciesList.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onMouseDown={() => {
                    setSelectedSpecies(s.slug)
                    setSpeciesSearch(s.commonName)
                    setSpeciesDropdownOpen(false)
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-stone-50 transition-colors"
                >
                  <span className="block text-sm font-medium text-stone-800">{s.commonName}</span>
                  <span className="text-xs italic text-stone-400">{s.scientificName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ordenar */}
        <div className="relative">
          <div className="flex items-center rounded-xl border border-stone-300 bg-white overflow-hidden">
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as 'recent' | 'popular')}
              className="pl-3 pr-8 py-2 text-sm text-stone-700 outline-none appearance-none bg-transparent"
            >
              <option value="recent">Más recientes</option>
              <option value="popular">Más guardadas</option>
            </select>
            <ChevronDown className="absolute right-2 h-4 w-4 text-stone-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-neon-400" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg">No hay fotos aún</p>
          <p className="text-sm mt-1">Sé el primero en compartir un avistamiento</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0.5">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-square group overflow-hidden bg-stone-100"
              >
                <img
                  src={photo.url}
                  alt={photo.species_common_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  style={photo.license === 'view_only' ? { pointerEvents: 'none' } as React.CSSProperties : {}}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col justify-end p-2">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-semibold leading-tight truncate">{photo.species_common_name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-white/70 text-xs">
                        @{photo.user_username ?? photo.user_name}
                      </span>
                      <span className="flex items-center gap-1 text-white text-xs">
                        <Heart className="h-3 w-3 fill-white" />
                        {favCountMap[photo.id] ?? photo.favorites_count}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Cargar más */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-6 py-3 text-sm font-medium text-stone-600 transition-colors disabled:opacity-60"
              >
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Cargar más
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal foto */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-xl w-full bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className={cn('relative', selectedPhoto.license === 'view_only' && 'select-none')}>
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.species_common_name}
                className="w-full max-h-[60vh] object-contain bg-stone-900"
                style={selectedPhoto.license === 'view_only' ? { pointerEvents: 'none', userSelect: 'none' } as React.CSSProperties : {}}
                onContextMenu={selectedPhoto.license === 'view_only' ? (e) => e.preventDefault() : undefined}
              />
              {selectedPhoto.license === 'view_only' && (
                <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white/70">
                  Solo visualización
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/especies/${selectedPhoto.species_slug}`}
                    onClick={() => setSelectedPhoto(null)}
                    className="font-semibold text-stone-800 hover:text-neon-600 transition-colors"
                  >
                    {selectedPhoto.species_common_name}
                  </Link>
                  <p className="text-xs italic text-stone-400">{selectedPhoto.species_scientific_name}</p>
                  <div className="flex flex-wrap gap-x-3 mt-2 text-xs text-stone-400">
                    <Link
                      href={selectedPhoto.user_username ? `/perfil/${selectedPhoto.user_username}` : '#'}
                      onClick={() => setSelectedPhoto(null)}
                      className="hover:text-neon-600"
                    >
                      @{selectedPhoto.user_username ?? selectedPhoto.user_name}
                    </Link>
                    {selectedPhoto.observed_at && (
                      <span>{new Date(selectedPhoto.observed_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    )}
                    {selectedPhoto.region_code && (
                      <span>{REGION_NAMES[selectedPhoto.region_code] ?? selectedPhoto.region_code}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(selectedPhoto.id)}
                  disabled={favLoading === selectedPhoto.id}
                  className={cn(
                    'flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                    favoritedMap[selectedPhoto.id]
                      ? 'bg-red-500 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-red-500 hover:text-white'
                  )}
                >
                  {favLoading === selectedPhoto.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Heart className={cn('h-4 w-4', favoritedMap[selectedPhoto.id] && 'fill-white')} />}
                  {favCountMap[selectedPhoto.id] ?? selectedPhoto.favorites_count}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt de login para favoritos */}
      {loginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setLoginPrompt(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-stone-800 mb-2">Inicia sesión para guardar favoritos</h2>
            <p className="text-stone-500 text-sm mb-6">Crea una cuenta gratis con tu cuenta de Google</p>
            <Link
              href="/login?callbackUrl=/comunidad"
              className="inline-flex items-center gap-2 rounded-xl bg-neon-400 hover:bg-neon-300 px-5 py-2.5 text-sm font-semibold text-black transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Iniciar sesión
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
