/**
 * 评分算法 V1 实现
 * 基础评分算法，综合考虑仓库质量、活跃度、技术多样性和 AI 项目数量
 */

import type { ScoreCalculator, ScoreCalculationInput, ScoreWeights, UserStats, RepoScoreData } from '@/types/scoring';
import {
  calculateQualityScore,
  calculateActivityScore,
  calculateDiversityScore,
  calculateRepoCountScore,
  calculateAIProjectScore,
  normalizeScore
} from '../score-utils';

/**
 * 评分权重配置
 */
const DEFAULT_WEIGHTS: ScoreWeights = {
  starsFactor: 0.25,      // 25% - 仓库质量（stars/forks）
  forksFactor: 0.15,      // 15% - fork 影响
  activityFactor: 0.20,   // 20% - 活跃度
  diversityFactor: 0.15,  // 15% - 技术多样性
  aiProjectFactor: 0.15,  // 15% - AI 项目加成
  repoCountFactor: 0.10   // 10% - 仓库数量
};

export class ScoreV1 implements ScoreCalculator {
  readonly version = 'V1';
  private weights: ScoreWeights;

  constructor(weights: ScoreWeights = DEFAULT_WEIGHTS) {
    this.weights = weights;
  }

  /**
   * 计算用户综合评分
   */
  async calculate(input: ScoreCalculationInput): Promise<number> {
    const { userStats, repositoryData } = input;
    
    // 1. 计算仓库质量分数
    const qualityScore = calculateQualityScore(repositoryData);
    
    // 2. 计算活跃度分数
    const activityScore = calculateActivityScore(repositoryData);
    
    // 3. 计算技术多样性分数
    const diversityScore = calculateDiversityScore(repositoryData);
    
    // 4. 计算仓库数量分数
    const repoCountScore = calculateRepoCountScore(userStats.total_repos);
    
    // 5. 计算 AI 项目加成分数
    const aiProjectScore = calculateAIProjectScore(
      userStats.ai_repos,
      userStats.total_repos
    );
    
    // 6. 计算加权总分
    const totalScore = this.calculateWeightedScore({
      qualityScore,
      activityScore,
      diversityScore,
      repoCountScore,
      aiProjectScore
    });

    // 7. 应用额外的调整因子
    const adjustedScore = this.applyAdjustments(totalScore, userStats, repositoryData);
    
    // 8. 标准化到 0-1000 范围
    return normalizeScore(adjustedScore, 0, 1000);
  }

  /**
   * 计算加权分数
   */
  private calculateWeightedScore(scores: {
    qualityScore: number;
    activityScore: number;
    diversityScore: number;
    repoCountScore: number;
    aiProjectScore: number;
  }): number {
    const { qualityScore, activityScore, diversityScore, repoCountScore, aiProjectScore } = scores;
    
    return (
      qualityScore * (this.weights.starsFactor + this.weights.forksFactor) +
      activityScore * this.weights.activityFactor +
      diversityScore * this.weights.diversityFactor +
      aiProjectScore * this.weights.aiProjectFactor +
      repoCountScore * this.weights.repoCountFactor
    );
  }

  /**
   * 应用额外的调整因子
   */
  private applyAdjustments(
    baseScore: number,
    userStats: UserStats,
    repositoryData: RepoScoreData[]
  ): number {
    let adjustedScore = baseScore;

    // 1. 早期用户加成（GitHub 账户创建时间较早）
    adjustedScore *= this.getEarlyUserBonus(repositoryData);

    // 2. 一致性加成（长期活跃用户）
    adjustedScore *= this.getConsistencyBonus(repositoryData);

    // 3. 影响力加成（高 stars 项目）
    adjustedScore *= this.getInfluenceBonus(repositoryData);

    return adjustedScore;
  }

  /**
   * 早期用户加成
   */
  private getEarlyUserBonus(repositoryData: RepoScoreData[]): number {
    if (repositoryData.length === 0) return 1.0;

    const oldestRepo = repositoryData.reduce((oldest, repo) => {
      const repoDate = new Date(repo.created_at);
      const oldestDate = new Date(oldest.created_at);
      return repoDate < oldestDate ? repo : oldest;
    });

    const accountAge = (new Date().getTime() - new Date(oldestRepo.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // 账户越老，加成越高（最高 1.2 倍）
    return Math.min(1.0 + accountAge * 0.02, 1.2);
  }

  /**
   * 一致性加成
   */
  private getConsistencyBonus(repositoryData: RepoScoreData[]): number {
    if (repositoryData.length === 0) return 1.0;

    const now = new Date();
    const recentlyActiveRepos = repositoryData.filter(repo => {
      const lastUpdate = new Date(repo.updated_at);
      const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate <= 90; // 3 个月内有更新
    });

    const consistencyRatio = recentlyActiveRepos.length / repositoryData.length;
    
    // 一致性越高，加成越高（最高 1.15 倍）
    return 1.0 + consistencyRatio * 0.15;
  }

  /**
   * 影响力加成
   */
  private getInfluenceBonus(repositoryData: RepoScoreData[]): number {
    if (repositoryData.length === 0) return 1.0;

    const maxStars = Math.max(...repositoryData.map(repo => repo.stars));
    
    // 根据最高 stars 数给予影响力加成
    if (maxStars >= 1000) return 1.3;
    if (maxStars >= 500) return 1.2;
    if (maxStars >= 100) return 1.1;
    if (maxStars >= 50) return 1.05;
    
    return 1.0;
  }

  /**
   * 获取算法详细信息
   */
  getAlgorithmInfo(): {
    version: string;
    weights: ScoreWeights;
    description: string;
  } {
    return {
      version: this.version,
      weights: this.weights,
      description: '基础评分算法，综合考虑仓库质量、活跃度、技术多样性和 AI 项目数量'
    };
  }
}