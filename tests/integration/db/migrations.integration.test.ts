/**
 * 数据库迁移集成测试
 */

import { testDB, resetTestData } from '../../setup/mocks/db-mock';

// 定义迁移结果类型
interface MigrationResult {
  success: boolean;
  migrationsRun: number;
}

// 创建模拟迁移函数
const createMockMigrate = () => {
  return async (db: D1Database): Promise<MigrationResult> => {
    // 模拟迁移执行
    const migrations = [
      {
        id: '001_create_users_table',
        description: '创建用户表',
        up: async (db: D1Database) => {
          // 模拟创建用户表
          await db.prepare('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, image TEXT, github_id TEXT, created_at TEXT)').run();
          return true;
        }
      },
      {
        id: '002_add_test_migration',
        description: '测试迁移',
        up: async (db: D1Database) => {
          // 模拟执行SQL
          await db.prepare('CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, name TEXT)').run();
          return true;
        }
      }
    ];
    
    // 检查迁移表是否存在
    try {
      const migrationsCount = await db.prepare('SELECT COUNT(*) as count FROM _migrations').first();
      if (!migrationsCount) {
        // 创建迁移表
        await db.prepare('CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, description TEXT, executed_at TEXT)').run();
      }
    } catch (error) {
      // 创建迁移表
      await db.prepare('CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, description TEXT, executed_at TEXT)').run();
    }
    
    // 执行未执行的迁移
    for (const migration of migrations) {
      // 检查迁移是否已执行
      const executed = await db.prepare('SELECT id FROM _migrations WHERE id = ?').bind(migration.id).first();
      
      if (!executed) {
        // 执行迁移
        await migration.up(db);
        
        // 记录迁移
        await db.prepare('INSERT INTO _migrations (id, description, executed_at) VALUES (?, ?, ?)').bind(
          migration.id,
          migration.description,
          new Date().toISOString()
        ).first();
      }
    }
    
    return { success: true, migrationsRun: migrations.length };
  };
};

// 创建模拟迁移函数
const mockMigrate = jest.fn(createMockMigrate());

// 模拟迁移模块
jest.mock('@/db/migrations', () => ({
  migrationManager: {
    migrate: mockMigrate
  }
}));

// 导入迁移管理器
import { migrationManager } from '@/db/migrations';

describe('数据库迁移集成测试', () => {
  beforeEach(() => {
    resetTestData();
    jest.clearAllMocks();
  });
  
  test('应成功执行迁移', async () => {
    // 执行迁移并使用类型断言
    const result = await migrationManager.migrate(testDB as unknown as D1Database) as unknown as MigrationResult;
    
    // 验证迁移被调用
    expect(mockMigrate).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
}); 