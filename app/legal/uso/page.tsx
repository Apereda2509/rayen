import { FileText } from 'lucide-react'

export const metadata = { title: 'Políticas de uso — Rayen' }

export default function UsoPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Políticas de uso</h1>
          <p className="text-sm text-stone-400 mt-0.5">Última actualización: abril 2026</p>
        </div>
      </div>

      <div className="prose prose-stone max-w-none space-y-6 text-stone-700">

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Propósito de la plataforma</h2>
          <p className="text-sm leading-relaxed">
            Rayen es un espacio de ciencia ciudadana y conservación. Su objetivo es documentar la biodiversidad nativa de Chile
            y construir una comunidad comprometida con el medio ambiente. El uso de la plataforma implica aceptar estas políticas.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Contenido apropiado</h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc pl-5">
            <li>Solo se aceptan avistamientos de especies nativas o naturalizadas en Chile.</li>
            <li>Las fotos deben corresponder a la especie reportada y haber sido tomadas por el usuario que las sube.</li>
            <li>No se permite subir fotos explícitas, violentas o que vulneren la dignidad de personas o animales.</li>
            <li>Los reportes falsos o malintencionados serán eliminados y pueden resultar en suspensión de la cuenta.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Respeto a la naturaleza</h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc pl-5">
            <li>No reportes ubicaciones exactas de especies amenazadas que puedan facilitar su caza o captura.</li>
            <li>Al observar especies silvestres, mantén la distancia y no interfieras con su comportamiento.</li>
            <li>Rayen promueve la observación ética: sin molestar, sin alimentar, sin capturar.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Propiedad intelectual de las fotos</h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc pl-5">
            <li>Al subir una foto a Rayen confirmas que eres el autor o tienes los derechos necesarios para compartirla.</li>
            <li>Puedes elegir licencia <em>pública</em> (otros pueden descargar) o <em>solo visualización</em> (se muestra pero no se puede descargar).</li>
            <li>Rayen no reclamará derechos de propiedad sobre tus fotos. Seguirán siendo tuyas.</li>
            <li>No está permitido subir fotos con copyright de terceros sin su autorización explícita.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Comportamiento en la comunidad</h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc pl-5">
            <li>Trato respetuoso hacia todos los usuarios, independiente del nivel de experiencia.</li>
            <li>No spam, autopromoción no solicitada ni contenido comercial.</li>
            <li>No suplantación de identidad de otras personas o cuentas.</li>
            <li>Los perfiles deben representar a personas reales; no se permiten bots automatizados.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Moderación</h2>
          <p className="text-sm leading-relaxed">
            El equipo de Rayen puede editar, ocultar o eliminar cualquier contenido que no cumpla estas políticas,
            así como suspender cuentas en casos graves o reincidentes. Ante dudas puedes escribirnos a{' '}
            <a href="mailto:angelperedajimenez@gmail.com" className="text-teal-600 hover:underline">
              angelperedajimenez@gmail.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Cambios a estas políticas</h2>
          <p className="text-sm leading-relaxed">
            Podemos actualizar estas políticas en cualquier momento. Los cambios significativos serán notificados
            a los usuarios registrados. El uso continuo de la plataforma implica aceptación de las políticas vigentes.
          </p>
        </section>
      </div>
    </main>
  )
}
