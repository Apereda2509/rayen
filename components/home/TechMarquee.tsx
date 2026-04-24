const TECHS = [
  { name: 'Next.js',       icon: 'https://cdn.simpleicons.org/nextdotjs' },
  { name: 'Vercel',        icon: 'https://cdn.simpleicons.org/vercel' },
  { name: 'Supabase',      icon: 'https://cdn.simpleicons.org/supabase' },
  { name: 'Mapbox',        icon: 'https://cdn.simpleicons.org/mapbox' },
  { name: 'Framer Motion', icon: 'https://cdn.simpleicons.org/framer' },
  { name: 'Tailwind CSS',  icon: 'https://cdn.simpleicons.org/tailwindcss' },
  { name: 'TypeScript',    icon: 'https://cdn.simpleicons.org/typescript' },
  { name: 'Claude',        icon: 'https://cdn.simpleicons.org/anthropic' },
]

// Exactamente dos copias para loop seamless
const ITEMS = [...TECHS, ...TECHS]

export function TechMarquee() {
  return (
    <section className="bg-[#0A0A0A] border-t border-b border-zinc-800 py-16">
      {/* Título */}
      <p className="text-center font-inter text-sm text-zinc-500 uppercase tracking-widest mb-10">
        Construido con
      </p>

      {/* Marquee */}
      <div
        className="overflow-hidden relative"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        }}
      >
        {/*
          Clave para loop seamless sin glitch:
          - Sin gap en el flex (gap crea espacio entre set1 y set2 diferente al interno)
          - padding-left en cada item: el espacio va ANTES de cada item
          - Así set1 width = 8 × (pl + item_width) y translateX(-50%) cae
            exactamente al inicio del item1 del set2
          - will-change: transform fuerza GPU y elimina el flash
        */}
        <div
          style={{
            display: 'flex',
            flexShrink: 0,
            width: 'fit-content',
            animation: 'marquee 20s linear infinite',
            willChange: 'transform',
          }}
        >
          {ITEMS.map((tech, i) => (
            <div
              key={i}
              className="flex items-center flex-shrink-0"
              style={{ paddingLeft: '4rem', gap: '0.5rem' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tech.icon}
                alt=""
                height={28}
                width={28}
                className="tech-logo"
                aria-hidden="true"
              />
              <span className="font-inter text-sm text-zinc-500 whitespace-nowrap">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
