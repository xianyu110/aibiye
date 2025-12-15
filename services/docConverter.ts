// DOC到DOCX转换服务
import JSZip from 'jszip';

export class DocConverter {
  // 检查是否可以转换
  static canConvert(fileName: string): boolean {
    return fileName.toLowerCase().endsWith('.doc');
  }

  // 转换DOC到DOCX
  static async convertDocToDocx(file: File, onProgress?: (progress: number) => void): Promise<Blob> {
    try {
      onProgress?.(10);

      // 读取.doc文件
      const arrayBuffer = await file.arrayBuffer();
      onProgress?.(30);

      // 尝试解析.doc文件并提取文本
      const extractedText = await this.extractTextFromDoc(arrayBuffer);
      onProgress?.(70);

      // 创建DOCX文件
      const docxBlob = await this.createDocxFromText(extractedText, file.name);
      onProgress?.(100);

      return docxBlob;
    } catch (error) {
      console.error('DOC转换失败:', error);
      // 转换失败时，创建包含指导信息的DOCX
      return await this.createGuidanceDocx(file.name);
    }
  }

  // 从.doc文件提取文本（简化版本）
  private static async extractTextFromDoc(arrayBuffer: ArrayBuffer): Promise<string> {
    const uint8Array = new Uint8Array(arrayBuffer);

    // 检查.doc文件签名
    const docSignature = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1];
    let isRealDoc = true;

    for (let i = 0; i < 8; i++) {
      if (uint8Array[i] !== docSignature[i]) {
        isRealDoc = false;
        break;
      }
    }

    if (!isRealDoc) {
      throw new Error('无效的.doc文件格式');
    }

    try {
      // 尝试使用简化的文本提取
      // 这是一个基础实现，真正的.doc解析需要OLE解析器

      let extractedText = '';

      // 搜索可读文本
      for (let i = 0; i < uint8Array.length - 100; i++) {
        // 检查可能的文本序列
        if (this.isTextStart(uint8Array, i)) {
          const text = this.extractTextAt(uint8Array, i);
          if (text && text.length > 5) {
            extractedText += text + '\n';
          }
        }
      }

      // 如果没有提取到文本，返回基本信息
      if (extractedText.trim().length === 0) {
        return `检测到Word文档，但无法提取具体内容。\n\n文件大小: ${(arrayBuffer.byteLength / 1024).toFixed(1)} KB\n\n请使用Microsoft Word打开此文档查看完整内容。`;
      }

      return extractedText;
    } catch (error) {
      console.warn('文本提取失败:', error);
      throw error;
    }
  }

  // 检查是否是文本开始位置
  private static isTextStart(data: Uint8Array, index: number): boolean {
    // 检查是否包含可打印ASCII字符序列
    let textCount = 0;
    for (let i = 0; i < 10 && index + i < data.length; i++) {
      const char = data[index + i];
      if ((char >= 32 && char <= 126) || char === 10 || char === 13) {
        textCount++;
      }
    }
    return textCount >= 5;
  }

  // 在指定位置提取文本
  private static extractTextAt(data: Uint8Array, index: number): string {
    let text = '';
    for (let i = 0; index + i < data.length && i < 200; i++) {
      const char = data[index + i];
      if (char === 0) {
        break; // 空字节结束
      }
      if (char >= 32 && char <= 126) {
        text += String.fromCharCode(char);
      } else if (char === 10 || char === 13) {
        text += '\n';
      } else if (char < 32) {
        // 控制字符，可能结束
        break;
      }
    }
    return text.trim();
  }

  // 从文本创建DOCX文件
  private static async createDocxFromText(text: string, originalFileName: string): Promise<Blob> {
    const zip = new JSZip();

    // 创建基本DOCX结构
    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    const wordRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

    // 转义XML特殊字符
    const escapedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .replace(/\n/g, '</w:t><w:br/><w:t>')
      .replace(/\t/g, '</w:t><w:tab/><w:t>');

    const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:pPr>
                <w:pStyle w:val="Title"/>
            </w:pPr>
            <w:r>
                <w:t>从 ${originalFileName} 提取的内容</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t>${escapedText}</w:t>
            </w:r>
        </w:p>
    </w:body>
</w:document>`;

    // 添加文件到ZIP
    zip.file('[Content_Types].xml', contentTypes);
    zip.file('_rels/.rels', rels);
    zip.file('word/_rels/document.xml.rels', wordRels);
    zip.file('word/document.xml', document);

    // 生成DOCX文件
    const docxBlob = await zip.generateAsync({ type: 'blob' });
    return docxBlob;
  }

  // 创建包含指导信息的DOCX
  private static async createGuidanceDocx(originalFileName: string): Promise<Blob> {
    const guidanceText = `您上传的是旧版Word文档：${originalFileName}

由于.doc格式的复杂性，无法自动提取文档内容。

请选择以下方案之一：

方案一：手动转换（推荐）
1. 使用Microsoft Word或WPS打开文档
2. 选择"文件" → "另存为"
3. 选择"Word文档(*.docx)"格式
4. 保存后重新上传

方案二：使用在线转换工具
1. 访问 https://convertio.co/doc-docx/
2. 上传您的.doc文件
3. 转换为.docx格式后重新上传

方案三：复制内容
1. 打开.doc文件
2. 全选并复制文本内容 (Ctrl+A, Ctrl+C)
3. 粘贴到文本输入框中

抱歉给您带来不便。`;

    return await this.createDocxFromText(guidanceText, originalFileName);
  }
}