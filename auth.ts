import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import sql from '@/lib/db'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      dbId?: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string | null
      onboardingCompleted?: boolean
      avatarUrl?: string | null
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      try {
        const base = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')
        // Intentar upsert con username único
        const [existing] = await sql<{ id: string; username: string | null }[]>`
          SELECT id, username FROM users WHERE email = ${user.email}
        `
        if (existing) {
          await sql`
            UPDATE users SET name = ${user.name ?? user.email.split('@')[0]}, avatar_url = ${user.image ?? null}, last_seen = NOW()
            WHERE email = ${user.email}
          `
        } else {
          // Generar username único
          let username = base
          let attempt = 0
          while (true) {
            const candidate = attempt === 0 ? username : `${username}${attempt}`
            const [taken] = await sql<{ id: string }[]>`SELECT id FROM users WHERE username = ${candidate}`
            if (!taken) { username = candidate; break }
            attempt++
          }
          await sql`
            INSERT INTO users (email, name, avatar_url, username, last_seen)
            VALUES (${user.email}, ${user.name ?? base}, ${user.image ?? null}, ${username}, NOW())
          `
        }
      } catch (err) {
        console.error('[auth] upsert user failed:', err)
      }
      return true
    },
    async jwt({ token, user, trigger }) {
      // Lee la BD en el sign-in inicial O cuando el cliente llama update()
      const shouldRefresh = !!user?.email || trigger === 'update'
      if (shouldRefresh && token.email) {
        try {
          const [dbUser] = await sql<{ id: string; username: string | null; onboarding_completed: boolean; avatar_url: string | null }[]>`
            SELECT id, username, onboarding_completed, avatar_url FROM users WHERE email = ${token.email as string}
          `
          if (dbUser) {
            token.dbId = dbUser.id
            token.username = dbUser.username
            token.onboardingCompleted = dbUser.onboarding_completed
            token.avatarUrl = dbUser.avatar_url
          }
        } catch { /* ignore */ }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.dbId = token.dbId as string | undefined
        session.user.username = token.username as string | null
        session.user.onboardingCompleted = token.onboardingCompleted as boolean | undefined
        session.user.avatarUrl = token.avatarUrl as string | null
      }
      return session
    },
  },
})
