/**
 * 评分引擎
 * 管理不同版本的评分算法，提供统一的评分接口
 */

import type { ScoreCalculator, ScoreCalculationInput } from '@/types/scoring';
import { ScoreV1 } from './algorithms/score-v1';

/**
 * 评分引擎类
 */
export class ScoreEngine {
  private algorithms: Map<string, ScoreCalculator> = new Map();

  constructor() {
    // 注册默认算法
    this.registerAlgorithm(new ScoreV1());
  }

  /**
   * 注册评分算法
   */
  registerAlgorithm(algorithm: ScoreCalculator): void {
    this.algorithms.set(algorithm.version, algorithm);
  }

  /**
   * 获取算法实例
   */
  getAlgorithm(version: string): ScoreCalculator | undefined {
    return this.algorithms.get(version);
  }

  /**
   * 获取所有可用算法版本
   */
  getAvailableVersions(): string[] {
    return Array.from(this.algorithms.keys());
  }

  /**
   * 计算用户评分
   */
  async calculateScore(
    input: ScoreCalculationInput,
    algorithmVersion = 'V1'
  ): Promise<number> {
    const algorithm = this.getAlgorithm(algorithmVersion);
    
    if (!algorithm) {
      throw new Error(`未找到评分算法版本: ${algorithmVersion}`);
    }

    try {
      return await algorithm.calculate(input);
    } catch (error) {
      throw new Error(`评分计算失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量计算多个用户的评分
   */
  async calculateBatchScores(
    inputs: ScoreCalculationInput[],
    algorithmVersion = 'V1'
  ): Promise<Map<number, number>> {
    const results = new Map<number, number>();
    
    for (const input of inputs) {
      try {
        const score = await this.calculateScore(input, algorithmVersion);
        results.set(input.userStats.user_id, score);
      } catch (error) {
        console.error(`用户 ${input.userStats.user_id} 评分计算失败:`, error);
        results.set(input.userStats.user_id, 0);
      }
    }
    
    return results;
  }

  /**
   * 获取默认算法版本
   */
  getDefaultVersion(): string {
    return 'V1';
  }
}

/**
 * 全局评分引擎实例
 */
export const scoreEngine = new ScoreEngine();