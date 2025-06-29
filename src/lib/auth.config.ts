import type { NextAuthConfig } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

export const authConfig: NextAuthConfig = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
      httpOptions: {
        timeout: 40000,
        retry: 3,
      } as any,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (token.githubUsername) {
        session.user.githubUsername = token.githubUsername as string
      }
      return session
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'github' && profile) {
        token.githubUsername = profile.login
      }
      return token
    },
  },
} 