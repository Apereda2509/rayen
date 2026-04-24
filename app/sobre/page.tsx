import type { Metadata } from 'next'
import { SobreClient } from './SobreClient'

export const metadata: Metadata = {
  title: 'Sobre Rayen',
  description: 'Rayen es un proyecto independiente sin fines de lucro creado por Ángel Pereda Jiménez para acercar la biodiversidad de Chile a todas las personas.',
}

export default function SobrePage() {
  return <SobreClient />
}
