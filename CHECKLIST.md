# 部署检查清单

## 准备阶段

- [ ] 已安装 Git
- [ ] 已配置 Git 用户名和邮箱
- [ ] 已注册 GitHub 账号
- [ ] 已注册 Vercel 账号
- [ ] 已获取 DeepSeek API Key

## GitHub 上传

- [ ] 在 GitHub 创建新仓库
- [ ] 复制仓库地址
- [ ] 运行 `./deploy.sh` 或手动执行以下命令：
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git branch -M main
  git remote add origin https://github.com/你的用户名/仓库名.git
  git push -u origin main
  ```
- [ ] 确认代码已成功推送到 GitHub

## Vercel 部署

- [ ] 访问 [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] 点击 "Add New Project"
- [ ] 选择 GitHub 仓库
- [ ] 配置环境变量：
  - [ ] `VITE_DEEPSEEK_API_KEY` = 你的 API Key
  - [ ] `VITE_DEEPSEEK_API_URL` = https://api.deepseek.com/v1/chat/completions (可选)
  - [ ] `VITE_DEEPSEEK_MODEL` = deepseek-chat (可选)
- [ ] 点击 "Deploy"
- [ ] 等待构建完成
- [ ] 访问部署的网站测试功能

## 测试验证

- [ ] 网站可以正常访问
- [ ] 可以输入文本
- [ ] 可以选择改写模式
- [ ] 点击"开始改写"后有响应
- [ ] 改写结果正常显示
- [ ] 可以复制改写结果

## 可选配置

- [ ] 配置自定义域名
- [ ] 启用 Vercel Analytics
- [ ] 设置 GitHub Actions 自动部署
- [ ] 添加项目 README 徽章

## 维护

- [ ] 定期检查 API 使用量
- [ ] 更新依赖包
- [ ] 备份重要配置
- [ ] 监控网站性能

## 故障排查

如果遇到问题，检查：

1. **构建失败**
   - 查看 Vercel 构建日志
   - 确认 package.json 依赖正确
   - 检查 Node.js 版本

2. **API 调用失败**
   - 确认环境变量已设置
   - 检查 API Key 是否有效
   - 查看浏览器控制台错误

3. **页面空白**
   - 检查浏览器控制台
   - 确认路由配置
   - 验证构建输出

## 有用的链接

- [GitHub 仓库](https://github.com/你的用户名/仓库名)
- [Vercel 项目](https://vercel.com/dashboard)
- [DeepSeek Platform](https://platform.deepseek.com/)
- [项目文档](./DEPLOYMENT.md)
