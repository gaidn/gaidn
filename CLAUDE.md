# CLAUDE.md
claude --dangerously-skip-permissions

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 标准工作流程

1. 首先思考问题，阅读代码库中的相关文件，并为本次任务单独制定计划，写一个 `xxxtodo.md`，放在 tasks 目录下

2. 计划应包含待办事项列表，您可以在完成时勾选。

3. 开始工作之前，请与我确认计划，我会验证计划的可行性

4. 然后开始处理待办事项，边做边标记完成状态

5. 请在每个步骤中只给我一个高层次的解释，说明您做了什么更改

6. 让您执行的每个任务和代码更改都尽可能简单。我们希望避免进行任何大规模或复杂的更改。每个更改都应该影响尽可能少的代码。一切都是关于简单性。原子化修改

7. 最后，在 `todo.md` 文件中添加一个总结部分，概述您所做的更改和任何其他相关信息

8. 永远用中文回应

9.请用组件化的 UI 架构，原子设计理念，可复用的 ui 基础组件以及业务特点的块组件。

## 编码规范

- 全面使用 TypeScript，保障类型安全
- 遵循 React 的最佳实践，优先使用 Hooks
- 使用 Tailwind CSS 与 Shadcn UI 实现响应式设计
- 组件应保持模块化、可复用
- 为组件和数据编写规范的类型定义

## 架构概述

这是一个 Next.js 15 TypeScript 应用程序，使用 App Router，设计为具有多租户架构和 Cloudflare 部署支持的 AI SaaS 模板。

### 关键技术
- **框架**: Next.js 15 with App Router 和 Turbopack
- **数据库**: 使用 Cloudflare 的 D1 数据库，Migration-First 设计
- **认证**: NextAuth.js 支持 Google、GitHub 和 Google One Tap （如果有该认证模块）
- **支付**: Stripe 集成（如果有该模块）
- **国际化**: next-intl 路由本地化
- **样式**: Tailwind CSS 配合 shadcn/ui 组件
- **部署**: Cloudflare Workers

### 项目结构

```
your-project/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── [locale]/              # 特定区域设置的页面（en、zh）
│   │   ├── api/                   # API 路由，统一响应格式
│   │   └── theme.css              # 主题样式文件
│   ├── components/                # React 组件
│   │   ├── blocks/                # 落地页布局块
│   │   └── ui/                    # 可复用的基础组件
│   ├── auth/                      # NextAuth.js 配置（如有）
│   ├── db/                        # 数据库架构和迁移
│   │   ├── mock-db.ts             # Mock数据库实现
│   │   └── migrations/            # Migration 系统
│   │       ├── index.ts           # 迁移管理器
│   │       └── 001_xxx.ts         # 迁移文件
│   ├── i18n/                      # 国际化设置
│   │   ├── pages/                 # 页面特定翻译
│   │   └── messages/              # 全局消息翻译
│   ├── lib/                       # 自定义库与函数
│   │   └── db.ts                  # 数据库连接管理
│   ├── models/                    # 数据模型（纯数据访问）
│   │   └── user.ts                # 用户数据模型
│   ├── services/                  # 业务逻辑层
│   │   └── user.service.ts        # 用户业务逻辑
│   └── types/                     # TypeScript 类型定义
│       ├── pages/                 # 页面类型定义
│       └── blocks/                # 结构模块类型定义
├── wrangler.jsonc                 # Cloudflare 配置
├── env.d.ts                       # 环境类型定义
└── package.json                   # 项目配置
```

### 数据库架构

本项目采用 **Migration-First** 设计理念，通过分层架构实现环境无关的数据库操作。

#### 数据库分层架构

| 层级 | 目录 | 职责 | 说明 |
|------|------|------|------|
| **连接层** | `src/lib/db.ts` | 数据库连接与环境检测 | 统一抽象，自动切换 |
| **数据层** | `src/db/` | 数据存储与迁移管理 | Mock、Migration |
| **模型层** | `src/models/` | 数据库操作封装 | 纯数据访问，CRUD操作 |
| **服务层** | `src/services/` | 业务逻辑处理 | 复杂业务规则，跨模型操作 |
| **路由层** | `src/app/api/` | API 接口控制 | 请求处理，调用服务层 |

#### 数据库更详细介绍文档，可以看 d1_db.md 里面说明

#### 层级职责详解

1. **模型层 (Models)** - 纯数据访问
  - 职责：封装数据库 CRUD 操作
  - 特点：一个数据表对应一个模型文件
  - 原则：只包含数据访问逻辑，不包含业务规则

2. **服务层 (Services)** - 业务逻辑处理
  - 职责：处理复杂业务规则和跨模型操作
  - 特点：包含验证、权限检查、数据转换等逻辑，一个文件对应一个 models 文件
  - 原则：调用模型层，不直接操作数据库

3. **路由层 (API Routes)** - 接口控制
  - 职责：处理 HTTP 请求和响应
  - 特点：参数验证、格式转换、错误处理
  - 原则：调用服务层，不直接调用模型层


#### Migration 系统

- **自动化**：环境检测后自动执行未执行的迁移
- **幂等性**：多次执行相同的迁移是安全的
- **版本控制**：通过迁移ID和状态表跟踪执行情况

#### SQL 最佳实践

- 使用 `prepare().run()` 而不是 `exec()`
- SQL语句使用单行格式，避免多行模板字符串
- 使用参数绑定防止SQL注入
- 表名和字段名使用小写和下划线命名

### 认证流程

使用 NextAuth.js 的多提供者认证：
- Google OAuth 和 Google One Tap
- GitHub OAuth
- 自定义用户处理和数据库持久化
- 使用 JWT 令牌的会话管理


### 国际化

内置 i18n 支持：
- 英文和中文区域设置
- 基于区域设置的路由（`/en/`、`/zh/`）
- 页面特定和全局消息翻译
- 落地页内容本地化

## 环境设置

所需的环境文件：
- `.env.development` - 开发环境变量
- `wrangler.jsonc` - Cloudflare Workers 和 D1 数据库配置


## 开发流程

```bash
# 开发环境（Mock数据库）
npm run dev

# 本地预览（真实D1数据库）
npm run preview
```

## 开发注意事项

- 使用函数式 React 组件和 hooks
- 使用 Tailwind CSS 实现响应式设计
- 保持模块化组件结构
- 遵循 TypeScript 最佳实践
- 使用 Sonner 进行消息提示
- 实现适当的错误处理和验证
- 遵循数据库层级职责分离原则

## TypeScript 导入导出经验

在 TypeScript 项目中，当某个文件既要导出类型又要在同一文件中使用这些类型时，必须显式地添加 `import` 语句，即使已经有了 `export` 语句。`export` 只是重新导出，不会在当前模块作用域中引入类型；要在当前文件中使用类型，必须通过 `import` 将其引入当前作用域。另外，数据库查询返回 `Type | null` 时，需要转换为 `Type | undefined` 才能赋值给可选属性。


## 测试结构

遵循测试金字塔策略：单元测试 > 集成测试 > E2E 测试

### 测试层级（优先级从高到低）

#### 1. 单元测试（70%）
- **目标**：测试单个函数、组件、工具类
- **工具**：Jest + React Testing Library
- **测试内容**：
  - `src/lib/` - 工具函数测试
  - `src/components/ui/` - UI 组件测试
  - `src/services/` - 业务逻辑测试
  - `src/models/` - 数据模型测试
- **命名规范**：`*.test.ts` 或 `*.test.tsx`
- **位置**：与源文件同目录或 `__tests__` 文件夹

#### 2. 集成测试（20%）
- **目标**：测试组件间交互、API 路由、数据库操作
- **工具**：Jest + Supertest（API 测试）
- **测试内容**：
  - `src/app/api/` - API 路由测试
  - `src/components/blocks/` - 复杂组件交互测试
  - 数据库操作集成测试
- **命名规范**：`*.integration.test.ts`
- **位置**：`tests/integration/` 目录

#### 3. E2E 测试（10%）
- **目标**：测试完整用户流程
- **工具**：Playwright
- **测试内容**：
  - 关键业务流程（注册、登录、支付）
  - 多语言切换
  - 响应式设计
- **命名规范**：`*.e2e.test.ts`
- **位置**：`tests/e2e/` 目录

### 测试配置
// package.json
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:integration": "jest --testPathPattern=integration",
  "test:e2e": "playwright test"
}
```

### 测试原则

- **单一职责**：每个测试只验证一个功能点
- **可读性**：测试名称应清晰描述测试内容
- **独立性**：测试之间不应相互依赖
- **快速反馈**：优先编写快速的单元测试
- **覆盖率**：保持合理的测试覆盖率（目标 80%+）

### 测试文件结构

```
tests/
├── unit/
│   ├── components/
│   ├── lib/
│   └── services/
├── integration/
│   ├── api/
│   └── components/
├── e2e/
│   ├── auth.e2e.test.ts
│   ├── payment.e2e.test.ts
│   └── i18n.e2e.test.ts
└── setup/
    ├── jest.config.js
    ├── test-utils.tsx
    └── mocks/
```
