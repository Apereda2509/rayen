import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        grotesk: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        serif:   ['var(--font-lora)', 'Georgia', 'serif'],
      },
      colors: {
        // Paleta RAYEN v2.0
        neon: {
          DEFAULT: '#00E676',
          50:  '#E5FFF2',
          100: '#C0FFE0',
          300: '#52F599',
          400: '#00E676',
          500: '#00C760',
          600: '#00A84F',
        },
        carbon: {
          DEFAULT: '#0A0A0A',
          700: '#222222',
          800: '#141414',
          900: '#0A0A0A',
        },
        coral: {
          50:  '#FAECE7',
          400: '#D85A30',
          600: '#993C1D',
          800: '#712B13',
        },
      },
      animation: {
        'fade-in':  'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
