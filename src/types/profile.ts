/**
 * 个人资料相关类型定义
 */

// 个人资料更新请求类型
export interface ProfileUpdateRequest {
  name: string;
  bio?: string;
  location?: string;
  blog?: string;
  company?: string;
}

// 个人资料表单数据类型
export interface ProfileFormData {
  name: string;
  bio: string;
  location: string;
  blog: string;
}

// 个人资料更新响应类型
export interface ProfileUpdateResponse {
  success: boolean;
  error?: string;
  data?: {
    id: number;
    name: string;
    bio?: string;
    location?: string;
    blog?: string;
    company?: string;
  };
}

// 个人资料API通用响应类型
export interface ProfileApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

// 个人资料验证错误类型
export interface ProfileValidationError {
  field: keyof ProfileUpdateRequest;
  message: string;
}

// 个人资料更新选项类型
export interface ProfileUpdateOptions {
  validateOnly?: boolean;
  skipEmptyFields?: boolean;
}