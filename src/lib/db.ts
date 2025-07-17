/**
 * 数据库连接管理核心
 * 实现环境自适应的数据库连接，支持开发、预览和生产环境
 */

import { mockDB } from '@/db/mock-db';

export let currentDBType: 'mock' | 'real' = 'mock';

/**
 * 获取数据库连接
 * 根据当前环境自动选择合适的数据库实例
 */
export async function getDB(): Promise<D1Database> {
  try {
    console.log('环境变量 NODE_ENV:', process.env.NODE_ENV);
    
    let db: D1Database;
    
    if (process.env.NODE_ENV === 'development') {
      // 开发环境：使用 Mock 数据库
      console.log('📝 开发环境 - 使用模拟数据库');
      currentDBType = 'mock';
      db = mockDB;
      
      // 在开发环境中也执行迁移
      try {
        console.log('🔄 开发环境 - 开始执行数据库迁移...');
        const { migrationManager } = await import('@/db/migrations');
        await migrationManager.migrate(db);
        console.log('✅ 开发环境 - 数据库迁移完成');
      } catch (error) {
        console.error('❌ 开发环境 - 数据库迁移失败:', error);
      }
    } else {
      // 生产/预览环境：使用真实的 D1 数据库
      try {
        const { getCloudflareContext } = await import('@opennextjs/cloudflare');
        const { env } = getCloudflareContext();
        if (env.DB) {
          console.log('✅ 生产/预览环境 - 使用真实的 D1 数据库');
          currentDBType = 'real';
          db = env.DB;
          
          // 执行数据库迁移
          console.log('🔄 开始执行数据库迁移...');
          const { migrationManager } = await import('@/db/migrations');
          await migrationManager.migrate(db);
          console.log('✅ 数据库迁移完成');
        } else {
          throw new Error('未找到 DB 绑定');
        }
      } catch (error) {
        console.error('❌ 获取真实数据库连接失败，回退到模拟数据库:', error);
        console.log('📝 回退到模拟数据库');
        currentDBType = 'mock';
        db = mockDB;
      }
    }
    
    return db;
  } catch (error) {
    console.error('获取数据库连接失败:', error);
    throw new Error('数据库连接失败');
  }
} 