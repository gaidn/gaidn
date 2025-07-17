/**
 * 用户相关类型定义
 */

// 用户基础类型
export interface User {
  id: number;
  name: string;
  email: string;
  image?: string;
  github_id?: string;
  login?: string;
  bio?: string;
  company?: string;
  location?: string;
  blog?: string;
  public_repos?: number;
  public_gists?: number;
  followers?: number;
  following?: number;
  github_created_at?: string;
  github_updated_at?: string;
  created_at: string;
}

// 创建用户请求
export interface CreateUserRequest {
  name: string;
  email: string;
  image?: string;
  github_id?: string;
  login?: string;
  bio?: string;
  company?: string;
  location?: string;
  blog?: string;
  public_repos?: number;
  public_gists?: number;
  followers?: number;
  following?: number;
  github_created_at?: string;
  github_updated_at?: string;
}

// API 通用响应格式
export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  dbType?: 'mock' | 'real';
}

// 用户服务层响应格式
export interface UserServiceResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// 会话类型
export interface Session {
  id: string;
  user_id: number;
  expires: string;
  created_at: string;
}

// 用户仓库类型
export interface UserRepository {
  id: number;
  user_id: number;
  repo_id: number;
  name: string;
  full_name: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  pushed_at?: string;
}

// 用户语言统计类型
export interface UserLanguage {
  id: number;
  user_id: number;
  language: string;
  bytes: number;
  percentage: number;
  last_updated: string;
}

// 用户组织类型
export interface UserOrganization {
  id: number;
  user_id: number;
  org_id: number;
  login: string;
  name?: string;
  avatar_url?: string;
  description?: string;
  created_at: string;
}

// GitHub 用户档案类型
export interface GitHubUserProfile {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  bio?: string;
  company?: string;
  location?: string;
  blog?: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

// GitHub 仓库类型
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  language?: string;
  stargazers_count: number;
  forks_count: number;
  private: boolean;
  created_at: string;
  updated_at: string;
  pushed_at?: string;
} 