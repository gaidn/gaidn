import GithubProvider from 'next-auth/providers/github'
import type { JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'

// 定义 GitHub Profile 类型
interface GitHubProfile {
  login: string;
  id: number;
  [key: string]: unknown;
}

// 定义配置类型
interface AuthConfig {
  providers: unknown[];
  secret?: string;
  session?: {
    strategy: 'jwt' | 'database';
    maxAge?: number;
  };
  cookies?: {
    sessionToken?: {
      name: string;
      options: {
        httpOnly: boolean;
        sameSite: "lax" | "strict" | "none";
        path: string;
        secure: boolean;
      };
    };
  };
  callbacks?: {
    session?: (params: { session: Session; token: JWT }) => Promise<Session>;
    jwt?: (params: { 
      token: JWT; 
      account: { provider?: string } | null; 
      profile?: GitHubProfile 
    }) => Promise<JWT>;
  };
}

export const authConfig: AuthConfig = {
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
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  // Cloudflare Workers 环境下的 cookie 配置
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
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
      profile?: GitHubProfile 
    }) {
      if (account?.provider === 'github' && profile) {
        token.githubUsername = profile.login
      }
      return token
    },
  },
} 