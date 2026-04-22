import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import sql from '@/lib/db'

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
        await sql`
          INSERT INTO users (email, name, avatar_url, last_seen)
          VALUES (
            ${user.email},
            ${user.name ?? user.email.split('@')[0]},
            ${user.image ?? null},
            NOW()
          )
          ON CONFLICT (email) DO UPDATE SET
            name        = EXCLUDED.name,
            avatar_url  = EXCLUDED.avatar_url,
            last_seen   = NOW()
        `
      } catch (err) {
        console.error('[auth] upsert user failed:', err)
        // No bloqueamos el login si falla el upsert
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
