# NextAuth.js 在 Cloudflare Workers 环境中的问题排查指南

## 问题概述

在将使用 NextAuth.js 的 Next.js 应用部署到 Cloudflare Workers 时，GitHub OAuth 登录功能出现失败，本地开发环境正常工作。

## 问题现象

- ✅ 本地开发环境 GitHub 登录正常
- ❌ Cloudflare 部署后 GitHub 登录失败，跳转到错误页面
- ❌ 浏览器控制台显示 500 内部服务器错误
- ❌ `/api/auth/session` 请求失败

### 具体错误信息

```
GET https://gaidn.org/api/auth/session 500 (Internal Server Error)
J: There was a problem with the server configuration. Check the server logs for more information.
```

## 排查过程

### 1. 初始怀疑方向（误区）

- 怀疑 NEXTAUTH_URL 协议问题（HTTP vs HTTPS）
- 怀疑 Cookie 配置问题
- 怀疑 Cloudflare Workers 环境兼容性问题

### 2. 关键转折点

通过查看 Cloudflare Workers 详细日志，发现了关键错误信息：

```
[auth][error] UntrustedHost: Host must be trusted. URL was: https://gaidn.org/api/auth/providers. 
Read more at https://errors.authjs.dev#untrustedhost
```

## 根本原因

**NextAuth.js v5 引入了新的安全特性 - 可信主机验证**

- NextAuth.js v5 默认只信任在配置中明确声明的主机
- 这是为了防止潜在的安全攻击
- 部署域名需要被明确信任才能正常工作

## 解决方案

### 方法一：信任所有主机（推荐用于开发/测试）

在 `src/auth/config.ts` 中添加：

```typescript
export const authOptions: NextAuthConfig = {
  // ... 其他配置
  trustHost: true, // 信任所有主机
  // ... 其他配置
}
```

### 方法二：明确指定可信主机（推荐用于生产）

```typescript
export const authOptions: NextAuthConfig = {
  // ... 其他配置
  trustHost: ["gaidn.org", "gaidn.1105950073.workers.dev"],
  // ... 其他配置
}
```

## 完整配置示例

```typescript
import GitHubProvider from "next-auth/providers/github";
import { NextAuthConfig } from "next-auth";

export const authOptions: NextAuthConfig = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    })
  ],
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  // 🔑 关键配置：信任主机
  trustHost: true,
  // Cloudflare Workers 环境下的 cookie 配置
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  // ... 其他配置
};
```

## 环境变量配置

确保在 `wrangler.jsonc` 中正确配置：

```json
{
  "vars": {
    "GITHUB_ID": "your_github_client_id",
    "GITHUB_SECRET": "your_github_client_secret",
    "NEXTAUTH_SECRET": "your_nextauth_secret",
    "NEXTAUTH_URL": "https://yourdomain.com"
  }
}
```

**注意：NEXTAUTH_URL 必须使用 HTTPS 协议**

## 调试技巧

### 1. 查看 Cloudflare Workers 日志

```bash
npx wrangler tail
```

### 2. 添加详细日志记录

```typescript
export const authOptions: NextAuthConfig = {
  // ... 其他配置
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("signIn 回调 - 用户:", user?.email, "提供商:", account?.provider);
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log("redirect 回调 - URL:", url, "基础URL:", baseUrl);
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};
```

### 3. 检查 GitHub OAuth 应用配置

确保 GitHub OAuth 应用的回调 URL 设置为：
```
https://yourdomain.com/api/auth/callback/github
```

## 经验教训

### ✅ 好的实践

1. **优先查看完整错误日志**：详细的错误信息比堆栈跟踪更有价值
2. **了解框架版本差异**：NextAuth v5 相比早期版本有重要的安全改进
3. **系统性排查**：收集足够的信息再动手修改代码

### ❌ 需要避免的陷阱

1. **过早动手修改代码**：应该先完全理解问题再动手
2. **忽视版本特性**：新版本的安全特性变化需要特别关注
3. **只看表面错误**：500 错误可能掩盖真正的问题

## 相关资源

- [NextAuth.js UntrustedHost 错误文档](https://errors.authjs.dev#untrustedhost)
- [NextAuth.js v5 配置文档](https://next-auth.js.org/configuration/options)
- [Cloudflare Workers 日志查看](https://developers.cloudflare.com/workers/observability/logging/)

## 总结

NextAuth.js v5 的可信主机验证是一个重要的安全特性，在部署到生产环境时需要正确配置。通过添加 `trustHost: true` 或明确指定可信主机列表，可以解决在 Cloudflare Workers 环境中的认证问题。

记住：**详细的错误日志是排查问题的关键，不要急于修改代码，先理解问题的本质。** 