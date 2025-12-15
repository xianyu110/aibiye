# 快速配置指南

## 问题解决：.doc文件无法处理

您遇到了 `.doc` 文件无法处理的问题，这是因为需要配置 Gemini API Key。

### 🚀 立即解决方案（推荐）

**将 .doc 文件转换为 .docx 格式**

1. 用 Microsoft Word 打开您的 .doc 文件
2. 点击 "文件" → "另存为"
3. 在"保存类型"中选择 "Word 文档 (*.docx)"
4. 保存文件
5. 重新上传 .docx 文件

### 🔧 配置 Gemini API（支持 .doc 文件）

如果您确实需要处理 .doc 文件，请按以下步骤配置：

1. **获取 Gemini API Key**
   - 访问：https://aistudio.google.com/app/apikey
   - 使用 Google 账号登录
   - 点击 "Create API Key"
   - 复制生成的 Key（以 "AIza" 开头）

2. **配置环境变量**
   - 编辑项目根目录的 `.env` 文件
   - 替换这行：
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   - 为：
   ```
   VITE_GEMINI_API_KEY=AIzaSy...（您的完整API Key）
   ```

3. **重启开发服务器**
   ```bash
   # 停止当前服务器（Ctrl+C）
   npm run dev
   ```

### 📝 其他方案

**方案三：复制粘贴**
- 直接从 Word 文档复制文本
- 粘贴到网页的"文本输入"框中
- 点击"开始AIGC降重"

### ⚡ 当前状态

- ✅ .docx 文件：完全支持，无需额外配置
- ❌ .doc 文件：需要 Gemini API 或转换为 .docx
- ✅ PDF 文件：支持（建议配置 Gemini 获得更好效果）
- ✅ 其他格式：正常支持

### 💡 推荐做法

为了获得最佳体验，建议：
1. 将所有 Word 文档保存为 .docx 格式
2. 避免使用旧版 .doc 格式
3. 大文件建议转换为 .docx 格式（支持更大文件）

---

**现在您可以尝试重新上传文档，或按照上述指南进行配置！**