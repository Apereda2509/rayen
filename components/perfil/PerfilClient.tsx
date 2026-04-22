'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Instagram, Linkedin, Globe, Twitter, Heart, X, Loader2,
  Camera, CheckCircle, MapPin, Calendar, Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SpeciesCard } from '@/components/species/SpeciesCard'

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
}

interface Props {
  user: UserData
  sessionEmail?: string
  stats: { sightings_count: number; species_fav_count: number; photos_count: number }
  photos: Photo[]
  speciesFavorites: SpeciesFav[]
  sightings: Sighting[]
  isOwner: boolean
}

type Tab = 'fotos' | 'favoritas' | 'avistamientos'

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
      // Upload avatar first if changed
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
      // Reload to reflect changes
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
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-8">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-teal-100 bg-stone-100">
            {displayAvatar ? (
              <Image
                src={displayAvatar}
                alt={user.name}
                width={112}
                height={112}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl bg-teal-50 text-teal-300">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-stone-900">{user.name}</h1>
            {isOwner && (
              <button
                onClick={() => setEditOpen(true)}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Editar perfil
              </button>
            )}
          </div>
          {user.username && (
            <p className="text-sm text-stone-400 mb-2">@{user.username}</p>
          )}
          {user.bio && (
            <p className="text-sm text-stone-600 max-w-md mb-3">{user.bio}</p>
          )}

          {/* Redes sociales */}
          <div className="flex flex-wrap gap-3 mb-4">
            {user.instagram && (
              <a href={`https://instagram.com/${user.instagram}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-pink-600 transition-colors">
                <Instagram className="h-3.5 w-3.5" />
                @{user.instagram}
              </a>
            )}
            {user.twitter && (
              <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-sky-500 transition-colors">
                <Twitter className="h-3.5 w-3.5" />
                @{user.twitter}
              </a>
            )}
            {user.linkedin && (
              <a href={user.linkedin.startsWith('http') ? user.linkedin : `https://linkedin.com/in/${user.linkedin}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-blue-600 transition-colors">
                <Linkedin className="h-3.5 w-3.5" />
                LinkedIn
              </a>
            )}
            {user.inaturalist && (
              <a href={`https://www.inaturalist.org/people/${user.inaturalist}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-green-600 transition-colors">
                <span className="text-xs">🌿</span>
                iNaturalist
              </a>
            )}
            {user.website && (
              <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-teal-600 transition-colors">
                <Globe className="h-3.5 w-3.5" />
                Sitio web
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <span className="font-bold text-stone-800 block">{stats.sightings_count}</span>
              <span className="text-stone-400 text-xs">Avistamientos</span>
            </div>
            <div className="text-center">
              <span className="font-bold text-stone-800 block">{stats.species_fav_count}</span>
              <span className="text-stone-400 text-xs">Especies favoritas</span>
            </div>
            <div className="text-center">
              <span className="font-bold text-stone-800 block">{stats.photos_count}</span>
              <span className="text-stone-400 text-xs">Fotos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-stone-200 mb-6">
        <div className="flex gap-0">
          {(['fotos', 'favoritas', 'avistamientos'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-t-2 -mt-px transition-colors',
                tab === t
                  ? 'border-stone-800 text-stone-800'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
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
            <div className="text-center py-16 text-stone-400">
              <Camera className="h-12 w-12 mx-auto mb-3 text-stone-200" />
              <p>Aún no hay fotos</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative aspect-square group overflow-hidden bg-stone-100"
                >
                  <img
                    src={photo.url}
                    alt={photo.species_common_name ?? 'Foto'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    style={photo.license === 'view_only' ? { pointerEvents: 'none' } as React.CSSProperties : {}}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
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
            <div className="text-center py-16 text-stone-400">
              <Heart className="h-12 w-12 mx-auto mb-3 text-stone-200" />
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
                    populationTrend: 'desconocida' as any,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Avistamientos */}
      {tab === 'avistamientos' && (
        <div className="space-y-3">
          {sightings.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <Eye className="h-12 w-12 mx-auto mb-3 text-stone-200" />
              <p>Aún no hay avistamientos</p>
            </div>
          ) : (
            sightings.map((s) => (
              <Link
                key={s.id}
                href={`/especies/${s.speciesSlug}`}
                className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 hover:border-teal-300 transition-colors"
              >
                {s.photo_url && (
                  <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
                    <img src={s.photo_url} alt={s.commonName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 text-sm truncate">{s.commonName}</p>
                  <p className="text-xs italic text-stone-400 truncate">{s.scientificName}</p>
                  <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(s.observed_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {s.region_code && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {s.region_code}
                      </span>
                    )}
                  </div>
                </div>
                <span className={cn(
                  'flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                  s.verified
                    ? 'bg-teal-50 text-teal-700'
                    : 'bg-amber-50 text-amber-700'
                )}>
                  {s.verified ? 'Verificado' : 'Pendiente'}
                </span>
              </Link>
            ))
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
            <div className={cn('rounded-2xl overflow-hidden bg-stone-900', selectedPhoto.license === 'view_only' && 'select-none')}>
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
                  <div className="flex gap-3 mt-1 text-xs text-stone-400">
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
                      : 'bg-stone-700 text-stone-200 hover:bg-red-500 hover:text-white'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h2 className="font-bold text-stone-800">Editar perfil</h2>
              <button onClick={() => setEditOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Avatar upload */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-teal-100 bg-stone-100 flex-shrink-0">
                  {(avatarPreview ?? currentAvatarUrl) ? (
                    <img src={avatarPreview ?? currentAvatarUrl!} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-teal-300">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 font-medium"
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
                <label className="block text-xs font-medium text-stone-500 mb-1">Nombre</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value.slice(0, 200))}
                  rows={3}
                  placeholder="Cuéntanos sobre ti…"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-right text-xs text-stone-400">{editBio.length}/200</p>
              </div>

              {[
                { label: 'Instagram', icon: <Instagram className="h-3.5 w-3.5" />, value: editInstagram, set: setEditInstagram, placeholder: '@usuario' },
                { label: 'Twitter / X', icon: <Twitter className="h-3.5 w-3.5" />, value: editTwitter, set: setEditTwitter, placeholder: '@usuario' },
                { label: 'LinkedIn', icon: <Linkedin className="h-3.5 w-3.5" />, value: editLinkedin, set: setEditLinkedin, placeholder: 'URL o usuario' },
                { label: 'iNaturalist', icon: <span className="text-xs">🌿</span>, value: editInaturalist, set: setEditInaturalist, placeholder: 'nombre de usuario' },
                { label: 'Sitio web', icon: <Globe className="h-3.5 w-3.5" />, value: editWebsite, set: setEditWebsite, placeholder: 'https://…' },
              ].map(({ label, icon, value, set, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-stone-500 mb-1">{label}</label>
                  <div className="flex items-center rounded-lg border border-stone-300 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500">
                    <span className="pl-3 pr-2 text-stone-400">{icon}</span>
                    <input
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder}
                      className="flex-1 px-2 py-2 text-sm text-stone-800 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 p-5 border-t border-stone-100">
              <button
                onClick={() => setEditOpen(false)}
                className="flex-1 rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveProfile}
                disabled={savingProfile}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-60 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                {savingProfile
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Guardando…</>
                  : <><CheckCircle className="h-4 w-4" />Guardar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
