# Cloudflare 部署验证指南

## 概述

本文档总结了如何本地验证 Next.js 项目在 Cloudflare Workers 上的部署是否成功，避免在 CI/CD 流程中出现部署错误。

## 验证步骤

### 1. 检查依赖配置

确保 `package.json` 包含正确的依赖：

```json
{
  "dependencies": {
    "@opennextjs/cloudflare": "^1.3.0",
    "next": "^15.3.2"
  },
  "devDependencies": {
    "wrangler": "^4.20.1"
  }
}
```

### 2. 检查部署脚本

确保 `package.json` 中有正确的部署脚本：

```json
{
  "scripts": {
    "build": "next build",
    "deploy": "npx @opennextjs/cloudflare build && npx @opennextjs/cloudflare deploy",
    "preview": "npx @opennextjs/cloudflare build && npx @opennextjs/cloudflare preview"
  }
}
```

### 3. 检查 wrangler.jsonc 配置

确保配置文件指向正确的入口文件：

```json
{
  "name": "your-project-name",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-04-01",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": {
    "binding": "ASSETS",
    "directory": ".open-next/assets"
  }
}
```

### 4. 本地验证流程

#### 步骤 1: 清理之前的构建
```bash
# 清理之前的构建文件
rm -rf .next .open-next
```

#### 步骤 2: 安装依赖
```bash
# 确保所有依赖都正确安装
npm install
```

#### 步骤 3: 测试构建命令
```bash
# 测试 OpenNext 构建
npx @opennextjs/cloudflare build
```

**预期输出：**
```
┌─────────────────────────────┐
│ OpenNext — Cloudflare build │
└─────────────────────────────┘

App directory: /path/to/your/project
Next.js version : 15.3.3
@opennextjs/cloudflare version: 1.3.1

┌─────────────────────────────────┐
│ OpenNext — Building Next.js app │
└─────────────────────────────────┘

> next build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (7/7)
✓ Collecting build traces
✓ Finalizing page optimization

┌──────────────────────────────┐
│ OpenNext — Generating bundle │
└──────────────────────────────┘

Worker saved in `.open-next/worker.js` 🚀

OpenNext build complete.
```

#### 步骤 4: 验证生成的文件
```bash
# 检查 .open-next 目录是否存在
ls -la .open-next/

# 检查 worker.js 文件是否存在
ls -la .open-next/worker.js
```

**预期结果：**
- `.open-next/` 目录存在
- `.open-next/worker.js` 文件存在（这是关键文件）

#### 步骤 5: 测试部署命令
```bash
# 测试部署（可选，如果不想实际部署）
npx @opennextjs/cloudflare deploy
```

**预期输出：**
```
┌──────────────────────────────┐
│ OpenNext — Cloudflare deploy │
└──────────────────────────────┘

⛅️ wrangler 4.22.0
✨ Success! Uploaded X files
Your Worker has access to the following bindings:
Binding                 Resource
env.DB (your-db)        D1 Database
env.ASSETS              Assets

Uploaded your-project (XX.XX sec)
https://your-project.workers.dev
```

## 常见错误及解决方案

### 错误 1: "The entry-point file at '.open-next/worker.js' was not found"

**原因：** OpenNext 构建失败或未运行

**解决方案：**
1. 确保运行了 `npx @opennextjs/cloudflare build`
2. 检查 Next.js 构建是否成功
3. 检查依赖版本兼容性

### 错误 2: "npm error 404 Not Found - GET https://registry.npmjs.org/opennextjs-cloudflare"

**原因：** 使用了错误的包名

**解决方案：**
- 使用 `@opennextjs/cloudflare` 而不是 `opennextjs-cloudflare`
- 确保使用正确的 CLI 命令：`npx @opennextjs/cloudflare build`

### 错误 3: 构建失败

**解决方案：**
1. 检查 Next.js 版本兼容性
2. 确保所有依赖都正确安装
3. 检查 TypeScript 类型错误
4. 查看构建日志中的具体错误信息

## 自动化验证脚本

创建一个验证脚本 `validate-deployment.sh`：

```bash
#!/bin/bash

set -e

echo "🚀 开始部署验证..."

# 1. 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf .next .open-next

# 2. 安装依赖
echo "📦 安装依赖..."
npm install

# 3. 构建 Next.js 应用
echo "🔨 构建 Next.js 应用..."
npm run build

# 4. 构建 OpenNext
echo "⚡ 构建 OpenNext..."
npx @opennextjs/cloudflare build

# 5. 验证 .open-next 目录
if [ ! -f ".open-next/worker.js" ]; then
    echo "❌ .open-next/worker.js 文件不存在，构建失败"
    exit 1
fi

echo "✅ OpenNext 构建成功"
echo "✅ 部署验证通过！"

# 6. 可选：实际部署
read -p "是否要实际部署到 Cloudflare？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 部署到 Cloudflare..."
    npx @opennextjs/cloudflare deploy
    echo "🎉 部署完成！"
fi
```

## 关键检查点

1. **依赖版本兼容性**：确保 Next.js 和 OpenNext 版本兼容
2. **构建输出**：确保 `.open-next/worker.js` 文件生成
3. **配置文件**：确保 `wrangler.jsonc` 配置正确
4. **部署脚本**：确保 `package.json` 中的脚本正确

## 总结

通过以上步骤，你可以在本地验证部署配置是否正确，避免在 CI/CD 流程中出现部署错误。关键是要确保：

- ✅ 依赖配置正确
- ✅ 构建脚本正确
- ✅ 生成必要的文件
- ✅ 配置文件指向正确的位置

这样就能确保你的 Next.js 应用能够成功部署到 Cloudflare Workers。 