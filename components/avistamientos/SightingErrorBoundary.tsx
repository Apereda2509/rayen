'use client'

import { Component, type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class SightingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[SightingErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center gap-4 py-16 text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <h2 className="text-lg font-semibold text-stone-800">Algo salió mal</h2>
          <p className="text-stone-500 text-sm leading-relaxed">
            Por favor intenta de nuevo o contáctanos en{' '}
            <a
              href="mailto:angelperedajimenez@gmail.com"
              className="text-neon-600 underline"
            >
              angelperedajimenez@gmail.com
            </a>
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 rounded-lg bg-neon-400 px-5 py-2 text-sm font-medium text-black hover:bg-neon-300 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
