'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  Search, X, CheckCircle, AlertCircle, Loader2, Camera,
  LocateFixed, MapPin,
} from 'lucide-react'
import type { FlyToTarget } from './MapPicker'

const MapPicker = dynamic(
  () => import('./MapPicker').then((m) => m.MapPicker),
  { ssr: false, loading: () => <div className="h-64 rounded-2xl bg-zinc-800 animate-pulse" /> }
)

const AREA_TYPE_LABELS: Record<string, string> = {
  parque_nacional: 'Parque Nacional',
  reserva_nacional: 'Reserva Nacional',
  monumento_natural: 'Monumento Natural',
  santuario_naturaleza: 'Santuario de la Naturaleza',
  area_marina: 'Área Marina Protegida',
  sitio_ramsar: 'Sitio Ramsar',
}

interface SpeciesOption {
  slug: string
  commonName: string
  scientificName: string
  type: string
}

interface GeoSuggestion {
  placeName: string
  lat: number
  lng: number
}

interface AreaOption {
  id: string
  name: string
  slug: string
  type: string
  regionName: string | null
  centroidLat: number | null
  centroidLng: number | null
}

interface Props {
  defaultSpeciesSlug?: string
}

const inputClass = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:border-[#00E676] focus:outline-none transition-colors'
const labelClass = 'block text-sm text-zinc-400 font-medium mb-2'
const sectionClass = 'bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4'

export function NuevoAvistamientoForm({ defaultSpeciesSlug }: Props) {
  // ── Selector de especie ────────────────────────────────────
  const [speciesQuery, setSpeciesQuery] = useState('')
  const [speciesList, setSpeciesList] = useState<SpeciesOption[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesOption | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loadingSpecies, setLoadingSpecies] = useState(false)
  const [speciesNotFound, setSpeciesNotFound] = useState(false)
  const speciesDropdownRef = useRef<HTMLDivElement>(null)

  // ── Fecha ──────────────────────────────────────────────────
  const [date, setDate] = useState('')

  // ── Ubicación ─────────────────────────────────────────────
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)

  const [geoQuery, setGeoQuery] = useState('')
  const [geoSuggestions, setGeoSuggestions] = useState<GeoSuggestion[]>([])
  const [geoDropdownOpen, setGeoDropdownOpen] = useState(false)
  const [loadingGeo, setLoadingGeo] = useState(false)
  const geoDropdownRef = useRef<HTMLDivElement>(null)

  // ── Área protegida ─────────────────────────────────────────
  const [inProtectedArea, setInProtectedArea] = useState(false)
  const [areaQuery, setAreaQuery] = useState('')
  const [areaList, setAreaList] = useState<AreaOption[]>([])
  const [selectedArea, setSelectedArea] = useState<AreaOption | null>(null)
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false)
  const [loadingAreas, setLoadingAreas] = useState(false)
  const areaDropdownRef = useRef<HTMLDivElement>(null)

  // ── Foto ───────────────────────────────────────────────────
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSpeciesCandidate, setIsSpeciesCandidate] = useState(false)

  // ── Notas ──────────────────────────────────────────────────
  const [notes, setNotes] = useState('')

  // ── Envío ──────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Cargar especies (debounced) ────────────────────────────
  useEffect(() => {
    const delay = setTimeout(async () => {
      setLoadingSpecies(true)
      try {
        const url = speciesQuery
          ? `/api/species?q=${encodeURIComponent(speciesQuery)}`
          : `/api/species?limit=20`
        const res = await fetch(url)
        const json = await res.json()
        const raw = speciesQuery ? json : (json.data ?? [])
        const items: SpeciesOption[] = Array.isArray(raw) ? raw : []
        setSpeciesList(items)
        setSpeciesNotFound(speciesQuery.trim().length > 0 && items.length === 0)
      } catch { /* silently ignore */ }
      finally { setLoadingSpecies(false) }
    }, 250)
    return () => clearTimeout(delay)
  }, [speciesQuery])

  useEffect(() => {
    if (!defaultSpeciesSlug || selectedSpecies) return
    fetch(`/api/species?q=${encodeURIComponent(defaultSpeciesSlug)}`)
      .then((r) => r.json())
      .then((data: SpeciesOption[]) => {
        const match = data.find((s) => s.slug === defaultSpeciesSlug)
        if (match) { setSelectedSpecies(match); setSpeciesQuery(match.commonName) }
      })
      .catch(() => {})
  }, [defaultSpeciesSlug, selectedSpecies])

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (speciesDropdownRef.current && !speciesDropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false)
      if (geoDropdownRef.current && !geoDropdownRef.current.contains(e.target as Node))
        setGeoDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  // ── Geocoding (debounced) ──────────────────────────────────
  useEffect(() => {
    if (!geoQuery.trim()) { setGeoSuggestions([]); setGeoDropdownOpen(false); return }
    const delay = setTimeout(async () => {
      setLoadingGeo(true)
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(geoQuery)}.json` +
          `?access_token=${token}&country=CL&language=es&limit=5` +
          `&types=place,locality,neighborhood,poi,region,district`
        )
        const data = await res.json()
        const suggestions: GeoSuggestion[] = (data.features ?? []).map((f: {
          place_name: string; center: [number, number]
        }) => ({
          placeName: f.place_name,
          lng: f.center[0],
          lat: f.center[1],
        }))
        setGeoSuggestions(suggestions)
        setGeoDropdownOpen(suggestions.length > 0)
      } catch { /* ignore */ }
      finally { setLoadingGeo(false) }
    }, 350)
    return () => clearTimeout(delay)
  }, [geoQuery])

  // ── Cargar áreas protegidas (debounced) ───────────────────
  useEffect(() => {
    if (!inProtectedArea) return
    const delay = setTimeout(async () => {
      setLoadingAreas(true)
      try {
        const res = await fetch('/api/protected-areas')
        const json = await res.json()
        const features = json.features ?? []
        const items: AreaOption[] = features.map((f: any) => ({
          id: f.properties.id,
          name: f.properties.name,
          slug: f.properties.slug,
          type: f.properties.type,
          regionName: f.properties.regionName,
          centroidLat: f.geometry.coordinates[1],
          centroidLng: f.geometry.coordinates[0],
        }))
        setAreaList(
          areaQuery.trim()
            ? items.filter(a => a.name.toLowerCase().includes(areaQuery.toLowerCase()))
            : items
        )
        setAreaDropdownOpen(true)
      } catch { /* ignore */ }
      finally { setLoadingAreas(false) }
    }, 200)
    return () => clearTimeout(delay)
  }, [areaQuery, inProtectedArea])

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(e.target as Node))
        setAreaDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  // ── Handlers ───────────────────────────────────────────────
  function selectSpecies(s: SpeciesOption) {
    setSelectedSpecies(s); setSpeciesQuery(s.commonName); setDropdownOpen(false)
  }
  function clearSpecies() {
    setSelectedSpecies(null); setSpeciesQuery(''); setDropdownOpen(true); setSpeciesNotFound(false)
  }

  function selectArea(a: AreaOption) {
    setSelectedArea(a)
    setAreaQuery(a.name)
    setAreaDropdownOpen(false)
    if (a.centroidLat !== null && a.centroidLng !== null) {
      const point = { lat: a.centroidLat, lng: a.centroidLng }
      setLocation(point)
      setFlyTo({ ...point, zoom: 10 })
    }
  }

  function handleGPS() {
    if (!navigator.geolocation) {
      setGpsError('Tu navegador no soporta geolocalización.')
      return
    }
    setGpsLoading(true)
    setGpsError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLocation(point)
        setFlyTo({ ...point, zoom: 13 })
        setGpsLoading(false)
      },
      () => {
        setGpsError('No se pudo obtener la ubicación. Comprueba los permisos del navegador.')
        setGpsLoading(false)
      },
      { timeout: 10000 }
    )
  }

  function selectGeoSuggestion(s: GeoSuggestion) {
    setLocation({ lat: s.lat, lng: s.lng })
    setFlyTo({ lat: s.lat, lng: s.lng, zoom: 12 })
    setGeoQuery(s.placeName)
    setGeoDropdownOpen(false)
  }

  const handleMapClick = useCallback(
    (point: { lat: number; lng: number }) => setLocation(point),
    []
  )

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('La foto no puede superar 5 MB.'); return }
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { setError('Usa JPG, PNG o WebP.'); return }
    setError(null)
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function removePhoto() {
    setPhoto(null)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
  }

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!selectedSpecies && !speciesQuery.trim()) return setError('Indica la especie observada.')
    if (!date) return setError('Indica la fecha del avistamiento.')
    if (!location) return setError('Marca la ubicación.')

    setSubmitting(true)
    try {
      const fd = new FormData()
      if (selectedSpecies) {
        fd.append('speciesSlug', selectedSpecies.slug)
      } else {
        fd.append('speciesNameFree', speciesQuery.trim())
      }
      fd.append('observedAt', date)
      fd.append('lat', String(location.lat))
      fd.append('lng', String(location.lng))
      if (notes) fd.append('notes', notes)
      if (photo) fd.append('photo', photo)
      if (photo && isSpeciesCandidate) fd.append('isSpeciesCandidate', 'true')

      const res = await fetch('/api/sightings', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) setError(json.error ?? 'Error al enviar el avistamiento.')
      else setSuccess(true)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Pantalla de éxito ──────────────────────────────────────
  if (success) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center gap-4 py-16 text-center px-8">
        <CheckCircle className="h-14 w-14 text-[#00E676]" />
        <h2
          className="text-xl font-semibold text-white"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          ¡Avistamiento enviado!
        </h2>
        <p className="text-zinc-400 max-w-xs text-sm">
          Gracias por contribuir a Rayen. Tu avistamiento será revisado por nuestro equipo antes de aparecer en el mapa.
        </p>
        <button
          onClick={() => {
            setSuccess(false); setSelectedSpecies(null); setSpeciesQuery('')
            setDate(''); setLocation(null); setFlyTo(null)
            setPhoto(null); setPhotoPreview(null); setNotes('')
            setGeoQuery(''); setGeoSuggestions([])
            setIsSpeciesCandidate(false)
          }}
          className="mt-2 rounded-xl bg-[#00E676] hover:bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-black transition-colors"
        >
          Reportar otro avistamiento
        </button>
      </div>
    )
  }

  // ── Formulario ─────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-0">

      {/* Especie */}
      <div className={sectionClass}>
        <label className={labelClass}>
          Especie <span className="text-red-400">*</span>
        </label>
        <div className="relative" ref={speciesDropdownRef}>
          <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-xl focus-within:border-[#00E676] overflow-hidden transition-colors">
            <Search className="ml-3 h-4 w-4 text-zinc-600 flex-shrink-0" />
            <input
              type="text"
              value={speciesQuery}
              onChange={(e) => { setSpeciesQuery(e.target.value); setSelectedSpecies(null); setDropdownOpen(true) }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Busca por nombre común o científico…"
              className="flex-1 px-3 py-3 text-sm text-white placeholder:text-zinc-600 outline-none bg-transparent"
              autoComplete="off"
            />
            {selectedSpecies && (
              <button type="button" onClick={clearSpecies} className="mr-2 rounded p-0.5 text-zinc-500 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {dropdownOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 shadow-xl max-h-56 overflow-y-auto">
              {loadingSpecies ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" />Cargando…
                </div>
              ) : speciesList.length === 0 ? (
                <p className="px-4 py-3 text-sm text-zinc-500">Sin resultados</p>
              ) : (
                speciesList.map((s) => (
                  <button key={s.slug} type="button" onMouseDown={() => selectSpecies(s)}
                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-700 transition-colors cursor-pointer">
                    <span className="block text-sm font-medium text-white">{s.commonName}</span>
                    <span className="block text-xs italic text-zinc-500">{s.scientificName}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {selectedSpecies && (
          <p className="mt-1.5 text-xs text-[#00E676] font-medium">
            Seleccionada: {selectedSpecies.commonName} — <span className="italic">{selectedSpecies.scientificName}</span>
          </p>
        )}
        {speciesNotFound && !selectedSpecies && (
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
            No encontramos esta especie en nuestra base de datos. Puedes escribir el nombre de todas formas y lo revisaremos.
          </p>
        )}
      </div>

      {/* Fecha */}
      <div className={sectionClass}>
        <label htmlFor="date" className={labelClass}>
          Fecha del avistamiento <span className="text-red-400">*</span>
        </label>
        <input
          id="date" type="date" value={date} max={today}
          onChange={(e) => setDate(e.target.value)} required
          className={inputClass}
          style={{ colorScheme: 'dark' }}
        />
      </div>

      {/* Ubicación */}
      <div className={sectionClass}>
        <label className={labelClass}>
          Ubicación <span className="text-red-400">*</span>
        </label>

        {/* GPS */}
        <button
          type="button"
          onClick={handleGPS}
          disabled={gpsLoading}
          className="w-full flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:border-[#00E676]/50 hover:bg-zinc-700 disabled:opacity-60 px-4 py-3 text-left transition-colors mb-3"
        >
          {gpsLoading
            ? <Loader2 className="h-5 w-5 text-[#00E676] animate-spin flex-shrink-0" />
            : <LocateFixed className="h-5 w-5 text-[#00E676] flex-shrink-0" />}
          <div>
            <p className="text-sm font-medium text-white">Estoy en el lugar ahora</p>
            <p className="text-xs text-zinc-500">Usa tu ubicación actual (GPS)</p>
          </div>
        </button>
        {gpsError && (
          <p className="mb-3 text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />{gpsError}
          </p>
        )}

        {/* Geocoding */}
        <div className="relative mb-3" ref={geoDropdownRef}>
          <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-xl focus-within:border-[#00E676] overflow-hidden transition-colors">
            <Search className="ml-3 h-4 w-4 text-zinc-600 flex-shrink-0" />
            <input
              type="text"
              value={geoQuery}
              onChange={(e) => { setGeoQuery(e.target.value); setGeoDropdownOpen(true) }}
              onFocus={() => geoSuggestions.length > 0 && setGeoDropdownOpen(true)}
              placeholder="Lo vi en otro momento — buscar lugar, ciudad o parque…"
              className="flex-1 px-3 py-3 text-sm text-white placeholder:text-zinc-600 outline-none bg-transparent"
              autoComplete="off"
            />
            {loadingGeo && <Loader2 className="mr-3 h-4 w-4 text-zinc-500 animate-spin flex-shrink-0" />}
            {geoQuery && !loadingGeo && (
              <button type="button" onClick={() => { setGeoQuery(''); setGeoSuggestions([]); setGeoDropdownOpen(false) }}
                className="mr-2 rounded p-0.5 text-zinc-500 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {geoDropdownOpen && geoSuggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 shadow-xl max-h-52 overflow-y-auto">
              {geoSuggestions.map((s, i) => (
                <button key={i} type="button" onMouseDown={() => selectGeoSuggestion(s)}
                  className="w-full text-left flex items-start gap-2 px-4 py-2.5 hover:bg-zinc-700 transition-colors cursor-pointer">
                  <MapPin className="h-4 w-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-300">{s.placeName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Área protegida */}
        <div className="mb-3">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inProtectedArea}
              onChange={(e) => {
                setInProtectedArea(e.target.checked)
                if (!e.target.checked) {
                  setSelectedArea(null)
                  setAreaQuery('')
                  setAreaDropdownOpen(false)
                }
              }}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 accent-[#00E676]"
            />
            <span className="text-sm text-zinc-400 font-medium">
              Estaba en un área protegida (Parque Nacional, Reserva, etc.)
            </span>
          </label>

          {inProtectedArea && (
            <div className="mt-2 relative" ref={areaDropdownRef}>
              <div className="flex items-center bg-zinc-800 border border-[#00E676]/30 rounded-xl focus-within:border-[#00E676] overflow-hidden transition-colors">
                <Search className="ml-3 h-4 w-4 text-[#00E676] flex-shrink-0" />
                <input
                  type="text"
                  value={areaQuery}
                  onChange={(e) => { setAreaQuery(e.target.value); setSelectedArea(null); setAreaDropdownOpen(true) }}
                  onFocus={() => setAreaDropdownOpen(true)}
                  placeholder="Busca el área protegida…"
                  className="flex-1 px-3 py-3 text-sm text-white placeholder:text-zinc-600 outline-none bg-transparent"
                  autoComplete="off"
                />
                {loadingAreas && <Loader2 className="mr-3 h-4 w-4 text-[#00E676] animate-spin flex-shrink-0" />}
                {selectedArea && (
                  <button type="button" onClick={() => { setSelectedArea(null); setAreaQuery('') }}
                    className="mr-2 rounded p-0.5 text-zinc-500 hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {areaDropdownOpen && areaList.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 shadow-xl max-h-56 overflow-y-auto">
                  {areaList.map((a) => (
                    <button key={a.slug} type="button" onMouseDown={() => selectArea(a)}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-700 transition-colors cursor-pointer">
                      <span className="block text-sm font-medium text-white">{a.name}</span>
                      <span className="block text-xs text-zinc-500">
                        {AREA_TYPE_LABELS[a.type] ?? a.type}
                        {a.regionName ? ` · ${a.regionName}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {selectedArea && (
                <p className="mt-1.5 text-xs text-[#00E676] font-medium">
                  Área: {selectedArea.name}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Divisor */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs text-zinc-600">o haz clic directamente en el mapa</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Mapa */}
        <div className="rounded-2xl overflow-hidden border border-zinc-700">
          <MapPicker value={location} onChange={handleMapClick} flyTo={flyTo} />
        </div>

        {location ? (
          <p className="mt-2 text-xs text-[#00E676] font-medium">
            Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
          </p>
        ) : (
          <p className="mt-2 text-xs text-zinc-600">Sin ubicación seleccionada</p>
        )}
      </div>

      {/* Foto */}
      <div className={sectionClass}>
        <label className={labelClass}>
          Foto <span className="text-zinc-600">(opcional)</span>
        </label>
        {photoPreview ? (
          <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-zinc-700">
            <img src={photoPreview} alt="Vista previa" className="w-full h-full object-cover" />
            <button type="button" onClick={removePhoto}
              className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 text-white hover:bg-black/90 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-zinc-700 rounded-2xl cursor-pointer hover:border-[#00E676]/50 hover:bg-zinc-800/50 transition-colors">
            <Camera className="h-7 w-7 text-zinc-600" />
            <span className="text-sm text-zinc-400">JPG, PNG o WebP · máx. 5 MB</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
          </label>
        )}
      </div>

      {/* Proponer foto candidata */}
      {photo && (
        <div className="rounded-2xl border border-[#00E676]/20 bg-zinc-900 px-4 py-3 mb-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isSpeciesCandidate}
              onChange={(e) => setIsSpeciesCandidate(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-zinc-700 accent-[#00E676]"
            />
            <div>
              <p className="text-sm font-medium text-[#00E676]">
                Proponer esta foto como foto principal de la especie
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Un moderador revisará si es adecuada. La foto con más favoritos entre las aprobadas será la principal.
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Notas */}
      <div className={sectionClass}>
        <label htmlFor="notes" className={labelClass}>
          Notas adicionales <span className="text-zinc-600">(opcional)</span>
        </label>
        <textarea
          id="notes" value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 500))}
          rows={3} placeholder="Comportamiento observado, condiciones climáticas, contexto…"
          className={`${inputClass} resize-none`}
        />
        <p className="text-right text-xs text-zinc-600 mt-1">{notes.length}/500</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-950/50 border border-red-900 px-4 py-3 text-sm text-red-400 mb-4">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit" disabled={submitting}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00E676] hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed px-8 py-4 text-base font-semibold text-black transition-colors"
      >
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Enviando…</> : 'Enviar avistamiento'}
      </button>
    </form>
  )
}
