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

// Duplicado para loop seamless
const ITEMS = [...TECHS, ...TECHS]

export function TechMarquee() {
  return (
    <section className="bg-[#0A0A0A] border-t border-b border-zinc-800 py-16 overflow-hidden">
      {/* Título */}
      <p className="text-center font-inter text-sm text-zinc-500 uppercase tracking-widest mb-10">
        Construido con
      </p>

      {/* Marquee */}
      <div
        className="overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        }}
      >
        <div className="flex w-max animate-marquee">
          {ITEMS.map((tech, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-8"
              style={{ gap: '0.5rem', padding: '0 2rem' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tech.icon}
                alt={tech.name}
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
