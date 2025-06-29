import GithubProvider from 'next-auth/providers/github'
import type { OAuthConfig } from 'next-auth/providers'

// GitHub 认证提供者配置
export const createGitHubProvider = (config: {
  clientId: string
  clientSecret: string
}): OAuthConfig<any> => {
  return GithubProvider({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    authorization: {
      params: {
        scope: 'read:user user:email',
      },
    },
    httpOptions: {
      timeout: 40000, // 增加超时时间到40秒
      retry: 3, // 添加重试次数
    } as any,
  })
}

// 扩展 NextAuth 配置以支持 GitHub
export const extendAuthOptions = (options: any): any => {
  return {
    ...options,
    callbacks: {
      ...options.callbacks,
      async session({ session, token }: { session: any; token: any }) {
        if (token.githubUsername) {
          session.user.githubUsername = token.githubUsername as string
        }
        return session
      },
      async jwt({ token, account, profile }: { token: any; account: any; profile: any }) {
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
        httpOptions: {
          timeout: 40000, // 增加超时时间到40秒
          retry: 3, // 添加重试次数
        } as any,
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      async session({ session, token }: { session: any; token: any }) {
        if (token.githubUsername) {
          session.user.githubUsername = token.githubUsername as string
        }
        return session
      },
      async jwt({ token, account, profile }: { token: any; account: any; profile: any }) {
        if (account?.provider === 'github' && profile) {
          token.githubUsername = profile.login
        }
        return token
      },
    },
  }
} 