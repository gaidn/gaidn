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
    async signIn({ user, account, profile }: any) {
      const isAllowedToSignIn = true;
      if (isAllowedToSignIn) {
        return true;
      } else {
        return false;
      }
    },
    async redirect({ url, baseUrl }: any) {
      // 允许相对回调 URL
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // 允许同源的回调 URL
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }: any) {
      if (token && token.user) {
        session.user = token.user;
      }
      return session;
    },
    async jwt({ token, user, account }: any) {
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