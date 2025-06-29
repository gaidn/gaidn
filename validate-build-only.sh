#!/bin/bash

set -e

echo "🚀 开始构建验证（不部署）..."

# 1. 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf .next .open-next

# 2. 安装依赖
echo "📦 安装依赖..."
npm install

# 3. 构建 Next.js 应用
echo "🔨 构建 Next.js 应用..."
npm run build

# 4. 构建 OpenNext（转换格式）
echo "⚡ 转换 Next.js 为 Cloudflare Workers 格式..."
npx @opennextjs/cloudflare build

# 5. 验证生成的文件
echo "🔍 验证生成的文件..."
if [ ! -f ".open-next/worker.js" ]; then
    echo "❌ .open-next/worker.js 文件不存在，构建失败"
    exit 1
fi

echo "✅ 构建验证成功！"
echo "📁 生成的文件："
ls -la .open-next/

echo ""
echo "🎯 关键文件检查："
echo "  - worker.js: $(ls -la .open-next/worker.js | awk '{print $5}' | sed 's/^/    /')"
echo "  - assets 目录: $(ls -d .open-next/assets/ 2>/dev/null && echo "✅ 存在" || echo "❌ 不存在")"

echo ""
echo "💡 构建验证完成！如果所有文件都正确生成，说明你的应用可以部署到 Cloudflare。"
echo "   要实际部署，请运行: npm run deploy" 