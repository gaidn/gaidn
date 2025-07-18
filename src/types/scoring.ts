/**
 * 评分系统相关类型定义
 */

/**
 * 用户统计数据
 */
export interface UserStats {
  id: number;
  user_id: number;
  total_repos: number;
  ai_repos: number;
  stars_sum: number;
  forks_sum: number;
  language_distribution: string; // JSON 字符串
  last_updated: string | null;
  calculated_at: string;
}

/**
 * 用户统计数据创建请求
 */
export interface CreateUserStatsRequest {
  user_id: number;
  total_repos: number;
  ai_repos: number;
  stars_sum: number;
  forks_sum: number;
  language_distribution: LanguageDistribution;
  last_updated?: string;
}

/**
 * 语言分布数据
 */
export interface LanguageDistribution {
  [language: string]: number;
}

/**
 * 用户评分数据
 */
export interface UserScore {
  id: number;
  user_id: number;
  score: number;
  algorithm_version: string;
  calculated_at: string;
}

/**
 * 用户评分创建请求
 */
export interface CreateUserScoreRequest {
  user_id: number;
  score: number;
  algorithm_version: string;
}

/**
 * 评分计算接口（策略模式）
 */
export interface ScoreCalculator {
  readonly version: string;
  calculate(statsData: ScoreCalculationInput): Promise<number>;
}

/**
 * 评分计算输入数据
 */
export interface ScoreCalculationInput {
  userStats: UserStats;
  repositoryData: RepoScoreData[];
}

/**
 * 仓库评分数据
 */
export interface RepoScoreData {
  repo_id: number;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
}

/**
 * 评分因子权重配置
 */
export interface ScoreWeights {
  starsFactor: number;
  forksFactor: number;
  activityFactor: number;
  diversityFactor: number;
  aiProjectFactor: number;
  repoCountFactor: number;
}

/**
 * 排行榜用户数据
 */
export interface RankingUser {
  id: number;
  name: string;
  login: string | null;
  image: string | null;
  score: number;
  rank: number;
  stats: {
    total_repos: number;
    ai_repos: number;
    stars_sum: number;
    forks_sum: number;
    top_languages: string[];
    last_updated: string | null;
  };
}

/**
 * 排行榜查询参数
 */
export interface RankingQuery {
  page?: number;
  limit?: number;
  algorithm_version?: string;
}

/**
 * 排行榜响应
 */
export interface RankingResponse {
  success: boolean;
  data?: {
    users: RankingUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

/**
 * AI 项目识别规则
 */
export interface AIProjectRule {
  type: 'name' | 'description' | 'topic' | 'language';
  patterns: string[];
  weight: number;
}

/**
 * 评分服务响应
 */
export interface ScoreServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}