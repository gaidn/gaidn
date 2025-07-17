/**
 * 数据库设置验证脚本
 * 验证环境切换和迁移系统
 */

import { getDB, currentDBType } from '../src/lib/db.js';
import { migrationManager } from '../src/db/migrations/index.js';

async function verifyDatabaseSetup() {
  console.log('🔍 开始验证数据库设置...');
  
  try {
    // 1. 验证数据库连接
    console.log('\n1. 验证数据库连接...');
    console.log('环境变量 NODE_ENV:', process.env.NODE_ENV);
    
    const db = await getDB();
    console.log('✅ 数据库连接成功');
    console.log('当前数据库类型:', currentDBType);
    
    // 2. 验证迁移系统
    console.log('\n2. 验证迁移系统...');
    
    if (currentDBType === 'real') {
      console.log('📦 真实数据库环境 - 执行迁移检查');
      const status = await migrationManager.getStatus(db);
      
      console.log('迁移状态:');
      status.forEach(migration => {
        const statusText = migration.executed ? '✅ 已执行' : '❌ 未执行';
        console.log(`  ${migration.id}: ${statusText} - ${migration.description}`);
        if (migration.executedAt) {
          console.log(`    执行时间: ${migration.executedAt}`);
        }
      });
    } else {
      console.log('🎭 模拟数据库环境 - 跳过真实迁移检查');
    }
    
    // 3. 验证基础操作
    console.log('\n3. 验证基础数据库操作...');
    
    // 查询用户表
    const result = await db.prepare('SELECT COUNT(*) as count FROM users').first();
    console.log('✅ 用户表查询成功，用户数量:', result?.count || 0);
    
    // 查询迁移表
    const migrationResult = await db.prepare('SELECT COUNT(*) as count FROM _migrations').first();
    console.log('✅ 迁移表查询成功，迁移数量:', migrationResult?.count || 0);
    
    console.log('\n🎉 数据库设置验证完成！');
    console.log('📋 总结:');
    console.log(`  - 数据库类型: ${currentDBType}`);
    console.log(`  - 环境: ${process.env.NODE_ENV}`);
    console.log('  - 所有基础操作正常');
    
  } catch (error) {
    console.error('\n❌ 数据库设置验证失败:');
    console.error(error);
    process.exit(1);
  }
}

// 运行验证
verifyDatabaseSetup();