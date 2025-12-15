# 部署指南

## Vercel 部署步骤

### 方法一：通过 Vercel Dashboard 部署（推荐）

1. **推送代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -u origin main
   ```

2. **连接 Vercel**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库
   - Vercel 会自动检测到 Vite 项目配置

3. **配置环境变量**
   在 Vercel 项目设置中添加以下环境变量：
   - `VITE_DEEPSEEK_API_KEY`: 你的 DeepSeek API Key
   - `VITE_DEEPSEEK_API_URL`: (可选) https://api.deepseek.com/v1/chat/completions
   - `VITE_DEEPSEEK_MODEL`: (可选) deepseek-chat

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成
   - 访问 Vercel 提供的域名

### 方法二：通过 Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   vercel
   ```

4. **设置环境变量**
   ```bash
   vercel env add VITE_DEEPSEEK_API_KEY
   ```

5. **生产部署**
   ```bash
   vercel --prod
   ```

## 环境变量说明

| 变量名 | 说明 | 必填 | 默认值 |
|--------|------|------|--------|
| `VITE_DEEPSEEK_API_KEY` | DeepSeek API 密钥 | 是 | - |
| `VITE_DEEPSEEK_API_URL` | API 端点地址 | 否 | https://api.deepseek.com/v1/chat/completions |
| `VITE_DEEPSEEK_MODEL` | 使用的模型名称 | 否 | deepseek-chat |

## 获取 DeepSeek API Key

1. 访问 [DeepSeek Platform](https://platform.deepseek.com/)
2. 注册/登录账号
3. 在 API Keys 页面创建新的 API Key
4. 复制 API Key 并添加到 Vercel 环境变量中

## 自动部署

推送到 GitHub 的 `main` 分支后，Vercel 会自动触发部署：

```bash
git add .
git commit -m "Update features"
git push origin main
```

## 自定义域名

1. 在 Vercel Dashboard 中进入项目设置
2. 选择 "Domains" 标签
3. 添加你的自定义域名
4. 按照提示配置 DNS 记录

## 故障排查

### 构建失败
- 检查 `package.json` 中的依赖是否正确
- 确保 Node.js 版本兼容（推荐 18.x 或更高）

### API 调用失败
- 确认环境变量已正确设置
- 检查 API Key 是否有效
- 查看 Vercel 函数日志

### 页面空白
- 检查浏览器控制台错误
- 确认路由配置正确
- 验证 `vercel.json` 配置

## 性能优化建议

1. **启用缓存**: Vercel 自动为静态资源启用 CDN 缓存
2. **代码分割**: Vite 已自动处理代码分割
3. **图片优化**: 使用 Vercel Image Optimization
4. **监控**: 使用 Vercel Analytics 监控性能

## 安全建议

1. **永远不要**将 `.env` 文件提交到 Git
2. 定期轮换 API Keys
3. 使用环境变量管理敏感信息
4. 启用 Vercel 的安全头配置
