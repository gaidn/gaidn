/**
 * 数据库模拟工具
 * 用于测试环境中模拟D1数据库行为
 */

import type { User } from '@/types/user';

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: 1,
    name: '测试用户1',
    email: 'test1@example.com',
    image: 'https://example.com/avatar1.jpg',
    github_id: 'github123',
    created_at: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    name: '测试用户2',
    email: 'test2@example.com',
    created_at: '2023-01-02T00:00:00.000Z'
  }
];

// 模拟迁移数据
export const mockMigrations: { id: string; description: string; executed_at: string }[] = [
  {
    id: '001_create_users_table',
    description: '创建用户表',
    executed_at: '2023-01-01T00:00:00.000Z'
  }
];

// 创建可重置的测试数据库
export function createTestDB() {
  // 深拷贝初始数据，确保测试之间互不影响
  let users = JSON.parse(JSON.stringify(mockUsers));
  let migrations = JSON.parse(JSON.stringify(mockMigrations));
  let nextUserId = users.length + 1;

  // 模拟D1数据库
  const testDB = {
    prepare: (sql: string) => {
      return {
        all: () => {
          if (sql.includes('SELECT * FROM users')) {
            return Promise.resolve({ results: users, success: true });
          }
          
          if (sql.includes('SELECT * FROM _migrations')) {
            return Promise.resolve({ results: migrations, success: true });
          }
          
          return Promise.resolve({ results: [], success: true });
        },
        
        bind: (...params: any[]) => {
          return {
            first: () => {
              // 用户查询
              if (sql.includes('SELECT * FROM users WHERE id = ?')) {
                const id = params[0] as number;
                const user = users.find((u: User) => u.id === id);
                return Promise.resolve(user || null);
              }
              
              if (sql.includes('SELECT * FROM users WHERE email = ?')) {
                const email = params[0] as string;
                const user = users.find((u: User) => u.email === email);
                return Promise.resolve(user || null);
              }
              
              if (sql.includes('SELECT * FROM users WHERE github_id = ?')) {
                const githubId = params[0] as string;
                const user = users.find((u: User) => u.github_id === githubId);
                return Promise.resolve(user || null);
              }
              
              // 迁移查询
              if (sql.includes('SELECT id FROM _migrations WHERE id = ?')) {
                const id = params[0] as string;
                const migration = migrations.find((m: {id: string}) => m.id === id);
                return Promise.resolve(migration || null);
              }
              
              // 插入用户
              if (sql.includes('INSERT INTO users')) {
                const newUser: User = {
                  id: nextUserId++,
                  name: params[0] as string,
                  email: params[1] as string,
                  image: params[2] as string | undefined,
                  github_id: params[3] as string | undefined,
                  created_at: new Date().toISOString()
                };
                users.push(newUser);
                return Promise.resolve(newUser);
              }
              
              // 插入迁移记录
              if (sql.includes('INSERT INTO _migrations')) {
                const newMigration = {
                  id: params[0] as string,
                  description: params[1] as string,
                  executed_at: new Date().toISOString()
                };
                migrations.push(newMigration);
                return Promise.resolve(newMigration);
              }
              
              // 更新用户并返回结果 (RETURNING)
              if (sql.includes('UPDATE users SET') && sql.includes('RETURNING')) {
                const id = params[params.length - 1] as number;
                const index = users.findIndex((u: User) => u.id === id);
                if (index !== -1) {
                  // 解析 SQL 中的字段更新
                  const updateFields = sql.split('SET ')[1].split(' WHERE')[0];
                  const fields = updateFields.split(', ');
                  let paramIndex = 0;
                  
                  const updatedUser = { ...users[index] };
                  
                  fields.forEach(field => {
                    const fieldName = field.split(' = ?')[0].trim();
                    if (paramIndex < params.length - 1) {
                      switch (fieldName) {
                        case 'name':
                          updatedUser.name = params[paramIndex] as string;
                          break;
                        case 'email':
                          updatedUser.email = params[paramIndex] as string;
                          break;
                        case 'image':
                          updatedUser.image = params[paramIndex] as string;
                          break;
                        case 'github_id':
                          updatedUser.github_id = params[paramIndex] as string;
                          break;
                      }
                      paramIndex++;
                    }
                  });
                  
                  users[index] = updatedUser;
                  return Promise.resolve(updatedUser);
                }
                return Promise.resolve(null);
              }
              
              return Promise.resolve(null);
            },
            
            run: () => {
              // 删除用户
              if (sql.includes('DELETE FROM users WHERE id = ?')) {
                const id = params[0] as number;
                const index = users.findIndex((u: User) => u.id === id);
                if (index !== -1) {
                  users.splice(index, 1);
                }
                return Promise.resolve({ success: true });
              }
              
              // 更新用户 - 支持动态字段更新并返回 RETURNING *
              if (sql.includes('UPDATE users SET')) {
                const id = params[params.length - 1] as number;
                const index = users.findIndex((u: User) => u.id === id);
                if (index !== -1) {
                  // 解析 SQL 中的字段更新
                  const updateFields = sql.split('SET ')[1].split(' WHERE')[0];
                  const fields = updateFields.split(', ');
                  let paramIndex = 0;
                  
                  const updatedUser = { ...users[index] };
                  
                  fields.forEach(field => {
                    const fieldName = field.split(' = ?')[0].trim();
                    if (paramIndex < params.length - 1) {
                      switch (fieldName) {
                        case 'name':
                          updatedUser.name = params[paramIndex] as string;
                          break;
                        case 'email':
                          updatedUser.email = params[paramIndex] as string;
                          break;
                        case 'image':
                          updatedUser.image = params[paramIndex] as string;
                          break;
                        case 'github_id':
                          updatedUser.github_id = params[paramIndex] as string;
                          break;
                      }
                      paramIndex++;
                    }
                  });
                  
                  users[index] = updatedUser;
                  
                  // 如果 SQL 包含 RETURNING，返回更新后的用户
                  if (sql.includes('RETURNING')) {
                    return Promise.resolve({ success: true, results: [updatedUser] });
                  }
                  
                  return Promise.resolve({ success: true });
                }
                return Promise.resolve({ success: false });
              }
              
              return Promise.resolve({ success: true });
            },
            
            all: () => Promise.resolve({ results: [], success: true })
          };
        },
        
        first: () => {
          if (sql.includes('SELECT COUNT(*) as count FROM _migrations')) {
            return Promise.resolve({ count: migrations.length });
          }
          return Promise.resolve(null);
        },
        
        run: () => {
          if (sql.includes('CREATE TABLE')) {
            return Promise.resolve({ success: true });
          }
          return Promise.resolve({ success: true });
        }
      };
    },
    
    exec: (sql: string) => {
      return Promise.resolve({ success: true });
    }
  };

  // 重置测试数据的方法
  const resetTestData = () => {
    users = JSON.parse(JSON.stringify(mockUsers));
    migrations = JSON.parse(JSON.stringify(mockMigrations));
    nextUserId = users.length + 1;
  };

  return { testDB, resetTestData };
}

// 导出可重用的测试数据库实例
export const { testDB, resetTestData } = createTestDB(); 