'use client'

import { useState } from 'react'
import { Plus, Power, PowerOff, FileSignature } from 'lucide-react'

interface AdminPetition {
  id: string
  slug: string
  title: string
  description: string | null
  goal: number
  signedCount: number
  active: boolean
  imageUrl: string | null
  endsAt: string | null
  createdAt: string
  speciesName: string | null
  speciesSlug: string | null
}

interface Props {
  initialPetitions: AdminPetition[]
}

const EMPTY_FORM = {
  title: '', description: '', goal: '1000',
  imageUrl: '', speciesSlug: '', endsAt: '',
}

export function PetitionAdminPanel({ initialPetitions }: Props) {
  const [petitions, setPetitions] = useState(initialPetitions)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/petitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          goal: Number(form.goal),
          imageUrl: form.imageUrl || null,
          speciesSlug: form.speciesSlug || null,
          endsAt: form.endsAt || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al crear petición'); return }

      const listRes = await fetch('/api/admin/petitions')
      const listData = await listRes.json()
      setPetitions(listData.data)
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch {
      setError('Error de red')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(petition: AdminPetition) {
    setToggling(petition.id)
    try {
      const res = await fetch(`/api/admin/petitions/${petition.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !petition.active }),
      })
      if (res.ok) {
        setPetitions(prev =>
          prev.map(p => p.id === petition.id ? { ...p, active: !p.active } : p)
        )
      }
    } finally {
      setToggling(null)
    }
  }

  const active = petitions.filter(p => p.active)
  const inactive = petitions.filter(p => !p.active)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Peticiones</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {active.length} activa{active.length !== 1 ? 's' : ''} · {inactive.length} inactiva{inactive.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          className="inline-flex items-center gap-2 bg-[#00E676] hover:opacity-90 text-black text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva petición
        </button>
      </div>

      {/* Formulario de creación */}
      {showForm && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">Nueva petición</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Título <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00E676]/50 placeholder-zinc-600"
                placeholder="Título de la petición"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1">Descripción</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00E676]/50 resize-none placeholder-zinc-600"
                placeholder="Descripción detallada de la petición..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Meta de firmas <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.goal}
                onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00E676]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Slug especie (opcional)</label>
              <input
                type="text"
                value={form.speciesSlug}
                onChange={e => setForm(f => ({ ...f, speciesSlug: e.target.value }))}
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00E676]/50 placeholder-zinc-600"
                placeholder="ej: huemul"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">URL imagen (opcional)</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00E676]/50 placeholder-zinc-600"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Fecha de cierre (opcional)</label>
              <input
                type="date"
                value={form.endsAt}
                onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))}
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00E676]/50"
              />
            </div>

            {error && (
              <div className="sm:col-span-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(null); setForm(EMPTY_FORM) }}
                className="px-4 py-2 text-sm text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-xl hover:border-zinc-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-black bg-[#00E676] hover:opacity-90 rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Crear petición'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de peticiones */}
      {petitions.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <FileSignature className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No hay peticiones creadas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {petitions.map(p => (
            <div
              key={p.id}
              className={`rounded-2xl border p-4 transition-all ${
                p.active
                  ? 'bg-zinc-900 border-zinc-800'
                  : 'bg-zinc-900 border-zinc-800 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Imagen thumb */}
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="h-14 w-20 rounded-lg object-cover flex-shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-white text-sm leading-snug">
                        {p.title}
                      </h3>
                      {p.speciesName && (
                        <p className="text-xs text-[#00E676] mt-0.5">{p.speciesName}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      p.active ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {p.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00E676] rounded-full"
                          style={{ width: `${Math.min((p.signedCount / p.goal) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500">
                        {p.signedCount.toLocaleString('es-CL')} / {p.goal.toLocaleString('es-CL')} firmas
                      </span>
                    </div>
                    {p.endsAt && (
                      <span className="text-xs text-zinc-500">
                        Cierra: {new Date(p.endsAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Toggle activo */}
                <button
                  onClick={() => handleToggle(p)}
                  disabled={toggling === p.id}
                  title={p.active ? 'Desactivar petición' : 'Activar petición'}
                  className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                    p.active
                      ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
                      : 'text-zinc-500 hover:text-[#00E676] hover:bg-[#00E676]/10'
                  }`}
                >
                  {p.active
                    ? <PowerOff className="h-4 w-4" />
                    : <Power className="h-4 w-4" />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
