# GitHub 登录模块

这是一个模块化的 GitHub 登录实现，遵循 SOLID 原则和模块化设计。

## 目录结构

```
src/auth/github/
├── index.ts          # 主入口文件
├── types.ts          # 类型定义
├── provider.ts       # 认证提供者配置
├── hooks.ts          # React Hooks
├── components/       # UI 组件
│   ├── index.ts
│   ├── GitHubLoginButton.tsx
│   ├── GitHubUserProfile.tsx
│   └── GitHubAuthGuard.tsx
└── README.md         # 使用说明
```

## 环境变量配置

在 `.env.local` 文件中添加以下环境变量：

```env
# GitHub OAuth 应用配置
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# NextAuth 配置
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Cloudflare 部署注意事项

在 Cloudflare 部署时，需要注意以下几点：

1. 确保在 Cloudflare 环境中设置了相同的环境变量
2. 将 `NEXTAUTH_URL` 设置为你的生产域名，例如 `https://yourdomain.com`
3. 在 GitHub OAuth 应用设置中添加回调 URL：`https://yourdomain.com/api/auth/callback/github`
4. 如果使用 Cloudflare D1 数据库，确保数据库绑定正确配置

## 使用方法

### 1. 在页面中使用登录按钮

```tsx
import { GitHubLoginButton } from '@/auth/github'

export default function LoginPage() {
  return (
    <div>
      <h1>登录</h1>
      <GitHubLoginButton />
    </div>
  )
}
```

### 2. 显示用户资料

```tsx
import { GitHubUserProfile } from '@/auth/github'

export default function ProfilePage() {
  return (
    <div>
      <h1>用户资料</h1>
      <GitHubUserProfile />
    </div>
  )
}
```

### 3. 保护需要登录的页面

```tsx
import { GitHubAuthGuard } from '@/auth/github'

export default function ProtectedPage() {
  return (
    <GitHubAuthGuard>
      <div>
        <h1>受保护的页面</h1>
        <p>只有登录用户才能看到这个内容</p>
      </div>
    </GitHubAuthGuard>
  )
}
```

### 4. 使用 Hooks

```tsx
import { useGitHubAuth } from '@/auth/github'

export default function MyComponent() {
  const { user, isAuthenticated, loginWithGitHub, logout, error } = useGitHubAuth()

  if (!isAuthenticated) {
    return (
      <div>
        <button onClick={() => loginWithGitHub()}>登录</button>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div>
      <p>欢迎, {user?.name}!</p>
      <button onClick={logout}>登出</button>
    </div>
  )
}
```

## 组件 API

### GitHubLoginButton

登录按钮组件。

**Props:**
- `className?: string` - 自定义 CSS 类名
- `variant?: 'default' | 'outline' | 'ghost'` - 按钮样式变体
- `size?: 'default' | 'sm' | 'lg'` - 按钮大小
- `children?: React.ReactNode` - 自定义内容
- `callbackUrl?: string` - 登录成功后的重定向 URL
- `onError?: (error: string) => void` - 错误处理回调函数

### GitHubUserProfile

用户资料显示组件。

**Props:**
- `className?: string` - 自定义 CSS 类名
- `showLogout?: boolean` - 是否显示登出按钮

### GitHubAuthGuard

认证守卫组件，用于保护需要登录的页面。

**Props:**
- `children: React.ReactNode` - 需要保护的内容
- `fallback?: React.ReactNode` - 自定义未登录时的显示内容
- `className?: string` - 自定义 CSS 类名
- `redirectUrl?: string` - 登录成功后的重定向 URL

## Hooks API

### useGitHubAuth

GitHub 认证状态管理 Hook。

**返回值:**
- `user: GitHubUser | null` - 用户信息
- `isAuthenticated: boolean` - 是否已登录
- `isLoading: boolean` - 是否正在加载
- `error: string | null` - 错误信息
- `loginWithGitHub: (options?: GitHubLoginOptions) => Promise<void>` - 登录函数
- `logout: () => Promise<void>` - 登出函数

### useAuthGuard

认证守卫 Hook。

**返回值:**
- `isAuthenticated: boolean` - 是否已登录
- `isLoading: boolean` - 是否正在加载
- `requiresAuth: boolean` - 是否需要认证
- `error: string | null` - 错误信息

## 类型定义

### GitHubUser

GitHub 用户信息接口。

### GitHubAuthConfig

GitHub 认证配置接口。

### GitHubLoginOptions

GitHub 登录选项接口。

### GitHubAuthState

GitHub 认证状态接口。

## 注意事项

1. 确保已正确配置 GitHub OAuth 应用
2. 环境变量必须完整配置
3. 组件需要在 SessionProvider 内部使用
4. 支持 Cloudflare 部署环境 