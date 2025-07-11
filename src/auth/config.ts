import GitHubProvider from "next-auth/providers/github";
import { NextAuthConfig } from "next-auth";
import { Provider } from "@auth/core/providers";
import { User } from "@/types/user";
import { handleSignInUser } from "@/auth/handler";

const providers: Provider[] = [];

// Github Auth
if (
  process.env.GITHUB_ID &&
  process.env.GITHUB_SECRET
) {
  console.log("配置 GitHub 提供商 - ID 长度:", process.env.GITHUB_ID.length);
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    })
  );
  console.log("GitHub 提供商配置完成");
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

console.log("可用认证提供商:", providerMap);

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
    async signIn({ user, account, profile }: any) {
      console.log("signIn 回调 - 用户:", user?.email, "提供商:", account?.provider);
      const isAllowedToSignIn = true;
      if (isAllowedToSignIn) {
        return true;
      } else {
        return false;
      }
    },
    async redirect({ url, baseUrl }: any) {
      console.log("redirect 回调 - URL:", url, "基础URL:", baseUrl);
      // 允许相对回调 URL
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`;
        console.log("重定向到相对路径:", redirectUrl);
        return redirectUrl;
      }
      // 允许同源的回调 URL
      else if (new URL(url).origin === baseUrl) {
        console.log("重定向到同源URL:", url);
        return url;
      }
      console.log("重定向到基础URL:", baseUrl);
      return baseUrl;
    },
    async session({ session, token }: any) {
      console.log("session 回调 - 会话用户:", session?.user?.email);
      if (token && token.user) {
        session.user = token.user;
      }
      return session;
    },
    async jwt({ token, user, account }: any) {
      console.log("jwt 回调 - 用户:", user?.email, "提供商:", account?.provider);
      // 登录后立即将 OAuth access_token 和/或用户 ID 保存到 token 中
      try {
        if (!user || !account) {
          return token;
        }

        console.log("处理用户登录 - 提供商:", account.provider, "用户:", user.email);
        const userInfo = await handleSignInUser(user, account);
        if (!userInfo) {
          throw new Error("保存用户失败");
        }
        console.log("用户信息保存成功:", userInfo.uuid);

        token.user = {
          uuid: userInfo.uuid,
          email: userInfo.email,
          nickname: userInfo.nickname,
          avatar_url: userInfo.avatar_url,
          created_at: userInfo.created_at,
          githubUsername: account.provider === 'github' ? (user.name || undefined) : undefined
        };

        return token;
      } catch (e) {
        console.error("jwt 回调错误:", e);
        return token;
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}; 