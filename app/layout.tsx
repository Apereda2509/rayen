// app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { CustomCursor } from '@/components/ui/CustomCursor'
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
  metadataBase: new URL('https://rayen.app'),
  title: {
    default: 'Rayen — Biodiversidad de Chile',
    template: '%s | Rayen',
  },
  description: 'Fichas de especies, mapas interactivos y formas concretas de actuar por la biodiversidad nativa de Chile. Un proyecto independiente con fuentes verificadas.',
  keywords: ['biodiversidad Chile', 'especies nativas Chile', 'conservación Chile', 'fauna chilena', 'flora chilena', 'áreas protegidas Chile'],
  authors: [{ name: 'Ángel Pereda Jiménez' }],
  creator: 'Ángel Pereda Jiménez',
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: 'https://rayen.app',
    siteName: 'Rayen',
    title: 'Rayen — Biodiversidad de Chile',
    description: 'Fichas de especies, mapas interactivos y formas concretas de actuar por la biodiversidad nativa de Chile.',
    images: [{
      url: '/og-image.svg',
      width: 1200,
      height: 630,
      alt: 'Rayen — Biodiversidad de Chile',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rayen — Biodiversidad de Chile',
    description: 'Fichas de especies, mapas interactivos y formas concretas de actuar por la biodiversidad nativa de Chile.',
    images: ['/og-image.svg'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <Providers>
          <CustomCursor />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
