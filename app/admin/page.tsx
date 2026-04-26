'use client'

import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const speciesByType = [
  { tipo: 'Mamífero', cantidad: 11 },
  { tipo: 'Ave', cantidad: 9 },
  { tipo: 'Planta', cantidad: 8 },
  { tipo: 'Reptil', cantidad: 2 },
  { tipo: 'Insecto', cantidad: 2 },
  { tipo: 'Pez', cantidad: 2 },
  { tipo: 'Anfibio', cantidad: 1 },
]

const uicnData = [
  { name: 'LC', value: 12, color: '#4ade80' },
  { name: 'VU', value: 9,  color: '#facc15' },
  { name: 'EN', value: 8,  color: '#f97316' },
  { name: 'CR', value: 4,  color: '#ef4444' },
  { name: 'NT', value: 1,  color: '#a3e635' },
  { name: 'NE', value: 1,  color: '#71717a' },
]

const peticiones = [
  { titulo: 'Restaurar el humedal Carlos Anwandter', firmas: 1, meta: 10000 },
  { titulo: 'Proteger el hábitat del Huemul en Patagonia', firmas: 0, meta: 5000 },
  { titulo: 'Prohibir especies exóticas invasoras', firmas: 0, meta: 8000 },
]

const acciones = [
  { label: 'Moderar avistamientos', href: '/admin/avistamientos', desc: '54 en el sistema', color: 'text-blue-400' },
  { label: 'Revisar fotos', href: '/admin/fotos', desc: 'Candidatas a áreas', color: 'text-purple-400' },
  { label: 'Gestionar peticiones', href: '/admin/petitions', desc: '3 activas', color: 'text-[#00E676]' },
  { label: 'Ver usuarios', href: '/admin/usuarios', desc: '3 registrados', color: 'text-orange-400' },
  { label: 'Revisar errores', href: '/admin/errores', desc: '0 pendientes', color: 'text-red-400' },
]

export default function AdminPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-space-grotesk font-bold text-3xl text-white">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Panel de administración — Rayen</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Especies */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="inline-flex items-center justify-center bg-[#00E676]/10 rounded-lg p-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2C10 2 4 6 4 11a6 6 0 0012 0c0-5-6-9-6-9z" stroke="#00E676" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M10 11v5" stroke="#00E676" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-zinc-500 text-xs mt-3">Especies</p>
          <p className="font-space-grotesk font-bold text-3xl text-white mt-1">35</p>
          <p className="text-zinc-600 text-xs mt-1">publicadas</p>
        </div>

        {/* Avistamientos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="inline-flex items-center justify-center bg-[#00E676]/10 rounded-lg p-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <ellipse cx="10" cy="10" rx="9" ry="5.5" stroke="#00E676" strokeWidth="1.5" />
              <circle cx="10" cy="10" r="3" fill="#00E676" />
            </svg>
          </div>
          <p className="text-zinc-500 text-xs mt-3">Avistamientos</p>
          <p className="font-space-grotesk font-bold text-3xl text-white mt-1">54</p>
          <p className="text-zinc-600 text-xs mt-1">registrados</p>
        </div>

        {/* Usuarios */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="inline-flex items-center justify-center bg-[#00E676]/10 rounded-lg p-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7" r="3.5" stroke="#00E676" strokeWidth="1.5" />
              <path d="M3 18c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="#00E676" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-zinc-500 text-xs mt-3">Usuarios</p>
          <p className="font-space-grotesk font-bold text-3xl text-white mt-1">3</p>
          <p className="text-zinc-600 text-xs mt-1">registrados</p>
        </div>

        {/* Áreas protegidas */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="inline-flex items-center justify-center bg-[#00E676]/10 rounded-lg p-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2l2 5h5l-4 3 1.5 5L10 12l-4.5 3L7 10 3 7h5L10 2z" stroke="#00E676" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-zinc-500 text-xs mt-3">Áreas protegidas</p>
          <p className="font-space-grotesk font-bold text-3xl text-white mt-1">46</p>
          <p className="text-zinc-600 text-xs mt-1">en el sistema</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Barras: Especies por tipo */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-space-grotesk font-semibold text-white text-base mb-6">Especies por tipo</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={speciesByType} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="tipo" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff' }}
                cursor={{ fill: '#27272a' }}
              />
              <Bar dataKey="cantidad" fill="#00E676" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut: UICN */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-space-grotesk font-semibold text-white text-base mb-6">Especies por estado UICN</h2>
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={uicnData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {uicnData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff' }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#a1a1aa', fontSize: '12px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Texto central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-10px' }}>
              <span className="font-space-grotesk font-bold text-2xl text-white">35</span>
              <span className="text-zinc-500 text-xs">especies</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fila inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peticiones */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-space-grotesk font-semibold text-white text-base mb-6">Peticiones activas</h2>
          <div className="space-y-4">
            {peticiones.map((p, i) => (
              <div key={i} className={i < peticiones.length - 1 ? 'pb-4 border-b border-zinc-800' : ''}>
                <p className="text-white text-sm font-medium line-clamp-1 mb-2">{p.titulo}</p>
                <div className="bg-zinc-800 rounded-full h-2 w-full">
                  <div
                    className="bg-[#00E676] rounded-full h-2"
                    style={{ width: `${Math.max((p.firmas / p.meta) * 100, 0.5)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>{p.firmas.toLocaleString()} firmas</span>
                  <span>Meta: {p.meta.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-space-grotesk font-semibold text-white text-base mb-6">Acciones rápidas</h2>
          <div className="flex flex-col gap-0">
            {acciones.map(({ label, href, desc, color }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0 group"
              >
                <div>
                  <p className="text-white text-sm">{label}</p>
                  <p className="text-zinc-500 text-xs">{desc}</p>
                </div>
                <span className={`${color} group-hover:translate-x-1 transition-transform`}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
