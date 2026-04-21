// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

// ── Classnames ────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Fechas ───────────────────────────────────────────────────
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'd MMM yyyy', { locale: es })
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}

// ── Slugs ────────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// ── Números ──────────────────────────────────────────────────
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-CL').format(n)
}

// ── URLs de Cloudinary ────────────────────────────────────────
export function cloudinaryUrl(
  publicId: string,
  opts: { w?: number; h?: number; q?: number; f?: string } = {}
): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'rayen'
  const { w = 800, h, q = 80, f = 'auto' } = opts
  const transforms = [
    `w_${w}`,
    h ? `h_${h}` : null,
    `q_${q}`,
    `f_${f}`,
    'c_fill',
  ].filter(Boolean).join(',')

  return `https://res.cloudinary.com/${cloud}/image/upload/${transforms}/${publicId}`
}

// ── Coordenadas ───────────────────────────────────────────────
export function formatCoords(lat: number, lng: number): string {
  const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`
  const lngStr = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'O'}`
  return `${latStr}, ${lngStr}`
}

// ── Truncar texto ─────────────────────────────────────────────
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…'
}

// ── Colores de la paleta RAYEN ────────────────────────────────
export const RAYEN_COLORS = {
  teal:      '#1D9E75',
  tealDark:  '#085041',
  tealLight: '#E1F5EE',
  green:     '#3B6D11',
  greenLight:'#EAF3DE',
  coral:     '#D85A30',
  coralLight:'#FAECE7',
  amber:     '#BA7517',
  amberLight:'#FAEEDA',
  carbon:    '#2C2C2A',
  grayMid:   '#888780',
  grayLight: '#F1EFE8',
} as const
