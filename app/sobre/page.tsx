import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'

export const metadata = {
  title: 'Sobre Rayen',
  description: 'Rayen es un proyecto personal sin fines de lucro creado por Ángel Pereda Jiménez para acercar la biodiversidad nativa de Chile a todas las personas.',
}

export default function SobrePage() {
  return (
    <main>
      {/* Contenido principal */}
      <div className="max-w-2xl mx-auto px-4 py-16">

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

      </div>

      {/* Manual de Marca */}
      <section className="bg-zinc-950">
        <div className="max-w-2xl mx-auto px-4 py-16">

          <h2 className="font-grotesk text-3xl font-bold text-white mb-2">Manual de Marca</h2>
          <p className="text-zinc-400 text-sm mb-14">
            Las decisiones visuales de Rayen no son estética por estética — cada una tiene una razón.
          </p>

          {/* El nombre */}
          <BrandBlock title="El nombre">
            <p className="text-zinc-300 leading-relaxed">
              Rayen viene del mapudungun y significa flor. Cinco letras, sin acentos, pronunciable
              en español e inglés. Una palabra del pueblo originario más presente en Chile, porque
              este proyecto es sobre la naturaleza de este territorio — y esa naturaleza tiene nombres
              que preceden al español por siglos.
            </p>
          </BrandBlock>

          {/* El logo */}
          <BrandBlock title="El logo">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* SVG del Grid Bloom */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 py-10 px-6 gap-4">
                <svg viewBox="0 0 40 40" fill="none" className="w-24 h-24" aria-hidden="true">
                  <circle cx="20" cy="20" r="3.5" fill="#00E676" />
                  <circle cx="34"   cy="20"     r="5" fill="#00E676" opacity="0.85" />
                  <circle cx="27"   cy="32.12"  r="5" fill="#00E676" opacity="0.85" />
                  <circle cx="13"   cy="32.12"  r="5" fill="#00E676" opacity="0.85" />
                  <circle cx="6"    cy="20"     r="5" fill="#00E676" opacity="0.85" />
                  <circle cx="13"   cy="7.88"   r="5" fill="#00E676" opacity="0.85" />
                  <circle cx="27"   cy="7.88"   r="5" fill="#00E676" opacity="0.85" />
                </svg>
                <span className="font-grotesk text-xl font-semibold tracking-widest uppercase text-[#00E676]">
                  RAYEN
                </span>
              </div>
              {/* Descripción */}
              <p className="text-zinc-300 leading-relaxed">
                El Grid Bloom son siete nodos conectados: seis en anillo hexagonal, uno al centro.
                Representa una red de especies. La biodiversidad no es una lista — es un sistema
                donde todo está relacionado. Si sacas un nodo, el sistema cambia.
              </p>
            </div>
          </BrandBlock>

          {/* Paleta de colores */}
          <BrandBlock title="Colores">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  bg: 'bg-[#00E676]',
                  border: '',
                  name: 'Verde Neón',
                  hex: '#00E676',
                  use: 'Color primario. Acciones, links, elementos activos.',
                  textColor: 'text-black',
                  hexColor: 'text-black/70',
                },
                {
                  bg: 'bg-[#0A0A0A]',
                  border: 'border border-zinc-700',
                  name: 'Negro Profundo',
                  hex: '#0A0A0A',
                  use: 'Fondos principales. Da peso y seriedad.',
                  textColor: 'text-white',
                  hexColor: 'text-white/60',
                },
                {
                  bg: 'bg-white',
                  border: 'border border-zinc-300',
                  name: 'Blanco',
                  hex: '#FFFFFF',
                  use: 'Fondos secundarios. Texto sobre negro.',
                  textColor: 'text-black',
                  hexColor: 'text-black/50',
                },
                {
                  bg: 'bg-[#D85A30]',
                  border: '',
                  name: 'Coral',
                  hex: '#D85A30',
                  use: 'Solo para alertas. Especies en peligro crítico o en peligro.',
                  textColor: 'text-white',
                  hexColor: 'text-white/70',
                },
              ].map(({ bg, border, name, hex, use, textColor, hexColor }) => (
                <div key={hex} className="flex flex-col rounded-xl overflow-hidden">
                  <div className={`h-28 ${bg} ${border}`} />
                  <div className="pt-3 pb-1">
                    <p className={`text-xs font-semibold text-white`}>{name}</p>
                    <p className={`text-xs font-mono text-zinc-400 mt-0.5`}>{hex}</p>
                    <p className="text-xs text-zinc-500 mt-1 leading-snug">{use}</p>
                  </div>
                </div>
              ))}
            </div>
          </BrandBlock>

          {/* Tipografías */}
          <BrandBlock title="Tipografías">
            <div className="space-y-6">
              {/* Space Grotesk */}
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-5">
                <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Space Grotesk</span>
                  <span className="text-xs text-zinc-600">Títulos y logo</span>
                </div>
                <p className="font-grotesk text-4xl font-bold text-[#00E676] leading-none">RAYEN</p>
              </div>

              {/* Inter */}
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-5">
                <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Inter</span>
                  <span className="text-xs text-zinc-600">Interfaz y cuerpo</span>
                </div>
                <p className="text-xl text-zinc-300 leading-snug">
                  La biodiversidad de Chile en un solo lugar.
                </p>
              </div>

              {/* Lora */}
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-5">
                <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Lora</span>
                  <span className="text-xs text-zinc-600">Nombres científicos</span>
                </div>
                <p className="font-serif italic text-xl text-zinc-400 leading-snug">
                  Lapageria rosea
                </p>
              </div>
            </div>
          </BrandBlock>

          {/* Tono de voz */}
          <BrandBlock title="Tono de voz" last>
            <p className="text-zinc-300 leading-relaxed">
              Rayen habla de forma directa y cercana, sin tecnicismos innecesarios. No somos una
              institución — somos un proyecto independiente que cree que conocer la naturaleza es
              el primer paso para cuidarla. Usamos la segunda persona: tú, no usted. Preferimos
              frases cortas. Y nunca prometemos lo que aún no existe.
            </p>
          </BrandBlock>

        </div>
      </section>
    </main>
  )
}

// ── Componentes ───────────────────────────────────────────────

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

function BrandBlock({
  title,
  children,
  last = false,
}: {
  title: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div className={last ? 'pb-4' : 'pb-12 border-b border-zinc-800 mb-12'}>
      <h3 className="font-grotesk text-lg font-semibold text-white mb-5">{title}</h3>
      {children}
    </div>
  )
}
