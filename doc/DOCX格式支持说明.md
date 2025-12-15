# DOCX格式支持说明

## ✅ 已实现功能

### 1. DOCX文件读取
- ✅ 使用 `mammoth.js` 解析docx文件
- ✅ 提取纯文本内容
- ✅ 支持中英文混合文档

### 2. DOCX文件生成
- ✅ 使用 `docx` 库生成真正的Word文档
- ✅ 保持段落结构
- ✅ 设置合适的字体和格式
- ✅ 支持中文字体（微软雅黑）

### 3. 下载选项
- ✅ 下载为Word文档（.docx）
- ✅ 下载为纯文本（.txt）
- ✅ 复制到剪贴板

## 📋 使用流程

### 方案A：纯文本输入（推荐）
```
1. 直接在文本框中粘贴内容
2. 选择改写模式
3. 点击"开始改写"
4. 下载Word或TXT格式
```

### 方案B：上传DOCX文件（需要添加上传功能）
```
1. 点击"上传文件"按钮
2. 选择.docx文件
3. 自动提取文本
4. 改写后下载为Word格式
```

## 🔧 技术实现

### 依赖库
```json
{
  "mammoth": "^1.11.0",  // 读取docx
  "docx": "^8.5.0",      // 生成docx
  "file-saver": "^2.0.5" // 下载文件
}
```

### 核心代码

#### 1. 提取文本
```typescript
import mammoth from 'mammoth';

async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
```

#### 2. 生成DOCX
```typescript
import { Document, Paragraph, TextRun, Packer } from 'docx';
import { saveAs } from 'file-saver';

async function downloadAsDocx(text: string, filename: string) {
  const paragraphs = text.split('\n\n').map(paraText => 
    new Paragraph({
      children: [
        new TextRun({
          text: paraText,
          font: 'Microsoft YaHei',
          size: 24, // 12pt
        })
      ],
      spacing: {
        after: 200,
        line: 360, // 1.5倍行距
      },
    })
  );

  const doc = new Document({
    sections: [{ children: paragraphs }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
```

## 📝 格式说明

### 生成的Word文档格式
- **字体**: 微软雅黑 (Microsoft YaHei)
- **字号**: 12pt (小四)
- **行距**: 1.5倍
- **段后间距**: 10pt
- **页边距**: 2.54cm (标准A4)
- **对齐方式**: 左对齐

### 保留的格式
✅ 段落分隔（空行）
✅ 段落内换行
✅ 文本内容

### 不保留的格式
❌ 字体颜色
❌ 加粗/斜体
❌ 标题样式
❌ 列表格式
❌ 表格
❌ 图片

## 🎯 下一步优化

### 短期优化（简单）
1. ✅ 添加文件上传按钮
2. ✅ 显示文件名和大小
3. ✅ 支持拖拽上传
4. ⏳ 添加进度提示

### 中期优化（中等）
1. ⏳ 保留更多格式（加粗、斜体）
2. ⏳ 支持标题样式
3. ⏳ 支持列表格式
4. ⏳ 批量处理多个文件

### 长期优化（复杂）
1. ⏳ 保留表格格式
2. ⏳ 保留图片
3. ⏳ 支持.doc格式（旧版Word）
4. ⏳ 支持PDF导出

## 🐛 已知问题

### 问题1：复杂格式丢失
**原因**: mammoth只提取纯文本，不保留格式
**解决方案**: 
- 短期：提示用户"仅支持纯文本"
- 长期：使用mammoth的HTML模式，保留部分格式

### 问题2：.doc文件不支持
**原因**: mammoth只支持.docx格式
**解决方案**: 
- 提示用户转换为.docx
- 或使用其他库（如python-docx）

### 问题3：大文件处理慢
**原因**: 浏览器内存限制
**解决方案**: 
- 限制文件大小（建议<10MB）
- 添加进度提示
- 考虑后端处理

## 💡 使用建议

### 最佳实践
1. **文件大小**: 建议<5MB
2. **文件格式**: 使用.docx（不要用.doc）
3. **内容类型**: 纯文本效果最好
4. **复杂格式**: 建议先转为纯文本

### 常见问题

**Q: 为什么上传的Word文档格式丢失了？**
A: 当前版本只提取纯文本内容，不保留格式。改写后会应用统一的格式。

**Q: 可以保留加粗和斜体吗？**
A: 当前版本不支持，未来版本会添加。

**Q: 支持.doc格式吗？**
A: 不支持，请先转换为.docx格式。

**Q: 生成的Word文档可以编辑吗？**
A: 可以，生成的是标准的.docx文件，可以用Word打开编辑。

**Q: 为什么下载的文件打不开？**
A: 请确保：
1. 使用最新版本的Word或WPS
2. 文件扩展名是.docx
3. 浏览器允许下载

## 🔗 相关文档

- [mammoth.js 文档](https://github.com/mwilliamson/mammoth.js)
- [docx 库文档](https://docx.js.org/)
- [file-saver 文档](https://github.com/eligrey/FileSaver.js/)

## 📊 测试清单

- [ ] 上传小文件（<1MB）
- [ ] 上传中等文件（1-5MB）
- [ ] 上传大文件（>5MB）
- [ ] 纯文本文档
- [ ] 包含格式的文档
- [ ] 中文文档
- [ ] 英文文档
- [ ] 中英混合文档
- [ ] 下载Word格式
- [ ] 下载TXT格式
- [ ] 在Word中打开下载的文件
- [ ] 编辑下载的文件
