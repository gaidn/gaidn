# Next.js + Cloudflare D1 集成架构模板

## 🚀 架构概述

这是 **Next.js 15 + Cloudflare D1** 数据库架构解决方案，采用 **Migration-First** 设计，支持多环境自动切换，通过统一的抽象层实现环境无关的数据库操作。

### ✨ 核心特性

- 🎮 **环境自适应**：开发、预览、生产环境自动切换
- 🧠 **Migration-First**：专业的数据库版本管理系统  
- 🎭 **Mock 数据库**：开发环境快速迭代
- 📦 **组件化设计**：模块化、可复用的架构
- 🔒 **类型安全**：全面的 TypeScript 支持
- ⚡ **性能优化**：针对 Cloudflare Workers 优化

## 📁 项目架构

### 推荐目录结构

```
your-nextjs-project/
├── 📁 src/
│   ├── 📁 lib/
│   │   └── 📄 db.ts                    # 🎮 数据库连接管理核心
│   ├── 📁 db/
│   │   ├── 📄 mock-db.ts              # 🎭 Mock数据库实现
│   │   └── 📁 migrations/             # 🚀 Migration 系统
│   │       ├── 📄 index.ts            # 🧠 迁移管理器
│   │       └── 📄 001_create_users_table.ts  # 📝 迁移文件示例
│   ├── 📁 models/                     # 💼 数据模型层（一个数据表一个文件）
│   │   └── 📄 user.ts                 # 用户数据模型
│   ├── 📁 services/                   # 🏢 业务逻辑层
│   │   └── 📄 user.service.ts         # 用户业务逻辑服务
│   ├── 📁 types/                      # 📋 TypeScript 类型定义
│   │   └── 📄 user.ts                 # 用户类型定义
│   ├── 📁 components/                 # 🧩 React 组件
│   │   ├── 📁 ui/                     # 基础 UI 组件
│   │   └── 📁 blocks/                 # 业务组件块
│   └── 📁 app/                        # Next.js App Router
│       └── 📁 api/                    # API 路由
│           └── 📁 users/
│               └── 📄 route.ts        # 🔌 用户 API
├── 📄 wrangler.jsonc                  # ☁️ Cloudflare 配置
├── 📄 package.json                    # 📦 项目配置
└── 📄 env.d.ts                        # 📝 环境类型定义
```

### 🏗️ 架构分层

| 层级 | 目录 | 职责 | 说明 |
|------|------|------|------|
| **连接层** | `src/lib/` | 🎮 数据库连接与环境检测 | 统一抽象，自动切换 |
| **数据层** | `src/db/` | 🗄️ 数据存储与迁移管理 | Mock、Migration |
| **模型层** | `src/models/` | 💼 数据库操作封装 | 纯数据访问，CRUD操作 |
| **服务层** | `src/services/` | 🏢 业务逻辑处理 | 复杂业务规则，跨模型操作 |
| **类型层** | `src/types/` | 📋 TypeScript 类型定义 | 类型安全保障 |
| **路由层** | `src/app/api/` | 🔌 API 接口控制 | 请求处理，调用服务层 |

### 🎯 层级职责详解

#### 💾 **模型层 (Models)** - 纯数据访问
- **职责**：封装数据库 CRUD 操作
- **特点**：一个数据表对应一个模型文件
- **原则**：只包含数据访问逻辑，不包含业务规则
- **示例**：`getUserById()`, `createUser()`, `updateUser()`

#### 🏢 **服务层 (Services)** - 业务逻辑处理
- **职责**：处理复杂业务规则和跨模型操作
- **特点**：包含验证、权限检查、数据转换等逻辑
- **原则**：调用模型层，不直接操作数据库
- **示例**：用户注册验证、邮箱唯一性检查、权限控制

#### 🔌 **路由层 (API Routes)** - 接口控制
- **职责**：处理 HTTP 请求和响应
- **特点**：参数验证、格式转换、错误处理
- **原则**：调用服务层，不直接调用模型层
- **示例**：请求参数解析、响应格式统一、状态码设置

## 🎮 核心实现

### 1. 数据库连接管理 (`src/lib/db.ts`)

```typescript
import { mockDB } from '@/db/mock-db';
import { migrationManager } from '@/db/migrations';

export let currentDBType: 'mock' | 'real' = 'mock';

export async function getDB(): Promise<D1Database> {
  try {
    console.log('环境变量 NODE_ENV:', process.env.NODE_ENV);
    
    let db: D1Database;
    
    if (process.env.NODE_ENV === 'development') {
      // 🎭 开发环境：使用 Mock 数据库
      console.log('📝 开发环境 - 使用模拟数据库');
      currentDBType = 'mock';
      db = mockDB;
    } else {
      // ☁️ 生产/预览环境：使用真实的 D1 数据库
      try {
        const { getCloudflareContext } = await import('@opennextjs/cloudflare');
        const { env } = getCloudflareContext();
        if (env.DB) {
          console.log('✅ 生产/预览环境 - 使用真实的 D1 数据库');
          currentDBType = 'real';
          db = env.DB;
          
          // 🚀 执行数据库迁移
          console.log('🔄 开始执行数据库迁移...');
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
```

### 2. Migration 管理器 (`src/db/migrations/index.ts`)

```typescript
/**
 * 🧠 数据库迁移管理器 - Migration 系统的指挥中心
 */

import { Migration } from './001_create_users_table';
import { migration001 } from './001_create_users_table';

// 📋 迁移注册中心
const migrations: Migration[] = [
  migration001,
  // 🔮 添加新迁移时在这里注册
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
      console.log('🔄 开始执行数据库迁移...');
      
      await this.createMigrationTable(db);
      
      for (const migration of migrations) {
        const isExecuted = await this.isMigrationExecuted(db, migration.id);
        
        if (!isExecuted) {
          console.log(`🔄 执行迁移: ${migration.id} - ${migration.description}`);
          await migration.up(db);
          await this.recordMigration(db, migration);
          console.log(`✅ 迁移完成: ${migration.id}`);
        } else {
          console.log(`⏭️  跳过已执行的迁移: ${migration.id}`);
        }
      }
      
      console.log('✅ 所有迁移执行完成');
      
    } catch (error) {
      console.error('❌ 迁移执行失败:', error);
      throw error;
    }
  }
  
  async rollback(db: D1Database, steps: number = 1): Promise<void> {
    // 回滚实现...
  }
  
  async getStatus(db: D1Database): Promise<MigrationStatus[]> {
    // 状态查询实现...
  }
}

export const migrationManager = new DefaultMigrationManager();
export { migrations };
```

### 3. Migration 文件示例 (`src/db/migrations/001_create_users_table.ts`)

```typescript
export interface Migration {
  id: string;
  description: string;
  up: (db: D1Database) => Promise<void>;
  down: (db: D1Database) => Promise<void>;
}

export const migration001: Migration = {
  id: '001',
  description: 'Create users table',
  
  async up(db: D1Database) {
    console.log('🔄 执行迁移: 创建用户表');
    
    // 🏗️ 创建用户表
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `.replace(/\s+/g, ' ').trim()).run();
    
    console.log('✅ 用户表创建完成');
    
    // 🌱 插入初始数据
    const count = await db.prepare('SELECT COUNT(*) as count FROM users').first();
    if (count && (count as { count: number }).count === 0) {
      await db.prepare("INSERT OR IGNORE INTO users (name, email) VALUES ('张三', 'zhangsan@example.com')").run();
      await db.prepare("INSERT OR IGNORE INTO users (name, email) VALUES ('李四', 'lisi@example.com')").run();
      console.log('✅ 初始数据插入完成');
    }
  },
  
  async down(db: D1Database) {
    console.log('🔄 回滚迁移: 删除用户表');
    await db.prepare('DROP TABLE IF EXISTS users').run();
    console.log('✅ 用户表删除完成');
  }
};
```

### 4. Mock 数据库 (`src/db/mock-db.ts`)

```typescript
import { User } from '@/types/user';

// 🎭 模拟数据存储
const mockUsers: User[] = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: '李四', 
    email: 'lisi@example.com',
    created_at: new Date().toISOString()
  }
];

let nextId = 3;

// 🎮 模拟 D1Database 接口
export const mockDB = {
  prepare(sql: string) {
    return {
      all() {
        if (sql.includes('SELECT * FROM users')) {
          return Promise.resolve({
            results: mockUsers,
            success: true
          });
        }
        return Promise.resolve({ results: [], success: true });
      },
      
      bind(...params: unknown[]) {
        return {
          first() {
            if (sql.includes('INSERT INTO users')) {
              const [name, email] = params as [string, string];
              const newUser: User = {
                id: nextId++,
                name,
                email,
                created_at: new Date().toISOString()
              };
              mockUsers.push(newUser);
              return Promise.resolve(newUser);
            }
            return Promise.resolve(null);
          },
          
          run() {
            return Promise.resolve({ success: true });
          },
          
          all() {
            return Promise.resolve({ results: [], success: true });
          }
        };
      },
      
      first() {
        return Promise.resolve(null);
      },
      
      run() {
        return Promise.resolve({ success: true });
      }
    };
  }
} as unknown as D1Database;
```

### 5. 数据模型层 (`src/models/user.ts`)

```typescript
import { User, CreateUserRequest } from '@/types/user';

export class UserModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getAllUsers(): Promise<User[]> {
    const result = await this.db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    return result.results as unknown as User[];
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const { name, email } = userData;
    
    const result = await this.db.prepare(
      'INSERT INTO users (name, email) VALUES (?, ?) RETURNING *'
    ).bind(name, email).first();
    
    return result as unknown as User;
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    return result as unknown as User | null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    return result as unknown as User | null;
  }

  async updateUser(id: number, userData: Partial<CreateUserRequest>): Promise<User | null> {
    const { name, email } = userData;
    const result = await this.db.prepare(
      'UPDATE users SET name = ?, email = ? WHERE id = ? RETURNING *'
    ).bind(name, email, id).first();
    
    return result as unknown as User | null;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    return result.success;
  }
}
```

### 6. 业务逻辑层 (`src/services/user.service.ts`)

```typescript
import { User, CreateUserRequest, UserServiceResponse } from '@/types/user';
import { UserModel } from '@/models/user';
import { getDB } from '@/lib/db';

export class UserService {
  private userModel: UserModel;

  constructor() {
    // 注意：在实际使用时需要传入数据库实例
  }

  /**
   * 初始化服务（获取数据库实例）
   */
  private async init(): Promise<void> {
    if (!this.userModel) {
      const db = await getDB();
      this.userModel = new UserModel(db);
    }
  }

  /**
   * 获取所有用户（带分页）
   */
  async getAllUsers(page = 1, limit = 10): Promise<UserServiceResponse<User[]>> {
    try {
      await this.init();
      const users = await this.userModel.getAllUsers();
      
      // 业务逻辑：分页处理
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = users.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedUsers,
        total: users.length,
        page,
        limit,
        totalPages: Math.ceil(users.length / limit)
      };
    } catch (error) {
      console.error('获取用户列表失败:', error);
      return {
        success: false,
        error: '获取用户列表失败'
      };
    }
  }

  /**
   * 创建用户（带验证逻辑）
   */
  async createUser(userData: CreateUserRequest): Promise<UserServiceResponse<User>> {
    try {
      await this.init();
      
      // 业务逻辑：邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return {
          success: false,
          error: '邮箱格式不正确'
        };
      }

      // 业务逻辑：检查邮箱是否已存在
      const existingUser = await this.userModel.getUserByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          error: '该邮箱已被注册'
        };
      }

      // 业务逻辑：姓名长度验证
      if (userData.name.length < 2 || userData.name.length > 50) {
        return {
          success: false,
          error: '姓名长度必须在2-50个字符之间'
        };
      }

      const user = await this.userModel.createUser(userData);
      
      return {
        success: true,
        data: user
      };
    } catch (error) {
      console.error('创建用户失败:', error);
      return {
        success: false,
        error: '创建用户失败'
      };
    }
  }

  /**
   * 更新用户信息（带权限检查）
   */
  async updateUser(id: number, userData: Partial<CreateUserRequest>, requestUserId?: number): Promise<UserServiceResponse<User>> {
    try {
      await this.init();
      
      // 业务逻辑：权限检查（用户只能更新自己的信息）
      if (requestUserId && requestUserId !== id) {
        return {
          success: false,
          error: '无权限更新其他用户信息'
        };
      }

      // 业务逻辑：检查用户是否存在
      const existingUser = await this.userModel.getUserById(id);
      if (!existingUser) {
        return {
          success: false,
          error: '用户不存在'
        };
      }

      // 业务逻辑：如果更新邮箱，检查新邮箱是否已被其他用户使用
      if (userData.email && userData.email !== existingUser.email) {
        const emailUser = await this.userModel.getUserByEmail(userData.email);
        if (emailUser) {
          return {
            success: false,
            error: '该邮箱已被其他用户使用'
          };
        }
      }

      const updatedUser = await this.userModel.updateUser(id, userData);
      
      return {
        success: true,
        data: updatedUser!
      };
    } catch (error) {
      console.error('更新用户失败:', error);
      return {
        success: false,
        error: '更新用户失败'
      };
    }
  }

  /**
   * 删除用户（软删除或硬删除逻辑）
   */
  async deleteUser(id: number, requestUserId?: number): Promise<UserServiceResponse<boolean>> {
    try {
      await this.init();
      
      // 业务逻辑：权限检查
      if (requestUserId && requestUserId !== id) {
        return {
          success: false,
          error: '无权限删除其他用户'
        };
      }

      // 业务逻辑：检查用户是否存在
      const user = await this.userModel.getUserById(id);
      if (!user) {
        return {
          success: false,
          error: '用户不存在'
        };
      }

      const result = await this.userModel.deleteUser(id);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('删除用户失败:', error);
      return {
        success: false,
        error: '删除用户失败'
      };
    }
  }

  /**
   * 根据邮箱查找用户（业务逻辑：脱敏处理）
   */
  async getUserByEmail(email: string): Promise<UserServiceResponse<User>> {
    try {
      await this.init();
      
      const user = await this.userModel.getUserByEmail(email);
      if (!user) {
        return {
          success: false,
          error: '用户不存在'
        };
      }

      // 业务逻辑：脱敏处理邮箱
      const maskedUser = {
        ...user,
        email: this.maskEmail(user.email)
      };

      return {
        success: true,
        data: maskedUser
      };
    } catch (error) {
      console.error('查找用户失败:', error);
      return {
        success: false,
        error: '查找用户失败'
      };
    }
  }

  /**
   * 私有方法：邮箱脱敏处理
   */
  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.slice(0, 2) + '*'.repeat(Math.max(0, localPart.length - 2));
    return `${maskedLocal}@${domain}`;
  }
}

// 导出单例实例
export const userService = new UserService();
```

### 7. 类型定义 (`src/types/user.ts`)

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
  total?: number;
  dbType?: 'mock' | 'real';
}

export interface UserServiceResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
```

### 8. API 路由示例 (`src/app/api/users/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services/user.service';
import { CreateUserRequest, ApiResponse } from '@/types/user';
import { currentDBType } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // 从查询参数获取分页信息
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // 调用服务层
    const result = await userService.getAllUsers(page, limit);
    
    if (!result.success) {
      const response: ApiResponse = {
        success: false,
        error: result.error
      };
      return NextResponse.json(response, { status: 500 });
    }
    
    const response: ApiResponse = {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      dbType: currentDBType
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('获取用户失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取用户失败'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json();
    
    // 基础参数检查（API层职责）
    if (!body.name || !body.email) {
      const response: ApiResponse = {
        success: false,
        error: '姓名和邮箱都是必填项'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // 调用服务层处理业务逻辑
    const result = await userService.createUser(body);
    
    if (!result.success) {
      const response: ApiResponse = {
        success: false,
        error: result.error
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const response: ApiResponse = {
      success: true,
      data: result.data
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('创建用户失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '创建用户失败'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: '用户ID不能为空'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const body: Partial<CreateUserRequest> = await request.json();
    
    // 这里可以从认证中间件获取请求用户ID
    // const requestUserId = getAuthenticatedUserId(request);
    
    const result = await userService.updateUser(id, body);
    
    if (!result.success) {
      const response: ApiResponse = {
        success: false,
        error: result.error
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const response: ApiResponse = {
      success: true,
      data: result.data
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('更新用户失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '更新用户失败'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: '用户ID不能为空'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // 这里可以从认证中间件获取请求用户ID
    // const requestUserId = getAuthenticatedUserId(request);
    
    const result = await userService.deleteUser(id);
    
    if (!result.success) {
      const response: ApiResponse = {
        success: false,
        error: result.error
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const response: ApiResponse = {
      success: true,
      data: result.data
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('删除用户失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '删除用户失败'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
```

## 🌍 环境配置

### 环境映射表

| 环境 | 命令 | NODE_ENV | 数据库类型 | 数据存储 | Migration |
|------|------|----------|-----------|----------|-----------|
| 🎭 **开发环境** | `npm run dev` | `development` | Mock数据库 | 内存（临时） | ❌ 不执行 |
| 🔍 **本地预览** | `npm run preview` | `production` | 本地D1数据库 | 本地文件 | ✅ 执行 |
| ☁️ **生产环境** | 部署后 | `production` | 云端D1数据库 | 云端存储 | ✅ 执行 |

### Cloudflare 配置 (`wrangler.jsonc`)

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "your-project-name",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-04-01",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": {
    "binding": "ASSETS",
    "directory": ".open-next/assets"
  },
  "observability": {
    "enabled": true
  },
  "upload_source_maps": true,
  "d1_databases": [{
    "binding": "DB",
    "database_name": "your-database-name",
    "database_id": "your-database-id"
  }]
}
```

### 项目配置 (`package.json`)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "check-all": "npm run lint && npm run type-check && npm run build"
  },
  "dependencies": {
    "@opennextjs/cloudflare": "^1.3.0",
    "next": "^15.3.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.4",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "eslint": "^9.27.0",
    "eslint-config-next": "^15.3.3",
    "tailwindcss": "^4.1.1",
    "typescript": "^5.8.3",
    "wrangler": "^4.21.0"
  }
}
```

## 🚀 快速开始

### 1. 创建新项目

```bash
# 1. 创建 Next.js 项目
npx create-next-app@latest your-project-name --typescript --tailwind --eslint --app

# 2. 进入项目目录
cd your-project-name

# 3. 安装 Cloudflare 依赖
npm install @opennextjs/cloudflare
npm install -D wrangler
```

### 2. 复制核心文件

将以下文件从模板复制到新项目：

```bash
# 核心数据库文件
src/lib/db.ts
src/db/mock-db.ts
src/db/migrations/index.ts
src/db/migrations/001_create_users_table.ts

# 模型、服务和类型
src/models/user.ts
src/services/user.service.ts
src/types/user.ts

# 配置文件
wrangler.jsonc
env.d.ts
```

### 3. 配置 Cloudflare D1

```bash
# 1. 创建 D1 数据库
npx wrangler d1 create your-database-name

# 2. 更新 wrangler.jsonc 中的 database_id

# 3. 生成类型定义
npm run cf-typegen
```

### 4. 开发流程

```bash
# 开发环境（Mock 数据库）
npm run dev

# 本地预览（真实 D1 数据库）
npm run preview

# 部署到生产环境
npm run deploy
```

## 🔧 添加新功能

### 添加新的数据表

1. **创建新的 Migration 文件**：

```typescript
// src/db/migrations/002_add_posts_table.ts
export const migration002: Migration = {
  id: '002',
  description: 'Add posts table',
  
  async up(db: D1Database) {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `.replace(/\s+/g, ' ').trim()).run();
  },
  
  async down(db: D1Database) {
    await db.prepare('DROP TABLE IF EXISTS posts').run();
  }
};
```

2. **注册新的 Migration**：

```typescript
// src/db/migrations/index.ts
import { migration002 } from './002_add_posts_table';

const migrations: Migration[] = [
  migration001,
  migration002,  // 👈 添加新迁移
];
```

3. **创建类型定义**：

```typescript
// src/types/post.ts
export interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  created_at: string;
}
```

4. **创建数据模型**：

```typescript
// src/models/post.ts
export class PostModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getAllPosts(): Promise<Post[]> {
    const result = await this.db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
    return result.results as unknown as Post[];
  }
}
```

5. **更新 Mock 数据库**：

```typescript
// src/db/mock-db.ts
const mockPosts: Post[] = [];

// 在 mockDB 中添加 posts 相关的 SQL 处理逻辑
```

## 🎯 最佳实践

### 1. Migration 设计原则

- ✅ **幂等性**：多次执行相同的迁移应该是安全的
- ✅ **向前兼容**：新迁移不应破坏现有数据
- ✅ **原子操作**：每个迁移应该是一个完整的单元
- ✅ **命名规范**：使用序号 + 描述的方式命名

### 2. SQL 最佳实践

```typescript
// ✅ 正确：使用 prepare().run()
await db.prepare('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY)').run();

// ❌ 错误：使用 exec()（D1 不支持）
await db.exec(`CREATE TABLE users...`);

// ✅ 正确：单行 SQL
await db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').bind(name, email).run();

// ❌ 错误：多行模板字符串
await db.prepare(`
  INSERT INTO users 
  (name, email) 
  VALUES (?, ?)
`).bind(name, email).run();
```

### 3. 错误处理策略

```typescript
export async function getDB(): Promise<D1Database> {
  try {
    // 主要逻辑
  } catch (error) {
    console.error('数据库连接失败:', error);
    // 优雅降级到 Mock 数据库
    return mockDB;
  }
}
```

### 4. Services 层设计原则

```typescript
// ✅ 正确：服务层处理业务逻辑
export class UserService {
  async createUser(userData: CreateUserRequest) {
    // 业务验证
    if (!this.isValidEmail(userData.email)) {
      return { success: false, error: '邮箱格式错误' };
    }
    
    // 业务规则检查
    const existingUser = await this.userModel.getUserByEmail(userData.email);
    if (existingUser) {
      return { success: false, error: '邮箱已存在' };
    }
    
    // 调用模型层
    return await this.userModel.createUser(userData);
  }
}

// ❌ 错误：模型层包含业务逻辑
export class UserModel {
  async createUser(userData: CreateUserRequest) {
    // ❌ 业务验证不应该在模型层
    if (!this.isValidEmail(userData.email)) {
      throw new Error('邮箱格式错误');
    }
    
    // ✅ 纯数据操作是正确的
    const result = await this.db.prepare('INSERT INTO users...').run();
    return result;
  }
}
```

### 5. 类型安全

```typescript
// ✅ 使用泛型确保类型安全
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ✅ 明确的返回类型
async function getAllUsers(): Promise<User[]> {
  // 实现
}
```

## 📊 监控和调试

### 查看 Migration 状态

```typescript
// 获取迁移状态
const status = await migrationManager.getStatus(db);
status.forEach(migration => {
  console.log(`${migration.id}: ${migration.executed ? '✅' : '❌'} ${migration.description}`);
});

// 回滚迁移
await migrationManager.rollback(db, 1); // 回滚最后一个迁移
```

### 开发环境调试

```typescript
// 检查当前数据库类型
console.log('当前数据库类型:', currentDBType);

// 查看 SQL 执行日志
console.log('执行 SQL:', sqlQuery);
```

## 🎉 架构优势总结

### ✅ 相比传统方法的优势

1. **🧹 架构清晰**
   - 单一数据源真理
   - 清晰的职责分离  
   - 易于理解和维护

2. **🔄 环境一致性**
   - 自动环境检测
   - 统一的 API 接口
   - 无缝环境切换

3. **🚀 开发效率**
   - Mock 数据库快速开发
   - Professional Migration 系统
   - 类型安全保障

4. **🔒 生产就绪**
   - 优雅的错误处理
   - 数据安全保障
   - 性能优化

5. **📈 可扩展性**
   - 模块化设计
   - 易于添加新功能
   - 标准化流程

### 🎯 最终效果

- **开发体验提升**：清晰的架构，快速上手
- **部署信心增强**：Preview 成功 = 生产环境成功
- **团队协作顺畅**：标准化的数据库管理流程
- **维护成本降低**：模块化设计，易于维护

## 🔗 相关资源

- [Cloudflare D1 官方文档](https://developers.cloudflare.com/d1/)
- [Next.js App Router 文档](https://nextjs.org/docs/app)
- [@opennextjs/cloudflare 文档](https://opennext.js.org/cloudflare)
- [TypeScript 最佳实践](https://typescript-eslint.io/rules/)
