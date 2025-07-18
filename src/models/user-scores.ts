/**
 * 用户评分数据模型
 * 封装用户评分表的 CRUD 操作
 */

import type { 
  UserScore, 
  CreateUserScoreRequest 
} from '@/types/scoring';

export class UserScoresModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * 创建用户评分记录
   */
  async createUserScore(scoreData: CreateUserScoreRequest): Promise<UserScore> {
    const { user_id, score, algorithm_version } = scoreData;

    const result = await this.db.prepare(`
      INSERT INTO user_scores (user_id, score, algorithm_version)
      VALUES (?, ?, ?)
      RETURNING *
    `).bind(user_id, score, algorithm_version).first();

    return result as unknown as UserScore;
  }

  /**
   * 更新用户评分记录（upsert）
   */
  async upsertUserScore(scoreData: CreateUserScoreRequest): Promise<UserScore> {
    const { user_id, score, algorithm_version } = scoreData;

    const result = await this.db.prepare(`
      INSERT OR REPLACE INTO user_scores (user_id, score, algorithm_version)
      VALUES (?, ?, ?)
      RETURNING *
    `).bind(user_id, score, algorithm_version).first();

    return result as unknown as UserScore;
  }

  /**
   * 通过用户 ID 和算法版本获取评分
   */
  async getUserScore(userId: number, algorithmVersion: string = 'V1'): Promise<UserScore | null> {
    const result = await this.db.prepare(
      'SELECT * FROM user_scores WHERE user_id = ? AND algorithm_version = ?'
    ).bind(userId, algorithmVersion).first();

    return result as unknown as UserScore | null;
  }

  /**
   * 获取用户最新评分（不指定算法版本）
   */
  async getUserLatestScore(userId: number): Promise<UserScore | null> {
    const result = await this.db.prepare(`
      SELECT * FROM user_scores 
      WHERE user_id = ? 
      ORDER BY calculated_at DESC 
      LIMIT 1
    `).bind(userId).first();

    return result as unknown as UserScore | null;
  }

  /**
   * 获取排行榜数据
   */
  async getRankings(
    algorithmVersion: string = 'V1',
    page: number = 1,
    limit: number = 10
  ): Promise<{
    scores: UserScore[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    // 获取总数
    const countResult = await this.db.prepare(
      'SELECT COUNT(*) as count FROM user_scores WHERE algorithm_version = ?'
    ).bind(algorithmVersion).first();
    const total = (countResult as { count: number }).count;

    // 获取分页数据
    const result = await this.db.prepare(`
      SELECT * FROM user_scores 
      WHERE algorithm_version = ? 
      ORDER BY score DESC, calculated_at DESC 
      LIMIT ? OFFSET ?
    `).bind(algorithmVersion, limit, offset).all();

    return {
      scores: result.results as unknown as UserScore[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 获取用户排名
   */
  async getUserRank(userId: number, algorithmVersion: string = 'V1'): Promise<number | null> {
    const result = await this.db.prepare(`
      SELECT COUNT(*) + 1 as rank 
      FROM user_scores 
      WHERE algorithm_version = ? 
      AND score > (
        SELECT score 
        FROM user_scores 
        WHERE user_id = ? AND algorithm_version = ?
      )
    `).bind(algorithmVersion, userId, algorithmVersion).first();

    return result ? (result as { rank: number }).rank : null;
  }

  /**
   * 获取前 N 名用户
   */
  async getTopUsers(
    count: number = 10,
    algorithmVersion: string = 'V1'
  ): Promise<UserScore[]> {
    const result = await this.db.prepare(`
      SELECT * FROM user_scores 
      WHERE algorithm_version = ? 
      ORDER BY score DESC, calculated_at DESC 
      LIMIT ?
    `).bind(algorithmVersion, count).all();

    return result.results as unknown as UserScore[];
  }

  /**
   * 获取用户的历史评分（不同算法版本）
   */
  async getUserScoreHistory(userId: number): Promise<UserScore[]> {
    const result = await this.db.prepare(`
      SELECT * FROM user_scores 
      WHERE user_id = ? 
      ORDER BY calculated_at DESC
    `).bind(userId).all();

    return result.results as unknown as UserScore[];
  }

  /**
   * 删除用户评分记录
   */
  async deleteUserScore(userId: number, algorithmVersion: string): Promise<boolean> {
    const result = await this.db.prepare(
      'DELETE FROM user_scores WHERE user_id = ? AND algorithm_version = ?'
    ).bind(userId, algorithmVersion).run();

    return result.success;
  }

  /**
   * 删除用户所有评分记录
   */
  async deleteAllUserScores(userId: number): Promise<boolean> {
    const result = await this.db.prepare(
      'DELETE FROM user_scores WHERE user_id = ?'
    ).bind(userId).run();

    return result.success;
  }

  /**
   * 获取算法版本的统计信息
   */
  async getAlgorithmStats(algorithmVersion: string): Promise<{
    total: number;
    avgScore: number;
    maxScore: number;
    minScore: number;
  }> {
    const result = await this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        AVG(score) as avgScore,
        MAX(score) as maxScore,
        MIN(score) as minScore
      FROM user_scores 
      WHERE algorithm_version = ?
    `).bind(algorithmVersion).first();

    return {
      total: (result as { total: number }).total || 0,
      avgScore: (result as { avgScore: number }).avgScore || 0,
      maxScore: (result as { maxScore: number }).maxScore || 0,
      minScore: (result as { minScore: number }).minScore || 0
    };
  }

  /**
   * 批量更新用户评分
   */
  async batchUpdateUserScores(
    scoresData: CreateUserScoreRequest[]
  ): Promise<number> {
    let updatedCount = 0;

    for (const scoreData of scoresData) {
      try {
        await this.upsertUserScore(scoreData);
        updatedCount++;
      } catch (error) {
        console.error(`更新用户 ${scoreData.user_id} 评分失败:`, error);
      }
    }

    return updatedCount;
  }

  /**
   * 获取需要重新计算的用户评分
   */
  async getScoresForRecalculation(
    algorithmVersion: string,
    hoursAgo: number = 24
  ): Promise<UserScore[]> {
    const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
    
    const result = await this.db.prepare(`
      SELECT * FROM user_scores 
      WHERE algorithm_version = ? AND calculated_at < ?
      ORDER BY calculated_at ASC
    `).bind(algorithmVersion, cutoffTime).all();

    return result.results as unknown as UserScore[];
  }

  /**
   * 检查用户是否有评分记录
   */
  async hasUserScore(userId: number, algorithmVersion: string = 'V1'): Promise<boolean> {
    const result = await this.db.prepare(
      'SELECT 1 FROM user_scores WHERE user_id = ? AND algorithm_version = ? LIMIT 1'
    ).bind(userId, algorithmVersion).first();

    return result !== null;
  }

  /**
   * 获取所有可用的算法版本
   */
  async getAvailableAlgorithmVersions(): Promise<string[]> {
    const result = await this.db.prepare(
      'SELECT DISTINCT algorithm_version FROM user_scores ORDER BY algorithm_version'
    ).all();

    return result.results.map((row: { algorithm_version: string }) => row.algorithm_version);
  }
}