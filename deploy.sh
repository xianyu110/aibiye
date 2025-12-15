#!/bin/bash

# AI Text Paraphrasing Tool - 快速部署脚本

echo "🚀 开始部署流程..."
echo ""

# 检查是否已经初始化 Git
if [ ! -d .git ]; then
    echo "📦 初始化 Git 仓库..."
    git init
    git branch -M main
else
    echo "✅ Git 仓库已存在"
fi

# 添加所有文件
echo "📝 添加文件到 Git..."
git add .

# 提交
echo "💾 创建提交..."
read -p "请输入提交信息 (默认: Update project): " commit_msg
commit_msg=${commit_msg:-"Update project"}
git commit -m "$commit_msg"

# 检查是否已添加远程仓库
if ! git remote | grep -q origin; then
    echo ""
    echo "🔗 请输入你的 GitHub 仓库地址"
    echo "格式: https://github.com/用户名/仓库名.git"
    read -p "仓库地址: " repo_url
    git remote add origin "$repo_url"
else
    echo "✅ 远程仓库已配置"
fi

# 推送到 GitHub
echo ""
echo "⬆️  推送到 GitHub..."
git push -u origin main

echo ""
echo "✨ 完成！代码已推送到 GitHub"
echo ""
echo "📋 下一步："
echo "1. 访问 https://vercel.com/dashboard"
echo "2. 点击 'Add New Project'"
echo "3. 选择你的 GitHub 仓库"
echo "4. 配置环境变量："
echo "   - VITE_DEEPSEEK_API_KEY"
echo "   - VITE_DEEPSEEK_API_URL (可选)"
echo "   - VITE_DEEPSEEK_MODEL (可选)"
echo "5. 点击 Deploy"
echo ""
echo "📖 详细说明请查看 DEPLOYMENT.md"
