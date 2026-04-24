import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Rayen',
  description: 'Política de privacidad de Rayen, plataforma chilena de biodiversidad.',
}

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-6 py-20">

        {/* Encabezado */}
        <div className="mb-14">
          <p className="font-grotesk text-neon-400 text-sm font-medium uppercase tracking-wider mb-4">
            Rayen
          </p>
          <h1 className="font-grotesk text-5xl font-bold text-white leading-tight">
            Política de Privacidad
          </h1>
          <p className="mt-4 text-zinc-500 text-sm">
            Última actualización: abril 2026
          </p>
        </div>

        {/* Secciones */}
        <div className="space-y-12 text-zinc-300 leading-relaxed">

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Quiénes somos
            </h2>
            <p>
              Rayen es una plataforma sin fines de lucro dedicada a la conservación y difusión
              de la biodiversidad nativa de Chile. No somos una empresa comercial ni vendemos
              productos o servicios.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Datos que recopilamos
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong className="text-white">Cuenta:</strong> nombre y correo electrónico obtenidos de tu cuenta de Google al iniciar sesión mediante Google OAuth.</li>
              <li><strong className="text-white">Avistamientos:</strong> ubicación geográfica, fecha, especie observada y fotos que tú eliges compartir voluntariamente.</li>
              <li><strong className="text-white">Perfil:</strong> información biográfica opcional que tú ingresas (bio, redes sociales, foto de perfil).</li>
              <li><strong className="text-white">Uso:</strong> registros básicos de actividad para mejorar la plataforma (páginas visitadas, errores reportados).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Cómo usamos tus datos
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Mostrar avistamientos verificados en el mapa público de Rayen.</li>
              <li>Atribuir correctamente tus contribuciones (fotos, avistamientos) a tu perfil.</li>
              <li>Mejorar la experiencia de la plataforma y corregir errores.</li>
              <li>Enviarte notificaciones relacionadas con tus avistamientos (verificación, comentarios).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Lo que no hacemos
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>No vendemos ni cedemos tus datos a terceros con fines comerciales.</li>
              <li>No mostramos publicidad personalizada.</li>
              <li>No compartimos tu correo electrónico con otros usuarios.</li>
              <li>No usamos tus datos para perfilado comercial.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Almacenamiento y seguridad
            </h2>
            <p>
              Los datos se almacenan en Supabase (PostgreSQL) con cifrado en reposo. Las fotos
              se guardan en Cloudinary con acceso controlado. Usamos HTTPS para todas las
              comunicaciones.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Tus derechos
            </h2>
            <p>
              Puedes solicitar la eliminación de tu cuenta y todos los datos asociados
              escribiéndonos a{' '}
              <a
                href="mailto:angelperedajimenez@gmail.com"
                className="text-neon-400 hover:underline underline-offset-4"
              >
                angelperedajimenez@gmail.com
              </a>
              . Respondemos en un plazo máximo de 7 días hábiles.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Cookies
            </h2>
            <p>
              Usamos una cookie de sesión segura (HttpOnly) para mantener tu inicio de sesión.
              No usamos cookies de rastreo ni de publicidad.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl font-semibold text-white mb-3">
              Contacto
            </h2>
            <p>
              Para cualquier consulta sobre privacidad:{' '}
              <a
                href="mailto:angelperedajimenez@gmail.com"
                className="text-neon-400 font-mono hover:underline underline-offset-4"
              >
                angelperedajimenez@gmail.com
              </a>
            </p>
          </section>

        </div>

        {/* Nav entre páginas legales */}
        <div className="mt-16 pt-8 border-t border-zinc-800 flex items-center justify-between text-sm">
          <Link href="/terminos" className="text-neon-400 hover:underline underline-offset-4">
            ← Términos de Uso
          </Link>
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            Volver al inicio →
          </Link>
        </div>

      </div>
    </main>
  )
}
