import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos de Uso — Rayen',
  description: 'Términos de uso de Rayen, plataforma chilena de biodiversidad.',
}

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-6 py-20">

        {/* Encabezado */}
        <div className="mb-14">
          <p className="font-grotesk text-neon-400 text-sm font-medium uppercase tracking-wider mb-4">
            Rayen
          </p>
          <h1 className="font-grotesk text-5xl font-bold text-white leading-tight">
            Términos de Uso
          </h1>
          <p className="mt-4 text-zinc-500 text-sm">
            Última actualización: abril 2026
          </p>
        </div>

        {/* Secciones */}
        <div className="space-y-12 text-zinc-300 leading-relaxed">

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Propósito de la plataforma
            </h2>
            <p>
              Rayen es un espacio de ciencia ciudadana y conservación. Su objetivo es documentar
              la biodiversidad nativa de Chile y construir una comunidad comprometida con el medio
              ambiente. El uso de la plataforma implica aceptar estos términos.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Contenido apropiado
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Solo se aceptan avistamientos de especies nativas o naturalizadas en Chile.</li>
              <li>Las fotos deben corresponder a la especie reportada y haber sido tomadas por el usuario que las sube.</li>
              <li>No se permite subir fotos explícitas, violentas o que vulneren la dignidad de personas o animales.</li>
              <li>Los reportes falsos o malintencionados serán eliminados y pueden resultar en suspensión de la cuenta.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Respeto a la naturaleza
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>No reportes ubicaciones exactas de especies amenazadas que puedan facilitar su caza o captura.</li>
              <li>Al observar especies silvestres, mantén la distancia y no interfieras con su comportamiento.</li>
              <li>Rayen promueve la observación ética: sin molestar, sin alimentar, sin capturar.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Propiedad intelectual de las fotos
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Al subir una foto a Rayen confirmas que eres el autor o tienes los derechos necesarios para compartirla.</li>
              <li>Puedes elegir licencia <em>pública</em> (otros pueden descargar) o <em>solo visualización</em> (se muestra pero no se puede descargar).</li>
              <li>Rayen no reclamará derechos de propiedad sobre tus fotos. Seguirán siendo tuyas.</li>
              <li>No está permitido subir fotos con copyright de terceros sin su autorización explícita.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Comportamiento en la comunidad
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Trato respetuoso hacia todos los usuarios, independiente del nivel de experiencia.</li>
              <li>No spam, autopromoción no solicitada ni contenido comercial.</li>
              <li>No suplantación de identidad de otras personas o cuentas.</li>
              <li>Los perfiles deben representar a personas reales; no se permiten bots automatizados.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Moderación
            </h2>
            <p>
              El equipo de Rayen puede editar, ocultar o eliminar cualquier contenido que no cumpla
              estos términos, así como suspender cuentas en casos graves o reincidentes. Ante dudas
              puedes escribirnos a{' '}
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
              Cambios a estos términos
            </h2>
            <p>
              Podemos actualizar estos términos en cualquier momento. Los cambios significativos
              serán notificados a los usuarios registrados. El uso continuo de la plataforma
              implica aceptación de los términos vigentes.
            </p>
          </section>

        </div>

        {/* Nav entre páginas legales */}
        <div className="mt-16 pt-8 border-t border-zinc-800 flex items-center justify-between text-sm">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Volver al inicio
          </Link>
          <Link href="/privacidad" className="text-neon-400 hover:underline underline-offset-4">
            Política de privacidad →
          </Link>
        </div>

      </div>
    </main>
  )
}
