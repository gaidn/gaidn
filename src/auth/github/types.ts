// GitHub 登录相关的类型定义

export interface GitHubUser {
  id?: string | null
  name?: string | null
  email?: string | null
  image?: string | null
  githubUsername?: string
  // 以下是 GitHub API 可能返回的额外字段
  login?: string
  avatar_url?: string
  bio?: string | null
  location?: string | null
  company?: string | null
  blog?: string | null
  twitter_username?: string | null
  public_repos?: number
  followers?: number
  following?: number
  created_at?: string
  updated_at?: string
}

export interface GitHubAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface GitHubLoginOptions {
  scope?: string[]
  state?: string
  allowSignup?: boolean
  callbackUrl?: string
  redirect?: boolean
}

export interface GitHubAuthState {
  isAuthenticated: boolean
  user: GitHubUser | null
  isLoading: boolean
  error: string | null
} 