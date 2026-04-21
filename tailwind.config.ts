import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-lora)', 'Georgia', 'serif'],
      },
      colors: {
        // Paleta RAYEN
        teal: {
          50:  '#E1F5EE',
          100: '#9FE1CB',
          200: '#5DCAA5',
          400: '#1D9E75',  // Color primario
          600: '#0F6E56',
          800: '#085041',
          900: '#04342C',
        },
        forest: {
          50:  '#EAF3DE',
          100: '#C0DD97',
          400: '#639922',
          600: '#3B6D11',
          800: '#27500A',
        },
        coral: {
          50:  '#FAECE7',
          400: '#D85A30',
          600: '#993C1D',
          800: '#712B13',
        },
        amber: {
          50:  '#FAEEDA',
          100: '#FAC775',
          400: '#EF9F27',
          600: '#BA7517',
          800: '#854F0B',
        },
      },
      animation: {
        'fade-in':  'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
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
