# Gemini 文档解析功能配置指南

本文档介绍如何配置和使用 Gemini 2.0 Flash 模型进行智能文档解析和 OCR 功能。

## 功能特点

- 🚀 **AI智能解析**：使用 Google Gemini 2.0 Flash 模型
- 📄 **多格式支持**：PDF、Word、Excel、PowerPoint、图片等
- 🔍 **OCR文字识别**：支持扫描版PDF和图片中的文字提取
- 📊 **表格理解**：智能识别和提取表格数据
- 🌐 **多语言支持**：支持中英文等多种语言
- ⚡ **高精度解析**：保持原文结构和格式

## 配置步骤

### 1. 获取 Gemini API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登录您的 Google 账号
3. 点击 "Create API Key" 创建新的 API Key
4. 复制生成的 API Key

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

在 `.env` 文件中配置 Gemini API Key：

```env
# Gemini API Configuration (用于文档解析和OCR)
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta
VITE_GEMINI_MODEL=gemini-2.0-flash
VITE_ENABLE_GEMINI_DOCUMENT_PROCESSING=true
```

### 3. 重启开发服务器

如果您已经启动了开发服务器，请重启以加载新的环境变量：

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

## 使用方法

### 1. 上传文档

- 访问 http://localhost:3001/
- 选择"文档上传"方式
- 拖拽或点击上传支持的文档格式

### 2. 支持的文档格式

- **文本文档**：.txt
- **PDF文档**：.pdf（支持扫描版OCR）
- **Word文档**：.doc, .docx
- **Excel表格**：.xls, .xlsx
- **PowerPoint**：.ppt, .pptx
- **图片格式**：.jpg, .jpeg, .png, .bmp, .tiff

### 3. 处理状态显示

- 🧠 **AI智能解析**：使用Gemini进行解析
- 💻 **原生解析**：使用本地方法处理
- 🔄 **处理中**：显示解析进度

### 4. 文件大小限制

- 使用 Gemini 解析：最大 20MB
- 使用原生解析：最大 50MB

## 功能对比

| 功能 | Gemini AI解析 | 原生解析 |
|------|---------------|----------|
| PDF解析 | ✅ 优秀 | ⚠️ 基础 |
| 图片OCR | ✅ 优秀 | ❌ 不支持 |
| 表格识别 | ✅ 优秀 | ⚠️ 基础 |
| 复杂布局 | ✅ 优秀 | ❌ 不支持 |
| 处理速度 | 🔄 中等 | ⚡ 快速 |
| 文件限制 | 20MB | 50MB |

## API 调用示例

### 处理PDF文档

```typescript
import { GeminiDocumentService } from './services/geminiDocumentService';

// 初始化配置
GeminiDocumentService.initialize({
  apiKey: 'your-api-key',
  model: 'gemini-2.0-flash'
});

// 处理PDF文件
const text = await GeminiDocumentService.processPdfDocument(file);
```

### 处理图片OCR

```typescript
// 处理图片文件，进行OCR识别
const text = await GeminiDocumentService.processImageDocument(file, 'zh');
```

## 故障排除

### 1. Gemini API Key 未配置

**错误信息**：`Gemini API Key未配置`

**解决方案**：
- 检查 `.env` 文件中的 `VITE_GEMINI_API_KEY` 是否正确设置
- 确保 API Key 有效且没有额度限制

### 2. 文件大小超限

**错误信息**：`文件大小超过Gemini处理限制(20MB)`

**解决方案**：
- 压缩文档到 20MB 以下
- 或分割大型文档为多个小文件

### 3. 网络连接问题

**错误信息**：`Gemini API调用失败`

**解决方案**：
- 检查网络连接
- 确认防火墙设置允许访问 Google API
- 如果在某些地区，可能需要配置代理

### 4. 自动回退机制

当 Gemini API 不可用时，系统会自动回退到原生处理方法，确保基本功能可用。

## 最佳实践

1. **PDF文档**：扫描版PDF使用Gemini可以获得更好的OCR效果
2. **图片文件**：确保图片清晰度，避免模糊或倾斜
3. **表格数据**：Gemini能更好地理解和重建表格结构
4. **多语言文档**：Gemini支持混合语言文档解析
5. **大文件处理**：建议将大文档分割为小于20MB的部分

## 费用说明

- Gemini API 按使用量计费
- 建议在 [Google AI Studio](https://aistudio.google.com/) 查看最新定价
- 可以设置使用限制来控制成本

## 技术支持

如遇到问题，请检查：

1. 浏览器控制台的错误信息
2. 网络连接状态
3. API Key 配置是否正确
4. 文件格式是否支持

---

**注意**：为了保护数据隐私，所有文档处理都在客户端完成，不会上传到第三方服务器（除了必要的API调用）。