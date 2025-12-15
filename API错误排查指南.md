# API 错误排查指南

## 错误：API请求失败: 400

### 可能原因

1. **API Key 格式错误**
2. **请求格式不正确**
3. **中转 API 配置问题**
4. **模型名称错误**

## 排查步骤

### 1. 测试 API 连接

打开 `test-api.html` 文件在浏览器中测试：

```bash
# 在项目目录下
open test-api.html  # macOS
# 或直接双击文件
```

点击"测试 DeepSeek API"按钮，查看详细错误信息。

### 2. 检查环境变量

确认 `.env` 文件配置：

```env
# DeepSeek API
VITE_DEEPSEEK_API_KEY=sk-DJiL3g5qnU3bfNWI2nvZTNXRWW0MhCZLA8eghVcHw4UWa4Ph
VITE_DEEPSEEK_API_URL=https://for.shuo.bar/v1/chat/completions
VITE_DEEPSEEK_MODEL=deepseek-chat
```

### 3. 重启开发服务器

环境变量更改后必须重启：

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

### 4. 检查浏览器控制台

1. 打开浏览器开发者工具 (F12)
2. 切换到 Console 标签
3. 查看详细错误信息
4. 查看 Network 标签中的请求详情

### 5. 常见问题解决

#### 问题 A: "API Key 无效"

**解决方案**:
1. 确认 API Key 是否正确
2. 检查 API Key 是否过期
3. 确认 API Key 有足够的额度

#### 问题 B: "模型不存在"

**解决方案**:
```env
# 尝试不同的模型名称
VITE_DEEPSEEK_MODEL=deepseek-chat
# 或
VITE_DEEPSEEK_MODEL=deepseek-coder
```

#### 问题 C: "请求格式错误"

**可能原因**: 中转 API 的格式要求与官方不同

**解决方案**: 检查中转 API 文档，可能需要调整请求格式

#### 问题 D: "CORS 错误"

**解决方案**: 这是正常的，Vite 开发服务器会处理 CORS

### 6. 使用官方 API 测试

如果中转 API 有问题，尝试使用官方 API：

```env
# 使用 DeepSeek 官方 API
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

注意：官方 API 可能需要科学上网

### 7. 检查网络连接

```bash
# 测试中转 API 是否可访问
curl -I https://for.shuo.bar/v1/chat/completions
```

## 详细错误日志

查看浏览器控制台的完整错误信息：

```javascript
// 应该看到类似这样的日志
DeepSeek API Error: {
  status: 400,
  statusText: "Bad Request",
  error: { ... },
  url: "https://for.shuo.bar/v1/chat/completions",
  model: "deepseek-chat"
}
```

## 请求格式参考

### DeepSeek API 标准格式

```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "你是一个专业的文本改写AI"
    },
    {
      "role": "user",
      "content": "请改写这段文本..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "stream": false
}
```

### 可能的中转 API 格式差异

某些中转 API 可能需要：

1. **不同的认证方式**
   ```javascript
   // 可能需要在 URL 中传递 key
   url: `${apiUrl}?key=${apiKey}`
   ```

2. **不同的请求头**
   ```javascript
   headers: {
     'Content-Type': 'application/json',
     'x-api-key': apiKey  // 而不是 Authorization
   }
   ```

3. **不同的模型名称**
   ```json
   {
     "model": "gpt-3.5-turbo"  // 中转可能映射到其他模型
   }
   ```

## 联系中转 API 提供商

如果以上方法都无效，请联系中转 API 提供商确认：

1. API Key 是否有效
2. 正确的 API 端点地址
3. 正确的请求格式
4. 是否有使用限制或额度

## 临时解决方案

### 方案 1: 禁用文档上传功能

如果只是文本改写功能有问题，可以暂时禁用文档上传：

```env
VITE_ENABLE_GEMINI_DOCUMENT_PROCESSING=false
```

### 方案 2: 使用官方 API

```env
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

### 方案 3: 更换 API 提供商

考虑使用其他 AI API：
- OpenAI API
- Claude API
- 其他中转服务

## 获取帮助

1. 查看浏览器控制台的完整错误
2. 使用 `test-api.html` 测试 API
3. 检查中转 API 提供商的文档
4. 确认 API Key 和额度

## 成功标志

当配置正确时，你应该看到：

1. ✅ 文本可以正常改写
2. ✅ 浏览器控制台没有错误
3. ✅ `test-api.html` 测试通过
4. ✅ 改写结果正常显示

## 下一步

配置成功后：
1. 测试不同的改写模式
2. 测试文档上传功能（如果启用）
3. 部署到 Vercel

---

**需要更多帮助？**

请提供：
- 浏览器控制台的完整错误信息
- `test-api.html` 的测试结果
- 你的 `.env` 配置（隐藏 API Key）
