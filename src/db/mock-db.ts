/**
 * 模拟数据库实现
 * 用于开发环境快速迭代，模拟 D1 数据库接口
 */

import type { User } from '@/types/user';

// 模拟数据存储
const mockUsers: User[] = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    image: 'https://avatars.githubusercontent.com/u/1234567?v=4',
    github_id: '1234567',
    login: 'zhangsan',
    bio: undefined,
    company: undefined,
    location: undefined,
    blog: undefined,
    public_repos: 0,
    public_gists: 0,
    followers: 0,
    following: 0,
    github_created_at: undefined,
    github_updated_at: undefined,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: '李四', 
    email: 'lisi@example.com',
    image: 'https://avatars.githubusercontent.com/u/7654321?v=4',
    github_id: '7654321',
    login: 'lisi',
    bio: undefined,
    company: undefined,
    location: undefined,
    blog: undefined,
    public_repos: 0,
    public_gists: 0,
    followers: 0,
    following: 0,
    github_created_at: undefined,
    github_updated_at: undefined,
    created_at: new Date().toISOString()
  }
];

// 模拟迁移表
const mockMigrations: { id: string; description: string; executed_at: string }[] = [];

let nextUserId = 3;

/**
 * 模拟 D1Database 接口
 */
export const mockDB = {
  prepare(sql: string) {
    console.log('Mock SQL:', sql);
    
    return {
      all() {
        if (sql.includes('SELECT * FROM users')) {
          return Promise.resolve({
            results: mockUsers,
            success: true
          });
        }
        
        if (sql.includes('SELECT * FROM _migrations')) {
          return Promise.resolve({
            results: mockMigrations,
            success: true
          });
        }
        
        return Promise.resolve({ results: [], success: true });
      },
      
      bind(...params: unknown[]) {
        return {
          first() {
            // 用户查询
            if (sql.includes('SELECT * FROM users WHERE id = ?')) {
              const id = params[0] as number;
              const user = mockUsers.find(u => u.id === id);
              return Promise.resolve(user || null);
            }
            
            if (sql.includes('SELECT * FROM users WHERE email = ?')) {
              const email = params[0] as string;
              const user = mockUsers.find(u => u.email === email);
              return Promise.resolve(user || null);
            }
            
            if (sql.includes('SELECT * FROM users WHERE github_id = ?')) {
              const githubId = params[0] as string;
              const user = mockUsers.find(u => u.github_id === githubId);
              return Promise.resolve(user || null);
            }
            
            // 迁移查询
            if (sql.includes('SELECT id FROM _migrations WHERE id = ?')) {
              const id = params[0] as string;
              const migration = mockMigrations.find(m => m.id === id);
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
                login: params[4] as string | undefined,
                bio: params[5] as string | undefined,
                company: params[6] as string | undefined,
                location: params[7] as string | undefined,
                blog: params[8] as string | undefined,
                public_repos: params[9] as number | undefined || 0,
                public_gists: params[10] as number | undefined || 0,
                followers: params[11] as number | undefined || 0,
                following: params[12] as number | undefined || 0,
                github_created_at: params[13] as string | undefined,
                github_updated_at: params[14] as string | undefined,
                created_at: new Date().toISOString()
              };
              mockUsers.push(newUser);
              return Promise.resolve(newUser);
            }
            
            // 插入迁移记录
            if (sql.includes('INSERT INTO _migrations')) {
              const newMigration = {
                id: params[0] as string,
                description: params[1] as string,
                executed_at: new Date().toISOString()
              };
              mockMigrations.push(newMigration);
              return Promise.resolve(newMigration);
            }
            
            return Promise.resolve(null);
          },
          
          run() {
            // 创建表
            if (sql.includes('CREATE TABLE')) {
              console.log('Mock: 创建表');
              return Promise.resolve({ success: true });
            }
            
            // 删除用户
            if (sql.includes('DELETE FROM users WHERE id = ?')) {
              const id = params[0] as number;
              const index = mockUsers.findIndex(u => u.id === id);
              if (index !== -1) {
                mockUsers.splice(index, 1);
              }
              return Promise.resolve({ success: true });
            }
            
            // 更新用户 - 支持动态字段更新
            if (sql.includes('UPDATE users SET')) {
              const id = params[params.length - 1] as number;
              const index = mockUsers.findIndex(u => u.id === id);
              if (index !== -1) {
                // 解析 SQL 中的字段更新
                const updateFields = sql.split('SET ')[1].split(' WHERE')[0];
                const fields = updateFields.split(', ');
                let paramIndex = 0;
                
                fields.forEach(field => {
                  const fieldName = field.split(' = ?')[0].trim();
                  if (paramIndex < params.length - 1) {
                    switch (fieldName) {
                      case 'name':
                        mockUsers[index].name = params[paramIndex] as string;
                        break;
                      case 'email':
                        mockUsers[index].email = params[paramIndex] as string;
                        break;
                      case 'image':
                        mockUsers[index].image = params[paramIndex] as string;
                        break;
                      case 'github_id':
                        mockUsers[index].github_id = params[paramIndex] as string;
                        break;
                      case 'login':
                        mockUsers[index].login = params[paramIndex] as string;
                        break;
                      case 'bio':
                        mockUsers[index].bio = params[paramIndex] as string;
                        break;
                      case 'company':
                        mockUsers[index].company = params[paramIndex] as string;
                        break;
                      case 'location':
                        mockUsers[index].location = params[paramIndex] as string;
                        break;
                      case 'blog':
                        mockUsers[index].blog = params[paramIndex] as string;
                        break;
                      case 'public_repos':
                        mockUsers[index].public_repos = params[paramIndex] as number;
                        break;
                      case 'public_gists':
                        mockUsers[index].public_gists = params[paramIndex] as number;
                        break;
                      case 'followers':
                        mockUsers[index].followers = params[paramIndex] as number;
                        break;
                      case 'following':
                        mockUsers[index].following = params[paramIndex] as number;
                        break;
                      case 'github_created_at':
                        mockUsers[index].github_created_at = params[paramIndex] as string;
                        break;
                      case 'github_updated_at':
                        mockUsers[index].github_updated_at = params[paramIndex] as string;
                        break;
                    }
                    paramIndex++;
                  }
                });
                
                return Promise.resolve(mockUsers[index]);
              }
              return Promise.resolve(null);
            }
            
            return Promise.resolve({ success: true });
          },
          
          all() {
            return Promise.resolve({ results: [], success: true });
          }
        };
      },
      
      first() {
        if (sql.includes('SELECT COUNT(*) as count FROM _migrations')) {
          return Promise.resolve({ count: mockMigrations.length });
        }
        return Promise.resolve(null);
      },
      
      run() {
        if (sql.includes('CREATE TABLE')) {
          console.log('Mock: 创建表');
          return Promise.resolve({ success: true });
        }
        return Promise.resolve({ success: true });
      }
    };
  },
  
  // 添加 exec 方法模拟
  exec(sql: string) {
    console.log('Mock SQL exec:', sql);
    return Promise.resolve({ success: true });
  }
} as unknown as D1Database; 