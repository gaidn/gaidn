import GithubProvider from 'next-auth/providers/github'
import type { OAuthConfig } from 'next-auth/providers'
import type { Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import type { GitHubUser } from './types'

// 定义 GitHub Profile 类型
interface GitHubProfile {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  name: string;
  email: string;
  [key: string]: unknown;
}

// GitHub 认证提供者配置
export const createGitHubProvider = (config: {
  clientId: string
  clientSecret: string
}) => {
  return GithubProvider({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    authorization: {
      params: {
        scope: 'read:user user:email',
      },
    },
  })
}

// 扩展 NextAuth 配置以支持 GitHub
export const extendAuthOptions = (options: Record<string, unknown>) => {
  const callbacks = options.callbacks as Record<string, unknown> || {};
  
  return {
    ...options,
    callbacks: {
      ...callbacks,
      async session({ session, token }: { session: Session; token: JWT }) {
        if (token.githubUsername) {
          session.user.githubUsername = token.githubUsername as string
        }
        return session
      },
      async jwt({ token, account, profile }: { 
        token: JWT; 
        account: { provider?: string } | null; 
        profile?: { login: string } 
      }) {
        if (account?.provider === 'github' && profile) {
          token.githubUsername = profile.login
        }
        return token
      },
    },
  }
}

// 创建完整的 GitHub 认证配置
export const createGitHubAuthConfig = () => {
  return {
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_ID!,
        clientSecret: process.env.GITHUB_SECRET!,
        authorization: {
          params: {
            scope: 'read:user user:email',
          },
        },
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      async session({ session, token }: { session: Session; token: JWT }) {
        if (token.githubUsername) {
          session.user.githubUsername = token.githubUsername as string
        }
        return session
      },
      async jwt({ token, account, profile }: { 
        token: JWT; 
        account: { provider?: string } | null; 
        profile?: { login: string } 
      }) {
        if (account?.provider === 'github' && profile) {
          token.githubUsername = profile.login
        }
        return token
      },
    },
  }
} 