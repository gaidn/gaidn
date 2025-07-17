/**
 * 002 - 扩展用户表迁移
 * 添加更多 GitHub 用户信息字段，创建仓库和语言统计表
 */

import type { Migration } from './index';

export const migration002: Migration = {
  id: '002',
  description: '扩展用户表，添加 GitHub 详细信息',
  
  async up(db: D1Database) {
    console.log('🔄 执行迁移: 扩展用户表结构');
    
    // 扩展用户表字段
    await db.prepare('ALTER TABLE users ADD COLUMN login TEXT').run();
    await db.prepare('ALTER TABLE users ADD COLUMN bio TEXT').run();
    await db.prepare('ALTER TABLE users ADD COLUMN company TEXT').run();
    await db.prepare('ALTER TABLE users ADD COLUMN location TEXT').run();
    await db.prepare('ALTER TABLE users ADD COLUMN blog TEXT').run();
    await db.prepare('ALTER TABLE users ADD COLUMN public_repos INTEGER DEFAULT 0').run();
    await db.prepare('ALTER TABLE users ADD COLUMN public_gists INTEGER DEFAULT 0').run();
    await db.prepare('ALTER TABLE users ADD COLUMN followers INTEGER DEFAULT 0').run();
    await db.prepare('ALTER TABLE users ADD COLUMN following INTEGER DEFAULT 0').run();
    await db.prepare('ALTER TABLE users ADD COLUMN github_created_at DATETIME').run();
    await db.prepare('ALTER TABLE users ADD COLUMN github_updated_at DATETIME').run();
    
    console.log('✅ 用户表字段扩展完成');
    
    // 创建用户仓库表
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS user_repositories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        repo_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL,
        description TEXT,
        language TEXT,
        stars INTEGER DEFAULT 0,
        forks INTEGER DEFAULT 0,
        is_private BOOLEAN DEFAULT FALSE,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        pushed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, repo_id)
      )
    `.replace(/\s+/g, ' ').trim()).run();
    
    console.log('✅ 用户仓库表创建完成');
    
    // 创建用户语言统计表
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS user_languages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        language TEXT NOT NULL,
        bytes INTEGER NOT NULL,
        percentage REAL NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, language)
      )
    `.replace(/\s+/g, ' ').trim()).run();
    
    console.log('✅ 用户语言统计表创建完成');
    
    // 创建用户组织表
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS user_organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        org_id INTEGER NOT NULL,
        login TEXT NOT NULL,
        name TEXT,
        avatar_url TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, org_id)
      )
    `.replace(/\s+/g, ' ').trim()).run();
    
    console.log('✅ 用户组织表创建完成');
    
    // 创建索引提升查询性能
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_user_repositories_user_id ON user_repositories(user_id)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_user_repositories_language ON user_repositories(language)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON user_languages(user_id)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id)').run();
    
    console.log('✅ 索引创建完成');
  },
  
  async down(db: D1Database) {
    console.log('🔄 回滚迁移: 删除扩展表和字段');
    
    // 删除创建的表
    await db.prepare('DROP TABLE IF EXISTS user_organizations').run();
    await db.prepare('DROP TABLE IF EXISTS user_languages').run();
    await db.prepare('DROP TABLE IF EXISTS user_repositories').run();
    
    console.log('✅ 扩展表删除完成');
    
    // 注意：SQLite 不支持 DROP COLUMN，所以无法直接删除添加的字段
    // 如果需要完全回滚，需要重新创建表结构
    console.log('⚠️  注意：SQLite 不支持删除列，扩展字段将保留');
  }
};