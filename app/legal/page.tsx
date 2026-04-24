import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos y Privacidad — Rayen',
  description: 'Política de privacidad y términos de uso de Rayen, plataforma chilena de biodiversidad.',
}

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-6 py-20">

        {/* Encabezado */}
        <div className="mb-14">
          <p className="font-grotesk text-neon-400 text-sm font-medium uppercase tracking-wider mb-4">
            Rayen
          </p>
          <h1 className="font-grotesk text-5xl font-bold text-white leading-tight">
            Términos y Privacidad
          </h1>
          <p className="mt-4 text-zinc-500 text-sm">
            Última actualización: abril 2026
          </p>
        </div>

        {/* Secciones */}
        <div className="space-y-12 text-zinc-300 leading-relaxed">

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Sobre Rayen
            </h2>
            <p>
              Rayen es un proyecto personal sin fines de lucro creado por Ángel Pereda Jiménez.
              No tiene financiamiento comercial ni publicidad.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Datos que recopilamos
            </h2>
            <p>
              Si creas una cuenta, almacenamos tu correo electrónico y los avistamientos que
              reportas voluntariamente. No vendemos ni compartimos tus datos con terceros.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Avistamientos
            </h2>
            <p>
              Los avistamientos que reportas son públicos dentro de la plataforma. Al reportar
              un avistamiento aceptas que sea visible para otros usuarios de Rayen.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Cookies
            </h2>
            <p>
              Rayen usa cookies únicamente para mantener tu sesión activa. No usamos cookies
              de seguimiento ni publicidad.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Contenido
            </h2>
            <p>
              Todo el contenido de las fichas de especies está basado en fuentes públicas
              verificadas: SAG, Ministerio del Medio Ambiente e IUCN. Si encuentras un error,
              escríbenos a{' '}
              <a
                href="mailto:angelperedajimenez@gmail.com"
                className="text-neon-400 hover:underline underline-offset-4"
              >
                angelperedajimenez@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Contacto
            </h2>
            <p>Ángel Pereda Jiménez</p>
            <p className="mt-1">
              <a
                href="mailto:angelperedajimenez@gmail.com"
                className="text-neon-400 font-mono hover:underline underline-offset-4"
              >
                angelperedajimenez@gmail.com
              </a>
            </p>
          </section>

        </div>

        {/* Volver */}
        <div className="mt-16 pt-8 border-t border-zinc-800">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>

      </div>
    </main>
  )
}
