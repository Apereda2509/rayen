// app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Rayen — Biodiversidad Chilena',
    template: '%s | Rayen',
  },
  description: 'Chile florece cuando lo conocemos. Explora la fauna y flora nativa de Chile, conoce su estado de conservación y descubre cómo protegerla.',
  keywords: ['biodiversidad', 'Chile', 'fauna', 'flora', 'conservación', 'especies', 'mapa'],
  openGraph: {
    title: 'Rayen — Biodiversidad Chilena',
    description: 'Chile florece cuando lo conocemos.',
    url: 'https://rayen.app',
    siteName: 'Rayen',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rayen',
    description: 'Chile florece cuando lo conocemos.',
    creator: '@rayenchile',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
