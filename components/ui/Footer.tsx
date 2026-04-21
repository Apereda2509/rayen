import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-teal-900 text-emerald-100/80 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <RayenFlower className="h-6 w-6 text-emerald-400" />
              <span className="text-lg font-semibold text-white tracking-wide">Rayen</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              Chile florece cuando lo conocemos. Plataforma abierta de biodiversidad,
              construida con la comunidad y respaldada por instituciones científicas.
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Explorar</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="/mapa" className="hover:text-white transition-colors">Mapa interactivo</Link></li>
              <li><Link href="/especies" className="hover:text-white transition-colors">Especies</Link></li>
              <li><Link href="/comunidad" className="hover:text-white transition-colors">Comunidad</Link></li>
              <li><Link href="/educacion" className="hover:text-white transition-colors">Educación</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Proyecto</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="/sobre" className="hover:text-white transition-colors">Sobre Rayen</Link></li>
              <li><Link href="/contribuir" className="hover:text-white transition-colors">Contribuir</Link></li>
              <li>
                <a href="https://github.com/rayen-app/rayen" target="_blank" rel="noopener" className="hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
              <li><Link href="/legal" className="hover:text-white transition-colors">Términos y privacidad</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-teal-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p>
            © {new Date().getFullYear()} Rayen — Hecho en Chile bajo licencia abierta.
          </p>
          <p className="italic">
            <span className="font-medium">rayen</span> (mapudungun) — flor
          </p>
        </div>
      </div>
    </footer>
  )
}

function RayenFlower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.95" />
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180
        const cx = 12 + Math.cos(rad) * 5.5
        const cy = 12 + Math.sin(rad) * 5.5
        return <circle key={angle} cx={cx} cy={cy} r="3" fill="currentColor" opacity="0.75" />
      })}
    </svg>
  )
}
