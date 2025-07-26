import GitHubProvider from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";
import type { Provider } from "@auth/core/providers";
import { handleSignInUser } from "@/auth/handler";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { User } from "@/types/user";

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
        return `${baseUrl}${url}`;
      }
      // 允许同源的回调 URL
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
    async session({ session, token }: { session: Session; token: JWT & { user?: User; accessToken?: string } }) {
      if (token && token.user) {
        session.user = token.user;
      }
      if (token && token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // 登录后立即将 OAuth access_token 和/或用户 ID 保存到 token 中
      try {
        // 首先处理用户登录
        if (user && account) {
          console.log(`🔐 开始处理用户登录：${user.email}`);
          
          let userInfo = null;
          try {
            userInfo = await handleSignInUser(user, account);
            console.log(`✅ 用户登录处理成功：${userInfo?.name} (ID: ${userInfo?.id})`);
          } catch (error) {
            console.error(`❌ 用户登录处理失败：`, error);
            
            // 创建基础用户信息，避免登录完全失败
            if (user.email && user.name) {
              console.log(`🔄 尝试创建基础用户信息...`);
              userInfo = {
                id: 0, // 临时 ID
                name: user.name,
                email: user.email,
                image: user.image,
                github_id: account.providerAccountId,
                created_at: new Date().toISOString()
              };
            } else {
              console.error(`💥 无法创建基础用户信息，缺少必要字段`);
              // 返回 token 但不设置用户信息
              return token;
            }
          }

          if (userInfo) {
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
              console.log(`🔑 已保存 GitHub access_token 到 token 中`);
              console.log('🔍 Token 详细信息:', {
                tokenPrefix: account.access_token.substring(0, 10) + '...',
                tokenLength: account.access_token.length,
                tokenType: account.token_type || 'Bearer',
                fullToken: process.env.NODE_ENV === 'development' ? account.access_token : '[HIDDEN]'
              });
              
              // 异步收集 GitHub 数据（不阻塞登录流程）
              try {
                if (!userInfo.id) {
                  console.warn('⚠️  用户 ID 不存在，跳过 GitHub 数据收集');
                } else {
                  console.log(`🚀 开始为用户 ${userInfo.id} 异步收集 GitHub 数据...`);
                  console.log('🔍 使用的 Access Token:', {
                    tokenPrefix: account.access_token.substring(0, 10) + '...',
                    tokenLength: account.access_token.length,
                    userId: userInfo.id
                  });
                  
                  // 异步执行数据收集，不阻塞登录流程
                  const { userService } = await import('@/services/user.service');
                  const result = await userService.collectAndSaveGitHubData(
                    userInfo.id.toString(),
                    account.access_token!
                  );
                  
                  if (result.success) {
                    console.log(`✅ 用户 ${userInfo.id} 的 GitHub 数据收集完成`);
                    console.log('📊 收集结果:', result.data);
                  } else {
                    console.error(`❌ 用户 ${userInfo.id} 的 GitHub 数据收集失败:`, result.error);
                  }
                }
              } catch (error) {
                console.error(`💥 用户 ${userInfo.id} 的 GitHub 数据收集异常:`, error);
                if (error instanceof Error) {
                  console.error('错误详情:', error.message);
                  console.error('错误堆栈:', error.stack);
                }
              }
            }
          }
        }

        return token;
      } catch (error) {
        console.error(`🚨 JWT 回调异常：`, error);
        return token;
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}; 