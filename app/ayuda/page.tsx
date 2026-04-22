import { HelpCircle, Mail } from 'lucide-react'

export const metadata = { title: 'Centro de ayuda — Rayen' }

export default function AyudaPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <HelpCircle className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900">Centro de ayuda</h1>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <p className="text-4xl mb-4">🌱</p>
        <p className="text-stone-600 mb-6">
          Estamos construyendo esta sección. Por cualquier consulta, duda o sugerencia, escríbenos directamente.
        </p>
        <a
          href="mailto:angelperedajimenez@gmail.com"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          <Mail className="h-4 w-4" />
          angelperedajimenez@gmail.com
        </a>
      </div>
    </main>
  )
}
