import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'

export const metadata = {
  title: 'Sobre Rayen',
  description: 'Rayen es un proyecto personal sin fines de lucro creado por Ángel Pereda Jiménez para acercar la biodiversidad nativa de Chile a todas las personas.',
}

export default function SobrePage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">

      <h1 className="text-4xl font-bold text-stone-900 mb-6">Sobre Rayen</h1>

      <p className="text-lg text-stone-600 leading-relaxed mb-12">
        Rayen es un proyecto personal sin fines de lucro creado por Ángel Pereda Jiménez,
        con el objetivo de acercar la biodiversidad nativa de Chile a todas las personas.
        No tiene financiamiento comercial ni publicidad.
      </p>

      <Section title="La visión">
        <p className="text-stone-600 leading-relaxed">
          Chile tiene una de las biodiversidades más únicas del planeta, pero la mayoría
          de sus habitantes no la conoce. Rayen nació para cambiar eso — para que cada
          chileno pueda conocer, valorar y proteger las especies que comparten su territorio.
        </p>
      </Section>

      <Section title="El creador">
        <p className="text-stone-600 leading-relaxed mb-3">
          Ángel Pereda Jiménez — Santiago de Chile.
        </p>
        <a
          href="mailto:angelperedajimenez@gmail.com"
          className="inline-flex items-center gap-2 text-neon-600 hover:text-neon-500 transition-colors text-sm font-medium"
        >
          <Mail className="h-4 w-4" />
          angelperedajimenez@gmail.com
        </a>
      </Section>

      <Section title="¿Quieres colaborar?">
        <p className="text-stone-600 leading-relaxed mb-3">
          Si eres biólogo, fotógrafo, educador o simplemente te apasiona la naturaleza
          chilena, escríbeme a{' '}
          <a
            href="mailto:angelperedajimenez@gmail.com"
            className="text-neon-600 hover:text-neon-500 transition-colors"
          >
            angelperedajimenez@gmail.com
          </a>
          . Rayen crece con cada persona que se suma.
        </p>
      </Section>

      <div className="mt-12">
        <Link
          href="/especies"
          className="inline-flex items-center gap-2 bg-neon-400 hover:bg-neon-300 text-black font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Explorar especies
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-stone-800 mb-3 pb-2 border-b border-stone-100">
        {title}
      </h2>
      {children}
    </section>
  )
}
