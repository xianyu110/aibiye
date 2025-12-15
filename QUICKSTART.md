# 快速开始指南

## 🎯 5 分钟部署到 Vercel

### 步骤 1: 上传到 GitHub (2 分钟)

```bash
# 运行一键部署脚本
./deploy.sh
```

或者手动执行：

```bash
# 1. 初始化 Git
git init
git add .
git commit -m "Initial commit"
git branch -M main

# 2. 在 GitHub 创建仓库后，替换下面的地址
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 步骤 2: 部署到 Vercel (3 分钟)

1. **导入项目**
   - 访问 https://vercel.com/new
   - 点击 "Import Git Repository"
   - 选择你刚才创建的 GitHub 仓库

2. **配置环境变量**
   
   点击 "Environment Variables"，添加：
   
   | 名称 | 值 |
   |------|-----|
   | `VITE_DEEPSEEK_API_KEY` | 你的 DeepSeek API Key |
   
   可选配置：
   | 名称 | 值 |
   |------|-----|
   | `VITE_DEEPSEEK_API_URL` | `https://api.deepseek.com/v1/chat/completions` |
   | `VITE_DEEPSEEK_MODEL` | `deepseek-chat` |

3. **部署**
   - 点击 "Deploy" 按钮
   - 等待 1-2 分钟构建完成
   - 点击访问链接测试

### 步骤 3: 测试 (1 分钟)

1. 打开部署的网站
2. 输入一段测试文本
3. 选择改写模式
4. 点击"开始改写"
5. 查看改写结果

## 🔑 获取 DeepSeek API Key

1. 访问 https://platform.deepseek.com/
2. 注册/登录账号
3. 进入 "API Keys" 页面
4. 点击 "Create API Key"
5. 复制生成的 Key

## ⚡ 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 API Key

# 3. 启动开发服务器
npm run dev

# 4. 访问 http://localhost:3000
```

## 🔄 更新部署

修改代码后：

```bash
git add .
git commit -m "描述你的修改"
git push
```

Vercel 会自动检测到推送并重新部署。

## 📚 更多文档

- [完整部署指南](./DEPLOYMENT.md)
- [GitHub 上传详解](./GITHUB_SETUP.md)
- [部署检查清单](./CHECKLIST.md)

## ❓ 常见问题

**Q: 构建失败怎么办？**
A: 查看 Vercel 构建日志，通常是环境变量未配置或依赖安装失败。

**Q: API 调用失败？**
A: 检查环境变量 `VITE_DEEPSEEK_API_KEY` 是否正确设置。

**Q: 页面空白？**
A: 打开浏览器控制台查看错误信息，可能是 API Key 未配置。

**Q: 如何更新代码？**
A: 修改后 `git push`，Vercel 会自动重新部署。

## 🎉 完成！

现在你的 AI 文本降重工具已经成功部署到 Vercel，可以通过公网访问了！
