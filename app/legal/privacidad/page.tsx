import { Shield } from 'lucide-react'

export const metadata = { title: 'Política de privacidad — Rayen' }

export default function PrivacidadPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Política de privacidad</h1>
          <p className="text-sm text-stone-400 mt-0.5">Última actualización: abril 2026</p>
        </div>
      </div>

      <div className="prose prose-stone max-w-none space-y-6 text-stone-700">

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Quiénes somos</h2>
          <p className="text-sm leading-relaxed">
            Rayen es una plataforma sin fines de lucro dedicada a la conservación y difusión de la biodiversidad nativa de Chile.
            No somos una empresa comercial ni vendemos productos o servicios.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Datos que recopilamos</h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc pl-5">
            <li><strong>Cuenta:</strong> nombre y correo electrónico obtenidos de tu cuenta de Google al iniciar sesión mediante Google OAuth.</li>
            <li><strong>Avistamientos:</strong> ubicación geográfica, fecha, especie observada y fotos que tú eliges compartir voluntariamente.</li>
            <li><strong>Perfil:</strong> información biográfica opcional que tú ingresas (bio, redes sociales, foto de perfil).</li>
            <li><strong>Uso:</strong> registros básicos de actividad para mejorar la plataforma (páginas visitadas, errores reportados).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Cómo usamos tus datos</h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc pl-5">
            <li>Mostrar avistamientos verificados en el mapa público de Rayen.</li>
            <li>Atribuir correctamente tus contribuciones (fotos, avistamientos) a tu perfil.</li>
            <li>Mejorar la experiencia de la plataforma y corregir errores.</li>
            <li>Enviarte notificaciones relacionadas con tus avistamientos (verificación, comentarios).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Lo que no hacemos</h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc pl-5">
            <li>No vendemos ni cedemos tus datos a terceros con fines comerciales.</li>
            <li>No mostramos publicidad personalizada.</li>
            <li>No compartimos tu correo electrónico con otros usuarios.</li>
            <li>No usamos tus datos para perfilado comercial.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Almacenamiento y seguridad</h2>
          <p className="text-sm leading-relaxed">
            Los datos se almacenan en Supabase (PostgreSQL) con cifrado en reposo. Las fotos se guardan en Cloudinary con acceso controlado.
            Usamos HTTPS para todas las comunicaciones.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Tus derechos</h2>
          <p className="text-sm leading-relaxed">
            Puedes solicitar la eliminación de tu cuenta y todos los datos asociados escribiéndonos a{' '}
            <a href="mailto:angelperedajimenez@gmail.com" className="text-teal-600 hover:underline">
              angelperedajimenez@gmail.com
            </a>.
            Respondemos en un plazo máximo de 7 días hábiles.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Cookies</h2>
          <p className="text-sm leading-relaxed">
            Usamos una cookie de sesión segura (HttpOnly) para mantener tu inicio de sesión. No usamos cookies de rastreo ni de publicidad.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">Contacto</h2>
          <p className="text-sm leading-relaxed">
            Para cualquier consulta sobre privacidad: {' '}
            <a href="mailto:angelperedajimenez@gmail.com" className="text-teal-600 hover:underline">
              angelperedajimenez@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  )
}
