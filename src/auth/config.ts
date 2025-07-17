import GitHubProvider from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";
import type { Provider } from "@auth/core/providers";
import { handleSignInUser } from "@/auth/handler";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { User } from "@/types/user";

const providers: Provider[] = [];

// Github Auth
if (
  process.env.GITHUB_ID &&
  process.env.GITHUB_SECRET
) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: 'read:user user:email public_repo read:org',
        },
      },
    })
  );
} else {
  console.warn("GitHub 提供商配置失败 - 缺少环境变量");
}

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  });

export const authOptions: NextAuthConfig = {
  providers,
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  // 添加可信主机配置，解决 UntrustedHost 错误
  trustHost: true, // 信任所有主机，包括 gaidn.org 和 gaidn.1105950073.workers.dev
  // Cloudflare Workers 环境下的 cookie 配置
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true, // 在生产环境中始终使用 secure
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      }
    }
  },
  callbacks: {
    async signIn(_params) {
      const isAllowedToSignIn = true;
      if (isAllowedToSignIn) {
        return true;
      } else {
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      // 允许相对回调 URL
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`;
        return redirectUrl;
      }
      // 允许同源的回调 URL
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
    async session({ session, token }: { session: Session; token: JWT & { user?: User } }) {
      if (token && token.user) {
        session.user = token.user;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // 登录后立即将 OAuth access_token 和/或用户 ID 保存到 token 中
      try {
        if (!user || !account) {
          return token;
        }

        const userInfo = await handleSignInUser(user, account);
        if (!userInfo) {
          throw new Error("保存用户失败");
        }

        token.user = {
          id: userInfo.id ?? 0,
          name: userInfo.name ?? '',
          email: userInfo.email ?? '',
          image: userInfo.image ?? undefined,
          github_id: userInfo.github_id,
          created_at: userInfo.created_at ?? '',
        };

        // 保存 access_token 用于后续的 GitHub API 调用
        if (account.provider === 'github' && account.access_token) {
          token.accessToken = account.access_token;
        }

        return token;
      } catch (e) {
        console.error("jwt 回调错误:", e);
        return token;
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}; 