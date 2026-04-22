'use client'

import { SessionProvider } from 'next-auth/react'
import { OnboardingModal } from '@/components/ui/OnboardingModal'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <OnboardingModal />
    </SessionProvider>
  )
}
