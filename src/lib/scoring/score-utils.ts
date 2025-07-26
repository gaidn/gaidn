/**
 * 评分计算工具函数
 * 提供各种评分因子的计算逻辑
 */

import type { RepoScoreData, LanguageDistribution } from '@/types/scoring';

/**
 * 计算仓库质量分数（基于 stars 和 forks）
 */
export function calculateQualityScore(repos: RepoScoreData[]): number {
  if (repos.length === 0) return 0;

  const totalStars = repos.reduce((sum, repo) => sum + repo.stars, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks, 0);
  
  // 使用对数函数避免超大数值，并加入权重
  const starsScore = Math.log10(totalStars + 1) * 10;
  const forksScore = Math.log10(totalForks + 1) * 5;
  
  return Math.min(starsScore + forksScore, 100); // 最高 100 分
}

/**
 * 计算活跃度分数（基于最近更新时间）
 */
export function calculateActivityScore(repos: RepoScoreData[]): number {
  if (repos.length === 0) return 0;

  const now = new Date();
  const activeRepos = repos.filter(repo => {
    const lastUpdate = new Date(repo.updated_at);
    const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate <= 365; // 一年内有更新
  });

  const activityRatio = activeRepos.length / repos.length;
  
  // 计算平均更新新鲜度
  const avgFreshness = activeRepos.reduce((sum, repo) => {
    const lastUpdate = new Date(repo.updated_at);
    const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return sum + Math.max(0, 365 - daysSinceUpdate) / 365;
  }, 0) / (activeRepos.length || 1);

  return Math.min(activityRatio * 50 + avgFreshness * 50, 100);
}

/**
 * 计算技术多样性分数（基于使用的编程语言）
 */
export function calculateDiversityScore(repos: RepoScoreData[]): number {
  if (repos.length === 0) return 0;

  const languages = new Set<string>();
  repos.forEach(repo => {
    if (repo.language) {
      languages.add(repo.language.toLowerCase());
    }
  });

  const languageCount = languages.size;
  
  // 语言数量越多分数越高，但有递减效应
  const diversityScore = Math.min(languageCount * 10, 100);
  
  return diversityScore;
}

/**
 * 计算仓库数量分数
 */
export function calculateRepoCountScore(repoCount: number): number {
  // 使用对数函数，避免仓库数量过多导致分数过高
  return Math.min(Math.log10(repoCount + 1) * 25, 100);
}

/**
 * 计算 AI 项目加成分数
 */
export function calculateAIProjectScore(aiProjectCount: number, totalRepoCount: number): number {
  if (totalRepoCount === 0) return 0;

  const aiRatio = aiProjectCount / totalRepoCount;
  
  // AI 项目比例越高分数越高，但不是线性增长
  const aiScore = Math.sqrt(aiRatio) * 50 + aiProjectCount * 5;
  
  return Math.min(aiScore, 100);
}

/**
 * 生成语言分布对象
 */
export function generateLanguageDistribution(repos: RepoScoreData[]): LanguageDistribution {
  const distribution: LanguageDistribution = {};
  
  repos.forEach(repo => {
    if (repo.language) {
      const language = repo.language;
      distribution[language] = (distribution[language] || 0) + 1;
    }
  });

  return distribution;
}

/**
 * 获取最常用的编程语言（前 N 个）
 */
export function getTopLanguages(distribution: LanguageDistribution, count = 5): string[] {
  return Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([language]) => language);
}

/**
 * 计算时间衰减因子
 * 越久远的活动影响越小
 */
export function calculateTimeDecayFactor(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const daysSince = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  
  // 使用指数衰减，30 天半衰期
  return Math.exp(-daysSince / 30);
}

/**
 * 标准化分数到 0-100 范围
 */
export function normalizeScore(score: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, score));
}

/**
 * 计算仓库的个人贡献度（排除 fork 项目的影响）
 */
export function calculateOriginalityScore(repos: RepoScoreData[]): number {
  const originalRepos = repos.filter(repo => repo.forks === 0 || repo.stars > repo.forks);
  const originalityRatio = originalRepos.length / (repos.length || 1);
  
  return originalityRatio * 100;
}