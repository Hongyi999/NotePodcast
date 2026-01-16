#!/bin/bash

# NotePodcast GitHub Pages 部署脚本
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即停止

echo "🚀 开始部署 NotePodcast v1.0 到 GitHub Pages..."
echo ""

# 检查是否在正确的分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "deploy-v1.0.0" ]; then
    echo "⚠️  警告: 当前不在 deploy-v1.0.0 分支"
    echo "   当前分支: $CURRENT_BRANCH"
    echo ""
    read -p "是否切换到 deploy-v1.0.0 分支? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout deploy-v1.0.0
    else
        echo "❌ 已取消部署"
        exit 1
    fi
fi

# 1. 清理旧的构建
echo "🧹 清理旧的构建文件..."
rm -rf dist

# 2. 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 3. 构建项目
echo "🔨 构建生产版本..."
npm run build

# 检查构建是否成功
if [ ! -d "dist" ]; then
    echo "❌ 构建失败：dist 文件夹不存在"
    exit 1
fi

echo "✅ 构建成功！"
echo ""

# 4. 检查是否安装了 gh-pages
if ! npm list gh-pages > /dev/null 2>&1; then
    echo "📥 安装 gh-pages 工具..."
    npm install --save-dev gh-pages
fi

# 5. 部署到 GitHub Pages
echo "🌐 部署到 GitHub Pages..."
npx gh-pages -d dist -b gh-pages

echo ""
echo "✅ 部署完成！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 您的网站已成功部署！"
echo ""
echo "📍 访问地址:"
echo "   https://YOUR_USERNAME.github.io/notepodcast/"
echo ""
echo "⏱️  等待时间: 1-2分钟"
echo "   GitHub Pages 需要一些时间来处理部署"
echo ""
echo "🔍 检查部署状态:"
echo "   访问: https://github.com/YOUR_USERNAME/notepodcast/deployments"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 提示: 请将 YOUR_USERNAME 替换为您的 GitHub 用户名"
echo ""
