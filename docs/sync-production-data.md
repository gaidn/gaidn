# 生产数据同步到本地

本文档介绍如何将生产环境的数据库数据同步到本地开发环境。

## 概述

使用 Wrangler CLI 工具可以轻松地将 Cloudflare D1 生产数据库的数据导出并导入到本地数据库中，实现数据同步。

## 准备工作

确保已安装项目依赖：
```bash
npm install
```

## 操作步骤

### 1. 备份本地数据（可选但推荐）

在导入生产数据之前，建议先备份本地现有数据：

```bash
npx wrangler d1 export gaidn --local --output=local_backup.sql
```

### 2. 导出生产数据

从生产环境导出数据库数据：

```bash
npx wrangler d1 export gaidn --remote --output=production_data.sql
```

### 3. 清空本地数据库

为避免数据冲突，删除本地数据库文件：

```bash
rm -rf .wrangler/state/v3/d1
```

### 4. 导入生产数据

将生产数据导入到本地数据库：

```bash
npx wrangler d1 execute gaidn --local --file=production_data.sql
```

### 5. 验证数据导入

检查数据是否成功导入：

```bash
# 查看所有表
npx wrangler d1 execute gaidn --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# 检查用户数量
npx wrangler d1 execute gaidn --local --command="SELECT COUNT(*) as user_count FROM users;"
```

## 一键同步脚本

你也可以使用一条命令完成整个同步过程：

```bash
# 直接从生产导出并导入本地
npx wrangler d1 export gaidn --remote --output=- | npx wrangler d1 execute gaidn --local --file=-
```

**注意：** 这种方式会直接覆盖本地数据，请谨慎使用。

## 文件说明

- `local_backup.sql` - 本地数据库备份文件
- `production_data.sql` - 生产数据库导出文件
- `gaidn` - 数据库名称（在 wrangler.jsonc 中配置）

## 注意事项

1. **数据覆盖**：导入生产数据会完全覆盖本地数据库
2. **网络连接**：导出生产数据需要网络连接
3. **权限验证**：确保已登录 Cloudflare 账户并有相应权限
4. **数据敏感性**：生产数据可能包含敏感信息，请妥善保管

## 常见问题

### 表已存在错误

如果遇到 "table already exists" 错误，说明本地数据库已有数据。解决方法：

1. 删除本地数据库文件：`rm -rf .wrangler/state/v3/d1`
2. 重新导入数据

### 权限问题

如果遇到权限错误，请确保：

1. 已登录 Cloudflare 账户：`npx wrangler auth login`
2. 有 D1 数据库的访问权限

## 开发流程

同步完成后，可以使用以下命令进行本地开发：

```bash
# 本地开发（使用同步的数据）
npm run dev

# 本地预览（使用真实 D1 数据库）
npm run preview
```

## 相关文档

- [Wrangler D1 文档](https://developers.cloudflare.com/workers/wrangler/commands/#d1)
- [项目数据库架构文档](./database-design.md)
- [D1 数据库说明](../d1_db.md)