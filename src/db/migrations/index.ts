/**
 * 数据库迁移管理器 - Migration 系统的指挥中心
 */

// 导入迁移文件
import { migration001 } from './001_create_users_table';
import { migration002 } from './002_extend_users_table';

// 定义迁移接口
export interface Migration {
  id: string;
  description: string;
  up: (db: D1Database) => Promise<void>;
  down: (db: D1Database) => Promise<void>;
}

// 迁移注册中心
const migrations: Migration[] = [
  migration001,
  migration002,
  // 添加新迁移时在这里注册
];

export interface MigrationManager {
  migrate(db: D1Database): Promise<void>;
  rollback(db: D1Database, steps?: number): Promise<void>;
  getStatus(db: D1Database): Promise<MigrationStatus[]>;
}

export interface MigrationStatus {
  id: string;
  description: string;
  executed: boolean;
  executedAt?: string;
}

export class DefaultMigrationManager implements MigrationManager {
  
  private async createMigrationTable(db: D1Database): Promise<void> {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `.replace(/\s+/g, ' ').trim()).run();
  }
  
  private async isMigrationExecuted(db: D1Database, migrationId: string): Promise<boolean> {
    const result = await db.prepare(
      'SELECT id FROM _migrations WHERE id = ?'
    ).bind(migrationId).first();
    return result !== null;
  }
  
  private async recordMigration(db: D1Database, migration: Migration): Promise<void> {
    await db.prepare(
      'INSERT INTO _migrations (id, description) VALUES (?, ?)'
    ).bind(migration.id, migration.description).run();
  }
  
  async migrate(db: D1Database): Promise<void> {
    try {
      await this.createMigrationTable(db);
      
      for (const migration of migrations) {
        const isExecuted = await this.isMigrationExecuted(db, migration.id);
        
        if (!isExecuted) {
          await migration.up(db);
          await this.recordMigration(db, migration);
        }
      }
      
    } catch (error) {
      throw error;
    }
  }
  
  async rollback(db: D1Database, steps = 1): Promise<void> {
    try {
      // 获取所有已执行的迁移
      const result = await db.prepare(
        'SELECT id FROM _migrations ORDER BY executed_at DESC LIMIT ?'
      ).bind(steps).all();
      
      const executedMigrations = result.results as { id: string }[];
      
      for (const { id } of executedMigrations) {
        const migration = migrations.find(m => m.id === id);
        if (migration) {
          await migration.down(db);
          await db.prepare('DELETE FROM _migrations WHERE id = ?').bind(id).run();
        }
      }
      
    } catch (error) {
      throw error;
    }
  }
  
  async getStatus(db: D1Database): Promise<MigrationStatus[]> {
    try {
      await this.createMigrationTable(db);
      
      const result = await db.prepare('SELECT id, description, executed_at FROM _migrations').all();
      const executedMigrations = result.results as { id: string; description: string; executed_at: string }[];
      
      return migrations.map(migration => {
        const executed = executedMigrations.find(m => m.id === migration.id);
        return {
          id: migration.id,
          description: migration.description,
          executed: !!executed,
          executedAt: executed?.executed_at
        };
      });
    } catch (error) {
      throw error;
    }
  }
}

export const migrationManager = new DefaultMigrationManager();
export { migrations }; 