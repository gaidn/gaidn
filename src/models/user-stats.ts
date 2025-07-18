/**
 * 用户统计数据模型
 * 封装用户统计表的 CRUD 操作
 */

import type { 
  UserStats, 
  CreateUserStatsRequest, 
  LanguageDistribution 
} from '@/types/scoring';

/**
 * 数据库行记录类型
 */
interface UserStatsRow {
  id: number;
  user_id: number;
  total_repos: number;
  ai_repos: number;
  stars_sum: number;
  forks_sum: number;
  language_distribution: string;
  last_updated: string | null;
  calculated_at: string;
}

export class UserStatsModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * 创建用户统计数据
   */
  async createUserStats(statsData: CreateUserStatsRequest): Promise<UserStats> {
    const {
      user_id,
      total_repos,
      ai_repos,
      stars_sum,
      forks_sum,
      language_distribution,
      last_updated
    } = statsData;

    const result = await this.db.prepare(`
      INSERT INTO user_stats (
        user_id, total_repos, ai_repos, stars_sum, forks_sum, 
        language_distribution, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      user_id,
      total_repos,
      ai_repos,
      stars_sum,
      forks_sum,
      JSON.stringify(language_distribution),
      last_updated || new Date().toISOString()
    ).first();

    return this.parseUserStats(result as UserStatsRow);
  }

  /**
   * 更新用户统计数据（upsert）
   */
  async upsertUserStats(statsData: CreateUserStatsRequest): Promise<UserStats> {
    const {
      user_id,
      total_repos,
      ai_repos,
      stars_sum,
      forks_sum,
      language_distribution,
      last_updated
    } = statsData;

    const result = await this.db.prepare(`
      INSERT OR REPLACE INTO user_stats (
        user_id, total_repos, ai_repos, stars_sum, forks_sum, 
        language_distribution, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      user_id,
      total_repos,
      ai_repos,
      stars_sum,
      forks_sum,
      JSON.stringify(language_distribution),
      last_updated || new Date().toISOString()
    ).first();

    return this.parseUserStats(result as UserStatsRow);
  }

  /**
   * 通过用户 ID 获取统计数据
   */
  async getUserStats(userId: number): Promise<UserStats | null> {
    const result = await this.db.prepare(
      'SELECT * FROM user_stats WHERE user_id = ?'
    ).bind(userId).first();

    return result ? this.parseUserStats(result as UserStatsRow) : null;
  }

  /**
   * 获取所有用户统计数据
   */
  async getAllUserStats(): Promise<UserStats[]> {
    const result = await this.db.prepare(
      'SELECT * FROM user_stats ORDER BY calculated_at DESC'
    ).all();

    return result.results.map(row => this.parseUserStats(row as UserStatsRow));
  }

  /**
   * 获取分页的用户统计数据
   */
  async getUserStatsWithPagination(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    stats: UserStats[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    // 获取总数
    const countResult = await this.db.prepare(
      'SELECT COUNT(*) as count FROM user_stats'
    ).first();
    const total = (countResult as { count: number }).count;

    // 获取分页数据
    const result = await this.db.prepare(`
      SELECT * FROM user_stats 
      ORDER BY calculated_at DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();

    return {
      stats: result.results.map(row => this.parseUserStats(row as UserStatsRow)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 删除用户统计数据
   */
  async deleteUserStats(userId: number): Promise<boolean> {
    const result = await this.db.prepare(
      'DELETE FROM user_stats WHERE user_id = ?'
    ).bind(userId).run();

    return result.success;
  }

  /**
   * 检查用户是否有统计数据
   */
  async hasUserStats(userId: number): Promise<boolean> {
    const result = await this.db.prepare(
      'SELECT 1 FROM user_stats WHERE user_id = ? LIMIT 1'
    ).bind(userId).first();

    return result !== null;
  }

  /**
   * 获取需要更新的用户统计数据
   * 根据最后更新时间筛选
   */
  async getStatsForUpdate(hoursAgo: number = 24): Promise<UserStats[]> {
    const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
    
    const result = await this.db.prepare(`
      SELECT * FROM user_stats 
      WHERE calculated_at < ? 
      ORDER BY calculated_at ASC
    `).bind(cutoffTime).all();

    return result.results.map(row => this.parseUserStats(row as UserStatsRow));
  }

  /**
   * 批量更新用户统计数据
   */
  async batchUpdateUserStats(statsDataList: CreateUserStatsRequest[]): Promise<number> {
    let updatedCount = 0;

    for (const statsData of statsDataList) {
      try {
        await this.upsertUserStats(statsData);
        updatedCount++;
      } catch (error) {
        console.error(`更新用户 ${statsData.user_id} 统计数据失败:`, error);
      }
    }

    return updatedCount;
  }

  /**
   * 解析数据库记录为 UserStats 对象
   */
  private parseUserStats(row: UserStatsRow): UserStats {
    return {
      id: row.id,
      user_id: row.user_id,
      total_repos: row.total_repos,
      ai_repos: row.ai_repos,
      stars_sum: row.stars_sum,
      forks_sum: row.forks_sum,
      language_distribution: row.language_distribution || '{}',
      last_updated: row.last_updated,
      calculated_at: row.calculated_at
    };
  }

  /**
   * 解析语言分布 JSON 字符串
   */
  parseLanguageDistribution(distributionJson: string): LanguageDistribution {
    try {
      return JSON.parse(distributionJson);
    } catch {
      return {};
    }
  }
}