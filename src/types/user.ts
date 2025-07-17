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
  created_at: string;
}

// 创建用户请求
export interface CreateUserRequest {
  name: string;
  email: string;
  image?: string;
  github_id?: string;
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