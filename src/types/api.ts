/**
 * API 响应类型定义
 * 为所有 API 端点的响应格式提供类型安全保障
 */

// 通用 API 响应基础类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// GitHub 数据收集 API 响应类型
export interface GitHubCollectApiResponse extends ApiResponse<unknown> {
  success: boolean;
  message?: string;
  data?: unknown; // 来自 userService.collectAndSaveGitHubData 的数据
  error?: string;
}

// GitHub 数据统计 API 响应类型
export interface GitHubStatsApiResponse extends ApiResponse<{
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  github_created_at: string | null;
  github_updated_at: string | null;
}> {
  data?: {
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    github_created_at: string | null;
    github_updated_at: string | null;
  };
}