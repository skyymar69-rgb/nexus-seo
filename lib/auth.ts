import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcryptjs from 'bcryptjs'

// Demo user — fonctionne sans base de données
const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@nexus.io',
  name: 'Utilisateur Démo',
  image: null,
  plan: 'pro',
  role: 'user',
  // bcrypt hash of 'demo1234'
  passwordHash: '$2a$10$B67MhkPMhkfqca2rz91MSOdVF5qsxN6o7d4ynetKH7PeCTXi122zu',
}

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email et mot de passe requis')
      }

      // ── Demo bypass (fonctionne sans DB) ──────────────────────────
      if (credentials.email === DEMO_USER.email) {
        const isValid = await bcryptjs.compare(credentials.password, DEMO_USER.passwordHash)
        if (!isValid) throw new Error('Mot de passe incorrect')
        return {
          id: DEMO_USER.id,
          email: DEMO_USER.email,
          name: DEMO_USER.name,
          image: DEMO_USER.image,
          plan: DEMO_USER.plan,
          role: DEMO_USER.role,
        }
      }

      // ── Authentification DB ────────────────────────────────────────
      if (!process.env.DATABASE_URL) {
        throw new Error('Base de données non configurée. Utilisez la connexion démo.')
      }

      try {
        const { prisma } = await import('@/lib/prisma')
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('Identifiants invalides')
        }

        const isPasswordValid = await bcryptjs.compare(credentials.password, user.password)
        if (!isPasswordValid) throw new Error('Identifiants invalides')

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          plan: user.plan,
          role: user.role,
        }
      } catch (err: any) {
        if (err.message === 'Identifiants invalides') throw err
        throw new Error('Erreur de connexion. Réessayez ou utilisez la connexion démo.')
      }
    },
  }),
]

// Google OAuth — actif uniquement si les clés sont configurées
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      // Persist OAuth users to DB on first sign-in
      if (account?.provider === 'google' && user.email) {
        try {
          const { prisma } = await import('@/lib/prisma')
          await prisma.user.upsert({
            where: { email: user.email },
            update: { name: user.name, image: user.image },
            create: {
              email: user.email,
              name: user.name,
              image: user.image,
              plan: 'free',
              role: 'user',
            },
          })
        } catch {
          // DB error — still allow sign-in
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Lookup DB user for OAuth providers
        if (account?.provider === 'google' && user.email) {
          try {
            const { prisma } = await import('@/lib/prisma')
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email },
              select: { id: true, plan: true, role: true },
            })
            if (dbUser) {
              token.id = dbUser.id
              token.plan = dbUser.plan
              token.role = dbUser.role
              return token
            }
          } catch {
            // Fallback to token from provider
          }
        }
        token.id = user.id
        token.plan = (user as any).plan ?? 'free'
        token.role = (user as any).role ?? 'user'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.plan = (token.plan as string) || 'free'
        session.user.role = (token.role as string) || 'user'
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
