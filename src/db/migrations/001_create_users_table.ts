/**
 * 001 - 创建用户表迁移
 * 定义用户表结构，支持 GitHub 登录
 */

import type { Migration } from './index';

export const migration001: Migration = {
  id: '001',
  description: '创建用户表',
  
  async up(db: D1Database) {
    // 创建用户表
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        image TEXT,
        github_id TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `.replace(/\s+/g, ' ').trim()).run();
    
    // 创建会话表
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `.replace(/\s+/g, ' ').trim()).run();
    
    // 插入初始数据
    const count = await db.prepare('SELECT COUNT(*) as count FROM users').first();
    if (count && (count as { count: number }).count === 0) {
      await db.prepare("INSERT OR IGNORE INTO users (name, email, image, github_id) VALUES ('张三', 'zhangsan@example.com', 'https://avatars.githubusercontent.com/u/1234567?v=4', '1234567')").run();
      await db.prepare("INSERT OR IGNORE INTO users (name, email, image, github_id) VALUES ('李四', 'lisi@example.com', 'https://avatars.githubusercontent.com/u/7654321?v=4', '7654321')").run();
    }
  },
  
  async down(db: D1Database) {
    await db.prepare('DROP TABLE IF EXISTS sessions').run();
    await db.prepare('DROP TABLE IF EXISTS users').run();
  }
}; 