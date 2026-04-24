import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-carbon-900 text-white/60 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <GridBloom className="h-6 w-6 text-neon-400" />
              <span className="font-grotesk text-lg font-semibold tracking-widest uppercase text-white">
                RAYEN
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              Chile florece cuando lo conocemos. Plataforma abierta de biodiversidad,
              construida con la comunidad y respaldada por instituciones científicas.
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Explorar</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="/mapa" className="hover:text-neon-400 transition-colors">Mapa interactivo</Link></li>
              <li><Link href="/especies" className="hover:text-neon-400 transition-colors">Especies</Link></li>
              <li><Link href="/comunidad" className="hover:text-neon-400 transition-colors">Comunidad</Link></li>
              <li><Link href="/educacion" className="hover:text-neon-400 transition-colors">Educación</Link></li>
              <li><Link href="/sobre" className="hover:text-neon-400 transition-colors">Sobre Rayen</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Proyecto</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="/sobre" className="hover:text-neon-400 transition-colors">Sobre Rayen</Link></li>
              <li><Link href="/contribuir" className="hover:text-neon-400 transition-colors">Contribuir</Link></li>
              <li>
                <a href="https://github.com/rayen-app/rayen" target="_blank" rel="noopener" className="hover:text-neon-400 transition-colors">
                  GitHub
                </a>
              </li>
              <li><Link href="/legal" className="hover:text-neon-400 transition-colors">Términos y privacidad</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p>
            © 2026 Rayen — Creado por Ángel Pereda Jiménez. Proyecto sin fines de lucro, hecho en Chile con amor por la naturaleza.
          </p>
          <p className="italic">
            <span className="font-medium">rayen</span> (mapudungun) — flor
          </p>
        </div>
      </div>
    </footer>
  )
}

// ── Grid Bloom — imagotipo RAYEN v2.0 ─────────────────────────
function GridBloom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      {/* Centro */}
      <circle cx="20" cy="20" r="3.5" fill="#00E676" />
      {/* Anillo hexagonal: 6 círculos r=5, órbita=14 */}
      <circle cx="34"    cy="20"     r="5" fill="#00E676" opacity="0.85" />
      <circle cx="27"    cy="32.12"  r="5" fill="#00E676" opacity="0.85" />
      <circle cx="13"    cy="32.12"  r="5" fill="#00E676" opacity="0.85" />
      <circle cx="6"     cy="20"     r="5" fill="#00E676" opacity="0.85" />
      <circle cx="13"    cy="7.88"   r="5" fill="#00E676" opacity="0.85" />
      <circle cx="27"    cy="7.88"   r="5" fill="#00E676" opacity="0.85" />
    </svg>
  )
}
