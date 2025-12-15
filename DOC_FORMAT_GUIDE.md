# Word文档格式支持说明

## 支持的格式

### ✅ Word 2007+ (.docx) - 原生支持
- 使用 **mammoth.js** 库进行本地解析
- 无需配置API Key
- 解析速度快
- 支持最大 50MB 文件
- 保持文档结构和格式

### 🧠 Word 97-2003 (.doc) - AI支持
- 使用 **Google Gemini 2.0 Flash** AI模型进行解析
- 需要配置 Gemini API Key
- 支持最大 20MB 文件
- 智能识别文档内容和结构
- 需要网络连接

## 配置Gemini API Key支持.doc格式

### 1. 获取API Key
访问 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取免费的API Key

### 2. 配置环境变量
在 `.env` 文件中添加：
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. 重启应用
```bash
npm run dev
```

## 处理流程对比

| 特性 | .docx (原生) | .doc (AI) |
|------|-------------|-----------|
| 处理方式 | 本地解析 | AI云解析 |
| 速度 | ⚡ 快速 | 🔄 中等 |
| 精度 | 高 | 很高 |
| 文件限制 | 50MB | 20MB |
| 网络依赖 | 无 | 需要 |
| API费用 | 无 | 按使用量计费 |

## 转换.doc为.docx的方法

如果您不想使用Gemini API，可以将.doc文件转换为.docx格式：

### 方法1：使用Microsoft Word
1. 打开.doc文件
2. 选择 "文件" → "另存为"
3. 选择 "Word 文档 (*.docx)" 格式
4. 保存文件

### 方法2：使用免费在线工具
- [Google Docs](https://docs.google.com/)
- [LibreOffice](https://www.libreoffice.org/)
- [WPS Office](https://www.wps.com/)

### 方法3：命令行转换（Linux/macOS）
```bash
# 使用LibreOffice
libreoffice --headless --convert-to docx your_file.doc
```

## 推荐做法

1. **优先使用.docx格式**：更快、更稳定、无需额外配置
2. **仅当无法转换时使用.doc**：需要配置Gemini API Key
3. **大文件处理**：超过20MB的文档必须转换为.docx格式

## 错误处理

- 如果.doc文件处理失败，请检查Gemini API Key配置
- 确保网络连接正常
- 文件大小不超过20MB
- 文件没有密码保护

---

**提示**：为了获得最佳体验，建议将所有Word文档保存为.docx格式。