'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, animate, useReducedMotion } from 'framer-motion'
import { MapPin, AlertTriangle } from 'lucide-react'

interface StatDef {
  value: number
  label: string
  icon: typeof MapPin
  accent: 'neon' | 'coral'
  countDuration: number
  delay: number
}

function AnimatedNumber({
  to,
  duration,
  reduced,
}: {
  to: number
  duration: number
  reduced: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.4 })
  const [count, setCount] = useState(reduced ? to : 0)

  useEffect(() => {
    if (!isInView || reduced) return
    const controls = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setCount(Math.round(v)),
    })
    return () => controls.stop()
  }, [isInView, to, duration, reduced])

  return <span ref={ref}>{count.toLocaleString('es-CL')}</span>
}

function StatCard({
  stat,
  reduced,
}: {
  stat: StatDef
  reduced: boolean
}) {
  const Icon = stat.icon
  const iconColor = stat.accent === 'coral' ? 'text-coral-400' : 'text-neon-400'

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.6, ease: 'easeOut', delay: stat.delay }
      }
    >
      <Icon className={`h-6 w-6 mx-auto mb-2 ${iconColor}`} strokeWidth={1.5} />
      <p className="font-grotesk text-3xl font-bold text-white">
        <AnimatedNumber to={stat.value} duration={stat.countDuration} reduced={reduced} />
      </p>
      <p className="text-sm text-zinc-400 mt-1">{stat.label}</p>
    </motion.div>
  )
}

export function HomeStats({
  totalSpecies,
  endangered,
  endemic,
}: {
  totalSpecies: number
  endangered: number
  endemic: number
}) {
  const reduced = !!useReducedMotion()

  const stats: StatDef[] = [
    {
      value: totalSpecies,
      label: 'Especies documentadas',
      icon: MapPin,
      accent: 'neon',
      countDuration: 1.2,
      delay: 0,
    },
    {
      value: endangered,
      label: 'En peligro',
      icon: AlertTriangle,
      accent: 'coral',
      countDuration: 1.0,
      delay: 0.15,
    },
    {
      value: endemic,
      label: 'Endémicas de Chile',
      icon: MapPin,
      accent: 'neon',
      countDuration: 1.1,
      delay: 0.3,
    },
  ]

  return (
    <section className="bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} reduced={reduced} />
          ))}
        </div>
      </div>
    </section>
  )
}
