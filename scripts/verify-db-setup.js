/**
 * 数据库设置验证脚本
 * 验证环境切换和迁移系统
 */

import { getDB, currentDBType } from '../src/lib/db.js';
import { migrationManager } from '../src/db/migrations/index.js';

async function verifyDatabaseSetup() {
  try {
    const db = await getDB();
    
    if (currentDBType === 'real') {
      const status = await migrationManager.getStatus(db);
      
      status.forEach(migration => {
        const statusText = migration.executed ? '✅ 已执行' : '❌ 未执行';
        console.log(`${migration.id}: ${statusText} - ${migration.description}`);
        if (migration.executedAt) {
          console.log(`  执行时间: ${migration.executedAt}`);
        }
      });
    }
    
    // 查询用户表
    const result = await db.prepare('SELECT COUNT(*) as count FROM users').first();
    console.log('用户数量:', result?.count || 0);
    
    // 查询迁移表
    const migrationResult = await db.prepare('SELECT COUNT(*) as count FROM _migrations').first();
    console.log('迁移数量:', migrationResult?.count || 0);
    
  } catch (error) {
    console.error('数据库设置验证失败:', error);
    process.exit(1);
  }
}

// 运行验证
verifyDatabaseSetup();