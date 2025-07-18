# 本项目的测试建议指导

### 测试层级（优先级从高到低）

请使用
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
