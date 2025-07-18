/**
 * 003 - 创建用户统计和评分表
 * 添加 user_stats 和 user_scores 表支持排行榜功能
 */

import type { Migration } from './index';

export const migration003: Migration = {
  id: '003',
  description: '创建用户统计和评分表',
  
  async up(db: D1Database) {
    // 创建用户统计表
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_repos INTEGER DEFAULT 0,
        ai_repos INTEGER DEFAULT 0,
        stars_sum INTEGER DEFAULT 0,
        forks_sum INTEGER DEFAULT 0,
        language_distribution TEXT,
        last_updated DATETIME,
        calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id)
      )
    `.replace(/\s+/g, ' ').trim()).run();
    
    // 创建用户评分表
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS user_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        score REAL NOT NULL DEFAULT 0,
        algorithm_version TEXT NOT NULL DEFAULT 'V1',
        calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, algorithm_version)
      )
    `.replace(/\s+/g, ' ').trim()).run();
    
    // 创建索引提升查询性能
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_user_scores_user_id ON user_scores(user_id)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_user_scores_score ON user_scores(score DESC)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_user_scores_algorithm ON user_scores(algorithm_version)').run();
  },
  
  async down(db: D1Database) {
    // 删除索引
    await db.prepare('DROP INDEX IF EXISTS idx_user_scores_algorithm').run();
    await db.prepare('DROP INDEX IF EXISTS idx_user_scores_score').run();
    await db.prepare('DROP INDEX IF EXISTS idx_user_scores_user_id').run();
    await db.prepare('DROP INDEX IF EXISTS idx_user_stats_user_id').run();
    
    // 删除表
    await db.prepare('DROP TABLE IF EXISTS user_scores').run();
    await db.prepare('DROP TABLE IF EXISTS user_stats').run();
  }
};