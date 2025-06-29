# 验证脚本使用指南

## 快速开始

### 基本使用
```bash
# 验证构建（推荐）
./validate-build-only.sh

# 验证并选择是否部署
./validate-deployment.sh
```

## 日常使用场景

### 1. 开发工作流

#### 开发新功能后
```bash
# 1. 开发完成代码
git add .
git commit -m "feat: 添加新功能"

# 2. 验证构建（在推送前）
./validate-build-only.sh

# 3. 如果验证通过，推送到远程
git push
```

#### 修复 Bug 后
```bash
# 1. 修复代码
# 2. 验证修复是否影响构建
./validate-build-only.sh

# 3. 提交修复
git commit -m "fix: 修复某个问题"
```

### 2. 依赖管理

#### 更新依赖后
```bash
# 1. 更新依赖
npm update

# 2. 验证兼容性
./validate-build-only.sh

# 3. 如果有问题，回滚或修复
npm install  # 回滚到 package-lock.json 版本
```

#### 添加新依赖后
```bash
# 1. 安装新依赖
npm install new-package

# 2. 验证新依赖是否影响构建
./validate-build-only.sh
```

### 3. 配置变更

#### 修改 Next.js 配置后
```bash
# 1. 修改 next.config.ts
# 2. 验证配置是否正确
./validate-build-only.sh
```

#### 修改 OpenNext 配置后
```bash
# 1. 修改 open-next.config.ts
# 2. 验证配置是否正确
./validate-build-only.sh
```

## 常见使用模式

### 模式 1: 快速验证
```bash
# 只验证构建，不清理（更快）
npm run build
npx @opennextjs/cloudflare build
ls -la .open-next/worker.js
```

### 模式 2: 完整验证
```bash
# 完整验证（推荐）
./validate-build-only.sh
```

### 模式 3: 验证并部署
```bash
# 验证通过后部署
./validate-deployment.sh
```

## 集成到开发流程

### 1. Git Hooks（推荐）

创建 `.git/hooks/pre-push`：
```bash
#!/bin/bash
echo "🔍 推送前验证构建..."
./validate-build-only.sh
if [ $? -ne 0 ]; then
    echo "❌ 构建验证失败，推送取消"
    exit 1
fi
echo "✅ 构建验证通过，继续推送"
```

### 2. Package.json 脚本

添加便捷脚本到 `package.json`：
```json
{
  "scripts": {
    "validate": "./validate-build-only.sh",
    "validate:deploy": "./validate-deployment.sh",
    "predeploy": "./validate-build-only.sh"
  }
}
```

然后使用：
```bash
npm run validate      # 只验证
npm run validate:deploy  # 验证并部署
npm run deploy       # 自动先验证再部署
```

### 3. CI/CD 集成

在 GitHub Actions 或其他 CI 中使用：
```yaml
- name: 验证构建
  run: ./validate-build-only.sh
```

## 故障排除

### 验证失败时

1. **检查错误信息**
```bash
./validate-build-only.sh 2>&1 | tee build.log
```

2. **常见问题**
   - 依赖版本冲突：`npm install`
   - TypeScript 错误：`npm run lint`
   - 配置错误：检查 `next.config.ts` 和 `open-next.config.ts`

3. **清理重试**
```bash
rm -rf .next .open-next node_modules
npm install
./validate-build-only.sh
```

## 最佳实践

### 1. 定期验证
- 每次提交前验证
- 每周至少验证一次
- 更新依赖后立即验证

### 2. 团队协作
- 在 README 中说明验证流程
- 团队成员都使用相同的验证脚本
- 在 PR 中要求验证通过

### 3. 自动化
- 使用 Git hooks 自动验证
- 集成到 CI/CD 流程
- 设置自动化测试

## 总结

验证脚本的核心价值：
- ✅ **提前发现问题**：在部署前发现构建错误
- ✅ **节省时间**：避免部署失败后重新调试
- ✅ **提高信心**：确保代码可以正常部署
- ✅ **团队协作**：统一验证标准

记住：**验证是免费的，部署失败是昂贵的！** 