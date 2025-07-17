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
  console.log(`🔌 开始获取数据库连接 (环境: ${process.env.NODE_ENV})`);
  
  try {
    let db: D1Database;
    
    if (process.env.NODE_ENV === 'development') {
      // 开发环境：默认使用本地 D1，除非明确设置使用 Mock
      if (process.env.USE_MOCK_DB !== 'true') {
        console.log(`🔧 尝试连接开发环境 D1 数据库...`);
        try {
          // 在开发环境中使用本地 D1 数据库
          const { getCloudflareContext } = await import('@opennextjs/cloudflare');
          const { env } = getCloudflareContext();
          
          if (env.DB) {
            currentDBType = 'real';
            db = env.DB;
            console.log(`✅ 成功连接开发环境 D1 数据库`);
            
            // 执行数据库迁移
            try {
              console.log(`🔄 开始执行数据库迁移...`);
              const { migrationManager } = await import('@/db/migrations');
              await migrationManager.migrate(db);
              console.log(`✅ 数据库迁移执行完成`);
            } catch (migrationError) {
              console.error(`❌ 数据库迁移失败:`, migrationError);
              throw new Error(`数据库迁移失败: ${migrationError instanceof Error ? migrationError.message : '未知错误'}`);
            }
          } else {
            throw new Error('本地 D1 数据库未找到，回退到 Mock 数据库');
          }
        } catch (error) {
          console.warn(`⚠️ 开发环境 D1 连接失败，回退到 Mock 数据库:`, error);
          currentDBType = 'mock';
          db = mockDB;
          
          // 在开发环境中也执行迁移
          try {
            console.log(`🔄 为 Mock 数据库执行迁移...`);
            const { migrationManager } = await import('@/db/migrations');
            await migrationManager.migrate(db);
            console.log(`✅ Mock 数据库迁移完成`);
          } catch (migrationError) {
            console.error(`❌ Mock 数据库迁移失败:`, migrationError);
            // 迁移失败，静默处理
          }
        }
      } else {
        // 明确设置使用 Mock 数据库
        console.log(`🧪 使用 Mock 数据库 (USE_MOCK_DB=true)`);
        currentDBType = 'mock';
        db = mockDB;
        
        // 在开发环境中也执行迁移
        try {
          console.log(`🔄 为 Mock 数据库执行迁移...`);
          const { migrationManager } = await import('@/db/migrations');
          await migrationManager.migrate(db);
          console.log(`✅ Mock 数据库迁移完成`);
        } catch (migrationError) {
          console.error(`❌ Mock 数据库迁移失败:`, migrationError);
          // 迁移失败，静默处理
        }
      }
    } else {
      // 生产/预览环境：使用真实的 D1 数据库
      console.log(`🏭 尝试连接生产环境 D1 数据库...`);
      try {
        const { getCloudflareContext } = await import('@opennextjs/cloudflare');
        const { env } = getCloudflareContext();
        if (env.DB) {
          currentDBType = 'real';
          db = env.DB;
          console.log(`✅ 成功连接生产环境 D1 数据库`);
          
          // 执行数据库迁移
          try {
            console.log(`🔄 开始执行生产环境数据库迁移...`);
            const { migrationManager } = await import('@/db/migrations');
            await migrationManager.migrate(db);
            console.log(`✅ 生产环境数据库迁移执行完成`);
          } catch (migrationError) {
            console.error(`❌ 生产环境数据库迁移失败:`, migrationError);
            throw new Error(`生产环境数据库迁移失败: ${migrationError instanceof Error ? migrationError.message : '未知错误'}`);
          }
        } else {
          throw new Error('未找到 DB 绑定');
        }
      } catch (error) {
        console.error(`❌ 生产环境 D1 连接失败，回退到 Mock 数据库:`, error);
        currentDBType = 'mock';
        db = mockDB;
        
        // 在生产环境回退到 Mock 时也执行迁移
        try {
          console.log(`🔄 为回退的 Mock 数据库执行迁移...`);
          const { migrationManager } = await import('@/db/migrations');
          await migrationManager.migrate(db);
          console.log(`✅ 回退的 Mock 数据库迁移完成`);
        } catch (migrationError) {
          console.error(`❌ 回退的 Mock 数据库迁移失败:`, migrationError);
          // 迁移失败，静默处理
        }
      }
    }
    
    console.log(`🎯 数据库连接成功，类型: ${currentDBType}`);
    return db;
  } catch (error) {
    console.error(`🚨 数据库连接失败:`, error);
    throw new Error(`数据库连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
} 