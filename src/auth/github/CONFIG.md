# GitHub 登录配置指南

## 1. 创建 GitHub OAuth 应用

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息：
   - **Application name**: 你的应用名称
   - **Homepage URL**: `http://localhost:3000` (开发环境)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. 点击 "Register application"
5. 复制 **Client ID** 和 **Client Secret**

## 2. 环境变量配置

在项目根目录创建 `.env.local` 文件：

```env
# GitHub OAuth 应用配置
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# NextAuth 配置
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

### 生成 NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## 3. 生产环境配置

### Cloudflare Pages 部署

在 Cloudflare Pages 的环境变量中设置：

```env
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=https://your-domain.pages.dev
```

### 更新 GitHub OAuth 应用

在生产环境中，需要更新 GitHub OAuth 应用的配置：

- **Homepage URL**: `https://your-domain.com`
- **Authorization callback URL**: `https://your-domain.com/api/auth/callback/github`

## 4. 验证配置

1. 启动开发服务器：`npm run dev`
2. 访问 `http://localhost:3000/auth/signin`
3. 点击 "使用 GitHub 登录" 按钮
4. 应该能正常跳转到 GitHub 授权页面

## 5. 故障排除

### 常见错误

1. **"Invalid client"**: 检查 GITHUB_ID 和 GITHUB_SECRET 是否正确
2. **"Redirect URI mismatch"**: 检查 GitHub OAuth 应用的 callback URL 配置
3. **"Invalid state"**: 检查 NEXTAUTH_SECRET 是否正确设置

### 调试模式

在 `.env.local` 中添加：

```env
NEXTAUTH_DEBUG=true
```

## 6. 安全注意事项

1. 永远不要将 `.env.local` 文件提交到版本控制
2. 在生产环境中使用强密码作为 NEXTAUTH_SECRET
3. 定期轮换 GitHub OAuth 应用的 Client Secret
4. 使用 HTTPS 在生产环境中 