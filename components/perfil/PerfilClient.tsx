'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Instagram, Linkedin, Globe, Twitter, Heart, X, Loader2,
  Camera, CheckCircle, MapPin, Calendar, Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SpeciesCard } from '@/components/species/SpeciesCard'
import { ConservationBadge } from '@/components/species/ConservationBadge'
import type { UICNStatus } from '@/lib/types'

interface UserData {
  id: string; email: string; name: string; username: string | null
  bio: string | null; avatar_url: string | null; instagram: string | null
  linkedin: string | null; inaturalist: string | null; twitter: string | null
  website: string | null; role: string; created_at: string
}

interface Photo {
  id: string; url: string; license: string; favorites_count: number; created_at: string
  species_slug: string | null; species_common_name: string | null
  region_code: string | null; observed_at: string | null
}

interface SpeciesFav {
  id: string; slug: string; commonName: string; scientificName: string
  type: string; uicnStatus: string | null; primaryPhoto: string | null; isEndemic: boolean
}

interface Sighting {
  id: string; observed_at: string; verified: boolean; region_code: string | null
  photo_url: string | null; notes: string | null
  commonName: string; scientificName: string; speciesSlug: string
  uicnStatus: string | null
}

interface Props {
  user: UserData
  sessionEmail?: string
  stats: { sightings_count: number; unique_species_count: number; regions_count: number }
  photos: Photo[]
  speciesFavorites: SpeciesFav[]
  sightings: Sighting[]
  isOwner: boolean
}

type Tab = 'fotos' | 'favoritas' | 'avistamientos'

// ── Contador animado ─────────────────────────────────────────
function AnimatedStat({ value, label }: { value: number; label: string }) {
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current || value === 0) { setDisplay(value); return }
    started.current = true
    const duration = 900
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  return (
    <div className="text-center">
      <span className="font-grotesk font-bold text-white text-2xl block">
        {display.toLocaleString('es-CL')}
      </span>
      <span className="text-zinc-500 text-xs">{label}</span>
    </div>
  )
}

export function PerfilClient({ user, stats, photos, speciesFavorites, sightings, isOwner }: Props) {
  const [tab, setTab] = useState<Tab>('fotos')
  const [editOpen, setEditOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [photoFavorited, setPhotoFavorited] = useState<Record<string, boolean>>({})
  const [favLoading, setFavLoading] = useState<string | null>(null)

  // Edit form state
  const [editName, setEditName] = useState(user.name)
  const [editBio, setEditBio] = useState(user.bio ?? '')
  const [editInstagram, setEditInstagram] = useState(user.instagram ?? '')
  const [editLinkedin, setEditLinkedin] = useState(user.linkedin ?? '')
  const [editInaturalist, setEditInaturalist] = useState(user.inaturalist ?? '')
  const [editTwitter, setEditTwitter] = useState(user.twitter ?? '')
  const [editWebsite, setEditWebsite] = useState(user.website ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(user.avatar_url)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  async function saveProfile() {
    setSavingProfile(true)
    try {
      if (avatarFile) {
        setSavingAvatar(true)
        const fd = new FormData()
        fd.append('avatar', avatarFile)
        const res = await fetch('/api/user/avatar', { method: 'POST', body: fd })
        if (res.ok) {
          const { avatarUrl } = await res.json()
          setCurrentAvatarUrl(avatarUrl)
        }
        setSavingAvatar(false)
      }
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName, bio: editBio || null,
          instagram: editInstagram || null, linkedin: editLinkedin || null,
          inaturalist: editInaturalist || null, twitter: editTwitter || null,
          website: editWebsite || null,
        }),
      })
      setEditOpen(false)
      window.location.reload()
    } finally {
      setSavingProfile(false)
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function togglePhotoFavorite(photoId: string) {
    setFavLoading(photoId)
    try {
      const res = await fetch(`/api/photos/${photoId}/favorite`, { method: 'POST' })
      if (res.ok) {
        const { favorited } = await res.json()
        setPhotoFavorited((prev) => ({ ...prev, [photoId]: favorited }))
      }
    } finally {
      setFavLoading(null)
    }
  }

  const displayAvatar = avatarPreview ?? currentAvatarUrl

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-8">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#00E676] bg-zinc-800">
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt={user.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-zinc-800 text-zinc-500 font-grotesk font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="font-grotesk text-2xl font-bold text-white">{user.name}</h1>
              {isOwner && (
                <button
                  onClick={() => setEditOpen(true)}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
                >
                  Editar perfil
                </button>
              )}
            </div>
            {user.username && (
              <p className="text-sm text-zinc-500 mb-2">@{user.username}</p>
            )}
            {user.bio && (
              <p className="text-sm text-zinc-300 max-w-md mb-3">{user.bio}</p>
            )}

            {/* Redes sociales */}
            <div className="flex flex-wrap gap-3 mb-5">
              {user.instagram && (
                <a href={`https://instagram.com/${user.instagram}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-[#00E676] transition-colors">
                  <Instagram className="h-3.5 w-3.5" />
                  @{user.instagram}
                </a>
              )}
              {user.twitter && (
                <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-[#00E676] transition-colors">
                  <Twitter className="h-3.5 w-3.5" />
                  @{user.twitter}
                </a>
              )}
              {user.linkedin && (
                <a href={user.linkedin.startsWith('http') ? user.linkedin : `https://linkedin.com/in/${user.linkedin}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-[#00E676] transition-colors">
                  <Linkedin className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
              )}
              {user.inaturalist && (
                <a href={`https://www.inaturalist.org/people/${user.inaturalist}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-[#00E676] transition-colors">
                  <span className="text-xs text-[#00E676]">iN</span>
                  iNaturalist
                </a>
              )}
              {user.website && (
                <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-[#00E676] transition-colors">
                  <Globe className="h-3.5 w-3.5" />
                  Sitio web
                </a>
              )}
            </div>

            {/* Stats animados */}
            <div className="flex gap-8">
              <AnimatedStat value={stats.sightings_count} label="Avistamientos" />
              <AnimatedStat value={stats.unique_species_count} label="Especies únicas" />
              <AnimatedStat value={stats.regions_count} label="Regiones exploradas" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-zinc-800 mb-6">
          <div className="flex gap-0">
            {(['fotos', 'favoritas', 'avistamientos'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-t-2 -mt-px transition-colors',
                  tab === t
                    ? 'border-[#00E676] text-[#00E676]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                )}
              >
                {t === 'fotos' ? 'Fotos' : t === 'favoritas' ? 'Favoritas' : 'Avistamientos'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Fotos */}
        {tab === 'fotos' && (
          <div>
            {photos.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <Camera className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                <p>Aún no hay fotos</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="relative aspect-square group overflow-hidden bg-zinc-900"
                  >
                    <img
                      src={photo.url}
                      alt={photo.species_common_name ?? 'Foto'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={photo.license === 'view_only' ? { pointerEvents: 'none' } as React.CSSProperties : {}}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-white font-semibold text-sm">
                        <Heart className="h-4 w-4 fill-white" />
                        {(photoFavorited[photo.id] !== undefined
                          ? photoFavorited[photo.id] ? photo.favorites_count + 1 : photo.favorites_count
                          : photo.favorites_count)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Favoritas */}
        {tab === 'favoritas' && (
          <div>
            {speciesFavorites.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <Heart className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                <p>Aún no hay especies favoritas</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {speciesFavorites.map((sp) => (
                  <SpeciesCard
                    key={sp.id}
                    species={{
                      id: sp.id,
                      slug: sp.slug,
                      commonName: sp.commonName,
                      scientificName: sp.scientificName,
                      type: sp.type as any,
                      uicnStatus: sp.uicnStatus as any,
                      isEndemic: sp.isEndemic,
                      primaryPhoto: sp.primaryPhoto ?? undefined,
                      dangerLevel: 'ninguno',
                      colors: [],
                      featured: false,
                      regionCodes: [],
                      ecosystemSlugs: [],
                      verifiedSightings: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Avistamientos — grid 3 columnas */}
        {tab === 'avistamientos' && (
          <div>
            {sightings.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <Eye className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                <p>Aún no hay avistamientos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sightings.map((s) => (
                  <Link
                    key={s.id}
                    href={`/especies/${s.speciesSlug}`}
                    className="group block rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
                  >
                    <div className="relative aspect-[4/3]">
                      {s.photo_url ? (
                        <img
                          src={s.photo_url}
                          alt={s.commonName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <Eye className="h-8 w-8 text-zinc-600" />
                        </div>
                      )}
                      {s.uicnStatus && (
                        <div className="absolute top-2 left-2">
                          <ConservationBadge
                            status={s.uicnStatus as UICNStatus}
                            size="sm"
                            photoOverlay
                          />
                        </div>
                      )}
                      {!s.verified && (
                        <div className="absolute top-2 right-2 bg-amber-900/80 text-amber-300 text-[10px] font-medium px-1.5 py-0.5 rounded">
                          Pendiente
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-grotesk font-semibold text-white text-sm truncate">
                        {s.commonName}
                      </p>
                      <p className="font-serif italic text-xs text-zinc-400 truncate mb-2">
                        {s.scientificName}
                      </p>
                      <div className="flex gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(s.observed_at).toLocaleDateString('es-CL', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                        {s.region_code && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {s.region_code}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: foto ampliada */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setSelectedPhoto(null)}>
            <div className="relative max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-10 right-0 text-white/70 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
              <div className={cn('rounded-2xl overflow-hidden bg-zinc-900', selectedPhoto.license === 'view_only' && 'select-none')}>
                <div className="relative">
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.species_common_name ?? 'Foto'}
                    className="w-full max-h-[70vh] object-contain"
                    style={selectedPhoto.license === 'view_only' ? { pointerEvents: 'none', userSelect: 'none' } as React.CSSProperties : {}}
                    onContextMenu={selectedPhoto.license === 'view_only' ? (e) => e.preventDefault() : undefined}
                  />
                  {selectedPhoto.license === 'view_only' && (
                    <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white/70">
                      Solo visualización
                    </div>
                  )}
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    {selectedPhoto.species_common_name && (
                      <p className="font-medium text-white">{selectedPhoto.species_common_name}</p>
                    )}
                    <div className="flex gap-3 mt-1 text-xs text-zinc-400">
                      {selectedPhoto.observed_at && (
                        <span>{new Date(selectedPhoto.observed_at).toLocaleDateString('es-CL')}</span>
                      )}
                      {selectedPhoto.region_code && <span>{selectedPhoto.region_code}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => togglePhotoFavorite(selectedPhoto.id)}
                    disabled={favLoading === selectedPhoto.id}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                      photoFavorited[selectedPhoto.id]
                        ? 'bg-red-500 text-white'
                        : 'bg-zinc-700 text-zinc-200 hover:bg-red-500 hover:text-white'
                    )}
                  >
                    {favLoading === selectedPhoto.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Heart className={cn('h-4 w-4', photoFavorited[selectedPhoto.id] && 'fill-white')} />}
                    {(photoFavorited[selectedPhoto.id] !== undefined
                      ? photoFavorited[selectedPhoto.id] ? selectedPhoto.favorites_count + 1 : selectedPhoto.favorites_count
                      : selectedPhoto.favorites_count)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: editar perfil */}
        {editOpen && isOwner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <h2 className="font-grotesk font-bold text-white">Editar perfil</h2>
                <button onClick={() => setEditOpen(false)} className="text-zinc-500 hover:text-zinc-200">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {/* Avatar upload */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#00E676] bg-zinc-800 flex-shrink-0">
                    {(avatarPreview ?? currentAvatarUrl) ? (
                      <img src={avatarPreview ?? currentAvatarUrl!} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-zinc-500 font-grotesk font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm text-[#00E676] hover:text-[#52F599] font-medium"
                  >
                    <Camera className="h-4 w-4" />
                    Cambiar foto de perfil
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Nombre</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00E676]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value.slice(0, 200))}
                    rows={3}
                    placeholder="Cuéntanos sobre ti…"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#00E676] placeholder-zinc-600"
                  />
                  <p className="text-right text-xs text-zinc-600">{editBio.length}/200</p>
                </div>

                {[
                  { label: 'Instagram', icon: <Instagram className="h-3.5 w-3.5" />, value: editInstagram, set: setEditInstagram, placeholder: '@usuario' },
                  { label: 'Twitter / X', icon: <Twitter className="h-3.5 w-3.5" />, value: editTwitter, set: setEditTwitter, placeholder: '@usuario' },
                  { label: 'LinkedIn', icon: <Linkedin className="h-3.5 w-3.5" />, value: editLinkedin, set: setEditLinkedin, placeholder: 'URL o usuario' },
                  { label: 'iNaturalist', icon: <span className="text-xs text-[#00E676]">iN</span>, value: editInaturalist, set: setEditInaturalist, placeholder: 'nombre de usuario' },
                  { label: 'Sitio web', icon: <Globe className="h-3.5 w-3.5" />, value: editWebsite, set: setEditWebsite, placeholder: 'https://…' },
                ].map(({ label, icon, value, set, placeholder }) => (
                  <div key={label}>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">{label}</label>
                    <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-[#00E676]">
                      <span className="pl-3 pr-2 text-zinc-500">{icon}</span>
                      <input
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 px-2 py-2 text-sm text-white bg-transparent outline-none placeholder-zinc-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 p-5 border-t border-zinc-800">
                <button
                  onClick={() => setEditOpen(false)}
                  className="flex-1 rounded-lg border border-zinc-700 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#00E676] hover:bg-[#52F599] disabled:opacity-60 py-2.5 text-sm font-semibold text-black transition-colors"
                >
                  {savingProfile
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Guardando…</>
                    : <><CheckCircle className="h-4 w-4" />Guardar</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
