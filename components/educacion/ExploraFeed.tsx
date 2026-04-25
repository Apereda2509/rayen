'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface Articulo {
  id: string
  slug: string
  titulo: string
  subtitulo: string | null
  imagen_url: string | null
  tiempo_lectura: number
}

function PatronSVG() {
  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="diag" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="20" stroke="#27272a" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#diag)" />
    </svg>
  )
}

function ArticuloCard({ articulo, index }: { articulo: Articulo; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.07 }}
    >
      <Link href={`/educacion/explora/${articulo.slug}`} className="group block">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group-hover:border-zinc-700 group-hover:scale-[1.02] transition-all duration-300 cursor-pointer">
          {/* Imagen */}
          <div className="relative aspect-video w-full overflow-hidden">
            {articulo.imagen_url ? (
              <Image
                src={articulo.imagen_url}
                alt={articulo.titulo}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-800">
                <PatronSVG />
              </div>
            )}

            {/* Overlay degradado */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/30 to-transparent" />

            {/* Badge categoría top-left */}
            <span className="absolute top-3 left-3 bg-black/60 text-zinc-300 text-[10px] rounded-full px-2.5 py-1 backdrop-blur-sm">
              Artículo
            </span>

            {/* Badge tiempo de lectura top-right */}
            <span className="absolute top-3 right-3 bg-black/60 text-zinc-300 text-[10px] rounded-full px-2.5 py-1 backdrop-blur-sm">
              {articulo.tiempo_lectura} min
            </span>
          </div>

          {/* Contenido */}
          <div className="p-5">
            <h2
              className="font-semibold text-white text-base line-clamp-2 leading-snug"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              {articulo.titulo}
            </h2>
            {articulo.subtitulo && (
              <p
                className="text-zinc-400 text-sm line-clamp-3 mt-2 leading-relaxed"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                {articulo.subtitulo}
              </p>
            )}

            {/* Footer */}
            <div className="border-t border-zinc-800 mt-3 pt-3">
              <span className="text-[#00E676] text-xs font-medium">
                Leer artículo →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function ExploraFeed({ articulos }: { articulos: Articulo[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {articulos.map((a, i) => (
        <ArticuloCard key={a.id} articulo={a} index={i} />
      ))}
    </div>
  )
}
