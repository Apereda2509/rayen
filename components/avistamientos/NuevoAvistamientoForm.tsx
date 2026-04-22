'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Search, X, CheckCircle, AlertCircle, Loader2, Camera } from 'lucide-react'

const MapPicker = dynamic(
  () => import('./MapPicker').then((m) => m.MapPicker),
  { ssr: false, loading: () => <div className="h-64 rounded-xl bg-stone-100 animate-pulse" /> }
)

interface SpeciesOption {
  slug: string
  commonName: string
  scientificName: string
  type: string
}

interface Props {
  defaultSpeciesSlug?: string
}

export function NuevoAvistamientoForm({ defaultSpeciesSlug }: Props) {
  // Species selector
  const [speciesQuery, setSpeciesQuery] = useState('')
  const [speciesList, setSpeciesList] = useState<SpeciesOption[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesOption | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loadingSpecies, setLoadingSpecies] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Form fields
  const [date, setDate] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  // Submission
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load 20 species on mount, search on query change
  useEffect(() => {
    const delay = setTimeout(async () => {
      setLoadingSpecies(true)
      try {
        const url = speciesQuery
          ? `/api/species?q=${encodeURIComponent(speciesQuery)}`
          : `/api/species?limit=20`
        const res = await fetch(url)
        const json = await res.json()
        const items: SpeciesOption[] = speciesQuery
          ? json
          : (json.data ?? []).map((s: SpeciesOption) => ({
              slug: s.slug,
              commonName: s.commonName,
              scientificName: s.scientificName,
              type: s.type,
            }))
        setSpeciesList(items)
      } catch {
        // silently ignore
      } finally {
        setLoadingSpecies(false)
      }
    }, 250)
    return () => clearTimeout(delay)
  }, [speciesQuery])

  // Pre-select species from URL param
  useEffect(() => {
    if (!defaultSpeciesSlug || selectedSpecies) return
    fetch(`/api/species?q=${encodeURIComponent(defaultSpeciesSlug)}`)
      .then((r) => r.json())
      .then((data: SpeciesOption[]) => {
        const match = data.find((s) => s.slug === defaultSpeciesSlug)
        if (match) {
          setSelectedSpecies(match)
          setSpeciesQuery(match.commonName)
        }
      })
      .catch(() => {})
  }, [defaultSpeciesSlug, selectedSpecies])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectSpecies(s: SpeciesOption) {
    setSelectedSpecies(s)
    setSpeciesQuery(s.commonName)
    setDropdownOpen(false)
  }

  function clearSpecies() {
    setSelectedSpecies(null)
    setSpeciesQuery('')
    setDropdownOpen(true)
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('La foto no puede superar 5 MB.')
      return
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Formato no válido. Usa JPG, PNG o WebP.')
      return
    }
    setError(null)
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function removePhoto() {
    setPhoto(null)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
  }

  const handleLocationChange = useCallback(
    (point: { lat: number; lng: number }) => setLocation(point),
    []
  )

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!selectedSpecies) return setError('Selecciona una especie.')
    if (!date) return setError('Indica la fecha del avistamiento.')
    if (!location) return setError('Marca la ubicación en el mapa.')

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('speciesSlug', selectedSpecies.slug)
      fd.append('observedAt', date)
      fd.append('lat', String(location.lat))
      fd.append('lng', String(location.lng))
      if (notes) fd.append('notes', notes)
      if (photo) fd.append('photo', photo)

      const res = await fetch('/api/sightings', { method: 'POST', body: fd })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Error al enviar el avistamiento.')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <CheckCircle className="h-14 w-14 text-teal-500" />
        <h2 className="text-xl font-semibold text-stone-800">¡Avistamiento enviado!</h2>
        <p className="text-stone-500 max-w-xs">
          Gracias por contribuir a Rayen. Tu avistamiento será revisado por nuestro equipo antes de aparecer en el mapa.
        </p>
        <button
          onClick={() => {
            setSuccess(false)
            setSelectedSpecies(null)
            setSpeciesQuery('')
            setDate('')
            setLocation(null)
            setPhoto(null)
            setPhotoPreview(null)
            setNotes('')
          }}
          className="mt-2 rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
        >
          Reportar otro avistamiento
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7 max-w-xl mx-auto">

      {/* Especie */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Especie <span className="text-red-500">*</span>
        </label>
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center rounded-lg border border-stone-300 bg-white focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 overflow-hidden">
            <Search className="ml-3 h-4 w-4 text-stone-400 flex-shrink-0" />
            <input
              type="text"
              value={speciesQuery}
              onChange={(e) => {
                setSpeciesQuery(e.target.value)
                setSelectedSpecies(null)
                setDropdownOpen(true)
              }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Busca por nombre común o científico…"
              className="flex-1 px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none bg-transparent"
              autoComplete="off"
            />
            {selectedSpecies && (
              <button
                type="button"
                onClick={clearSpecies}
                className="mr-2 rounded p-0.5 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {dropdownOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-stone-200 bg-white shadow-lg max-h-56 overflow-y-auto">
              {loadingSpecies ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-stone-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando…
                </div>
              ) : speciesList.length === 0 ? (
                <p className="px-4 py-3 text-sm text-stone-400">Sin resultados</p>
              ) : (
                speciesList.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    onMouseDown={() => selectSpecies(s)}
                    className="w-full text-left px-4 py-2.5 hover:bg-teal-50 transition-colors"
                  >
                    <span className="block text-sm font-medium text-stone-800">{s.commonName}</span>
                    <span className="block text-xs italic text-stone-400">{s.scientificName}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {selectedSpecies && (
          <p className="mt-1.5 text-xs text-teal-600 font-medium">
            ✓ {selectedSpecies.commonName} — <span className="italic">{selectedSpecies.scientificName}</span>
          </p>
        )}
      </div>

      {/* Fecha */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-stone-700 mb-1.5">
          Fecha del avistamiento <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      {/* Mapa */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Ubicación en el mapa <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-stone-400 mb-2">Haz clic en el mapa para marcar donde lo viste.</p>
        <MapPicker value={location} onChange={handleLocationChange} />
        {location ? (
          <p className="mt-2 text-xs text-teal-600 font-medium">
            ✓ Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
          </p>
        ) : (
          <p className="mt-2 text-xs text-stone-400">Sin ubicación seleccionada</p>
        )}
      </div>

      {/* Foto */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Foto (opcional)
        </label>
        {photoPreview ? (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-stone-200">
            <img src={photoPreview} alt="Vista previa" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-colors">
            <Camera className="h-7 w-7 text-stone-300" />
            <span className="text-sm text-stone-400">JPG, PNG o WebP · máx. 5 MB</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Notas */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-stone-700 mb-1.5">
          Notas adicionales (opcional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 500))}
          rows={3}
          placeholder="Comportamiento observado, condiciones climáticas, contexto…"
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
        />
        <p className="text-right text-xs text-stone-400 mt-1">{notes.length}/500</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 px-6 py-3 text-sm font-semibold text-white transition-colors"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando…
          </>
        ) : (
          'Enviar avistamiento'
        )}
      </button>
    </form>
  )
}
