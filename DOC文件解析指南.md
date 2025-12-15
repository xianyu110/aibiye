# .doc 文件解析指南

## 功能说明

本项目支持 `.doc`（Word 97-2003）格式文件的智能解析，通过 Gemini API 实现。

## 工作原理

### 1. 自动检测
当你上传 `.doc` 文件时，系统会自动：
- 检测文件扩展名
- 强制启用 Gemini API 处理
- 将文件转换为 base64 编码

### 2. API 调用
```
文件 → Base64 编码 → Gemini API → 文本提取 → 显示结果
```

### 3. 智能解析
Gemini API 会：
- 识别文档结构（标题、段落、列表等）
- 提取所有文本内容
- 保留文档的逻辑结构
- 移除页眉页脚等无关信息

## 配置要求

### 必需配置

在 `.env` 文件中：

```env
# Gemini API Key（必需）
VITE_GEMINI_API_KEY=你的API密钥

# Gemini API URL（必需）
VITE_GEMINI_API_URL=https://for.shuo.bar/v1beta

# 启用文档解析（必需）
VITE_ENABLE_GEMINI_DOCUMENT_PROCESSING=true
```

### 当前配置状态

✅ 已配置：
- `VITE_GEMINI_API_KEY`: sk-DJiL3g5qnU3bfNWI2nvZTNXRWW0MhCZLA8eghVcHw4UWa4Ph
- `VITE_GEMINI_API_URL`: https://for.shuo.bar/v1beta
- `VITE_GEMINI_MODEL`: gemini-2.0-flash
- `VITE_ENABLE_GEMINI_DOCUMENT_PROCESSING`: true

## 使用步骤

### 1. 启动应用
```bash
npm run dev
```

### 2. 上传 .doc 文件
1. 打开应用
2. 点击"文档上传"标签
3. 选择或拖拽 `.doc` 文件
4. 等待处理（会显示"使用 AI 智能提取文本内容..."）

### 3. 查看结果
- 提取的文本会自动显示
- 可以直接用于改写
- 支持复制和编辑

## 文件限制

| 项目 | 限制 |
|------|------|
| 文件格式 | .doc (Word 97-2003) |
| 最大大小 | 20 MB |
| 处理时间 | 通常 5-15 秒 |

## 代码实现

### 检测 .doc 文件
```typescript
// services/documentService.ts
const isLegacyDoc = file.name.toLowerCase().endsWith('.doc');
if (isLegacyDoc) {
  useGemini = true;  // 强制使用 Gemini
  fileSizeLimit = 20 * 1024 * 1024;  // 20MB 限制
}
```

### 调用 Gemini API
```typescript
// services/geminiDocumentService.ts
static async processWordDocument(file: File): Promise<string> {
  const base64Data = await this.fileToBase64(file);
  const mimeType = 'application/msword';  // .doc MIME 类型
  
  const request = {
    contents: [{
      role: 'user',
      parts: [
        { inline_data: { mime_type: mimeType, data: base64Data } },
        { text: '请提取Word文档中的所有文字内容...' }
      ]
    }]
  };
  
  return await this.callGemini(request);
}
```

### API 请求格式
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "inline_data": {
            "mime_type": "application/msword",
            "data": "base64编码的文件内容"
          }
        },
        {
          "text": "请提取Word 97-2003 (.doc)文档中的所有文字内容..."
        }
      ]
    }
  ]
}
```

## 故障排查

### 问题 1: "Gemini API Key未配置"

**原因**: 环境变量未设置或未生效

**解决方案**:
```bash
# 1. 检查 .env 文件
cat .env | grep GEMINI

# 2. 确认配置正确
# VITE_GEMINI_API_KEY=你的密钥
# VITE_GEMINI_API_URL=https://for.shuo.bar/v1beta

# 3. 重启开发服务器
npm run dev
```

### 问题 2: "Failed to fetch"

**可能原因**:
1. 网络连接问题
2. API 地址错误
3. API Key 无效
4. 中转服务不可用

**解决方案**:
```bash
# 1. 测试网络连接
curl https://for.shuo.bar/v1beta/models/gemini-2.0-flash:generateContent

# 2. 检查 API Key 是否有效
# 在浏览器控制台查看详细错误信息

# 3. 尝试使用官方 API（需要科学上网）
# VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta
```

### 问题 3: "文件大小超过限制"

**原因**: Gemini API 限制单个文件最大 20MB

**解决方案**:
1. **压缩文档**
   - 删除不必要的图片
   - 压缩嵌入的媒体文件
   - 另存为精简版本

2. **转换格式**
   - 将 .doc 转换为 .docx（通常更小）
   - 使用 Word 打开 → 另存为 → 选择 .docx

3. **分割文档**
   - 将大文档分成多个小文档
   - 分别上传处理

4. **直接复制文本**
   - 打开 Word 文档
   - 复制文本内容
   - 粘贴到"文本输入"框

### 问题 4: "提取的文本不完整"

**可能原因**:
1. 文档包含复杂格式
2. 文档包含大量图片或表格
3. 文档有密码保护

**解决方案**:
1. **简化文档**
   - 移除复杂的格式
   - 转换表格为文本
   - 移除图片

2. **转换为 .docx**
   - .docx 格式解析效果更好
   - Word 打开 → 另存为 → .docx

3. **移除密码保护**
   - 解除文档保护
   - 另存为新文件

## 与 .docx 的区别

| 特性 | .doc | .docx |
|------|------|-------|
| 格式 | 二进制 | XML 压缩包 |
| 文件大小 | 通常较大 | 通常较小 |
| 解析方式 | 仅 Gemini API | 原生 + Gemini |
| 解析速度 | 较慢（5-15秒） | 较快（1-3秒） |
| 准确度 | 高 | 高 |
| 推荐度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 最佳实践

### 1. 优先使用 .docx
如果可能，将 .doc 转换为 .docx：
```
Word 打开文档 → 文件 → 另存为 → 选择 "Word 文档 (*.docx)"
```

### 2. 优化文档大小
- 删除不必要的图片
- 压缩嵌入的媒体
- 移除隐藏内容

### 3. 检查提取结果
- 上传后仔细检查提取的文本
- 确认没有遗漏重要内容
- 必要时手动补充

### 4. 备份原文档
- 保留原始文档
- 以便需要时重新提取

## API 使用统计

每次 .doc 文件解析会：
- 调用 1 次 Gemini API
- 消耗约 0.001-0.01 美元（取决于文件大小）
- 处理时间 5-15 秒

## 技术细节

### MIME 类型
- `.doc`: `application/msword`
- `.docx`: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Base64 编码
```typescript
const reader = new FileReader();
reader.onload = () => {
  const result = reader.result as string;
  const base64 = result.split(',')[1];  // 移除 data:...;base64, 前缀
  resolve(base64);
};
reader.readAsDataURL(file);
```

### API 端点
```
POST https://for.shuo.bar/v1beta/models/gemini-2.0-flash:generateContent
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

## 相关文档

- [文档上传功能配置说明](./文档上传功能配置说明.md)
- [Gemini API 官方文档](https://ai.google.dev/gemini-api/docs/document-processing)
- [项目 README](./README.md)

## 总结

✅ **已支持 .doc 解析**
- 通过 Gemini API 实现
- 自动检测并处理
- 配置已完成
- 可以直接使用

🚀 **开始使用**
```bash
npm run dev
# 然后上传 .doc 文件测试
```

如有问题，请查看浏览器控制台的详细错误信息。
