'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, Plus, X, Upload } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface AreaPhoto {
  id: string
  url: string
  caption: string | null
  created_at: string
  area_id: string
  area_name: string
  area_slug: string
  user_name: string | null
  user_username: string | null
  user_avatar: string | null
}

interface ProtectedArea {
  id: string
  name: string
  slug: string
}

interface Props {
  /** Si se pasa, pre-filtra y pre-selecciona esta área en el modal */
  defaultAreaSlug?: string
}

export function AreaFotosFeed({ defaultAreaSlug }: Props) {
  const { data: session } = useSession()

  const [photos, setPhotos] = useState<AreaPhoto[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Modal de upload
  const [modalOpen, setModalOpen] = useState(false)
  const [areas, setAreas] = useState<ProtectedArea[]>([])
  const [selectedAreaSlug, setSelectedAreaSlug] = useState(defaultAreaSlug ?? '')
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchPhotos = useCallback(async (p: number, append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p) })
      if (defaultAreaSlug) params.set('areaSlug', defaultAreaSlug)
      const res = await fetch(`/api/area-photos?${params}`)
      const data = await res.json()
      const incoming: AreaPhoto[] = data.photos ?? []
      setPhotos((prev) => append ? [...prev, ...incoming] : incoming)
      setHasMore(data.hasMore)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [defaultAreaSlug])

  useEffect(() => { fetchPhotos(1, false) }, [fetchPhotos])

  // Cargar lista de áreas para el selector del modal
  useEffect(() => {
    if (!modalOpen || areas.length > 0) return
    fetch('/api/protected-areas')
      .then((r) => r.json())
      .then((d) => {
        // La ruta devuelve GeoJSON FeatureCollection
        if (d?.features) {
          setAreas(
            d.features.map((f: { properties: { id: string; name: string; slug: string } }) => ({
              id: f.properties.id,
              name: f.properties.name,
              slug: f.properties.slug,
            }))
          )
        }
      })
      .catch(() => {})
  }, [modalOpen, areas.length])

  function openModal() {
    setUploadSuccess(false)
    setUploadError(null)
    setFile(null)
    setFilePreview(null)
    setCaption('')
    setSelectedAreaSlug(defaultAreaSlug ?? '')
    setModalOpen(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    if (f) {
      setFilePreview(URL.createObjectURL(f))
    } else {
      setFilePreview(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !selectedAreaSlug) return
    setUploading(true)
    setUploadError(null)

    const fd = new FormData()
    fd.append('areaSlug', selectedAreaSlug)
    fd.append('photo', file)
    if (caption.trim()) fd.append('caption', caption.trim())

    try {
      const res = await fetch('/api/area-photos', { method: 'POST', body: fd })
      if (res.ok) {
        setUploadSuccess(true)
      } else {
        const err = await res.json()
        setUploadError(err.error ?? 'Error al subir la foto')
      }
    } catch {
      setUploadError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchPhotos(next, true)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E676]" />
      </div>
    )
  }

  return (
    <div className="relative">
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-zinc-400 text-sm mb-1">
            {defaultAreaSlug
              ? '¿Has visitado este lugar? Sube la primera foto.'
              : 'Aún no hay fotos de áreas protegidas.'}
          </p>
          {!defaultAreaSlug && (
            <p className="text-zinc-500 text-xs mb-6">Comparte tus fotos de parques y santuarios de Chile.</p>
          )}
          <button
            onClick={openModal}
            className="mt-4 rounded-lg bg-[#00E676] hover:bg-[#00c85e] px-5 py-2.5 text-sm font-semibold text-black transition-colors"
          >
            Subir foto de un área
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((p) => (
              <div key={p.id} className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900">
                <Image
                  src={p.url}
                  alt={p.area_name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                  <Link
                    href={`/areas-protegidas/${p.area_slug}`}
                    className="text-white text-xs font-semibold truncate hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.area_name}
                  </Link>
                  <p className="text-white/60 text-[10px] truncate">
                    {p.user_username ? `@${p.user_username}` : p.user_name}
                    {' · '}
                    {new Date(p.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors disabled:opacity-50"
              >
                {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                Cargar más
              </button>
            </div>
          )}
        </>
      )}

      {/* Botón flotante de subir foto */}
      {photos.length > 0 && (
        <button
          onClick={openModal}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-[#00E676] hover:bg-[#00c85e] shadow-lg px-4 py-3 text-sm font-semibold text-black transition-colors"
        >
          <Plus className="h-4 w-4" />
          Subir foto de un área
        </button>
      )}

      {/* Modal de upload */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => !uploading && setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => !uploading && setModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-white text-lg font-semibold mb-4">Subir foto de un área</h2>

            {uploadSuccess ? (
              <div className="text-center py-8">
                <p className="text-[#00E676] font-semibold text-base mb-2">Foto recibida</p>
                <p className="text-zinc-400 text-sm">Será revisada antes de publicarse.</p>
                <button
                  onClick={() => setModalOpen(false)}
                  className="mt-6 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Selector de área */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Área protegida</label>
                  <select
                    value={selectedAreaSlug}
                    onChange={(e) => setSelectedAreaSlug(e.target.value)}
                    required
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-[#00E676] transition-colors"
                  >
                    <option value="">Selecciona un área…</option>
                    {areas.map((a) => (
                      <option key={a.slug} value={a.slug}>{a.name}</option>
                    ))}
                  </select>
                </div>

                {/* Upload de foto */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Foto <span className="text-zinc-600">(JPG, PNG o WebP · máx 10 MB)</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                  />
                  {filePreview ? (
                    <div className="relative rounded-lg overflow-hidden aspect-video bg-zinc-900">
                      <Image src={filePreview} alt="Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => { setFile(null); setFilePreview(null) }}
                        className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-700 hover:border-zinc-500 py-8 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">Seleccionar foto</span>
                    </button>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Descripción <span className="text-zinc-600">(opcional)</span>
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={2}
                    maxLength={280}
                    placeholder="¿Qué ves en esta foto?"
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-[#00E676] transition-colors resize-none placeholder:text-zinc-600"
                  />
                </div>

                {uploadError && (
                  <p className="text-red-400 text-xs">{uploadError}</p>
                )}

                {!session?.user ? (
                  <p className="text-zinc-400 text-sm text-center">
                    <Link href="/login?callbackUrl=/comunidad" className="text-[#00E676] hover:underline">
                      Inicia sesión
                    </Link>{' '}
                    para subir fotos.
                  </p>
                ) : (
                  <button
                    type="submit"
                    disabled={uploading || !file || !selectedAreaSlug}
                    className="w-full rounded-lg bg-[#00E676] hover:bg-[#00c85e] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-black transition-colors flex items-center justify-center gap-2"
                  >
                    {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {uploading ? 'Subiendo…' : 'Subir foto'}
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
