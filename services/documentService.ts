// 文档处理服务
import mammoth from 'mammoth';

export interface ProcessedDocument {
  text: string;
  metadata: {
    fileName: string;
    fileSize: number;
    fileType: string;
    pageCount?: number;
    extractedAt: Date;
    processingMethod?: 'native' | 'gemini';
  };
}

export class DocumentService {
  // 支持的文件类型
  static supportedTypes = {
    text: ['.txt'],
    word: ['.doc', '.docx']
  };

  // 检查文件类型是否支持
  static isSupported(fileName: string): boolean {
    const extension = '.' + fileName.split('.').pop()?.toLowerCase();
    return Object.values(this.supportedTypes).some(types => types.includes(extension));
  }

  // 获取文件类型
  static getFileType(fileName: string): string {
    const extension = '.' + fileName.split('.').pop()?.toLowerCase();

    for (const [type, extensions] of Object.entries(this.supportedTypes)) {
      if (extensions.includes(extension)) {
        return type;
      }
    }

    return 'unknown';
  }

  // 处理文档
  static async processDocument(file: File): Promise<ProcessedDocument> {
    const fileType = this.getFileType(file.name);

    if (!this.isSupported(file.name)) {
      throw new Error(`不支持的文件格式: ${file.name}`);
    }

    const fileSizeLimit = 100 * 1024 * 1024; // 100MB限制

    if (file.size > fileSizeLimit) {
      throw new Error(`文件大小不能超过${Math.round(fileSizeLimit / 1024 / 1024)}MB`);
    }

    try {
      let extractedText = '';

      // 使用本地方法处理文档
      extractedText = await this.processWithNativeMethod(file, fileType);

      return {
        text: extractedText,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType,
          extractedAt: new Date(),
          processingMethod: 'native'
        }
      };
    } catch (error) {
      console.error('文档处理失败:', error);
      throw new Error(`文档处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 使用原生方法处理文档
  private static async processWithNativeMethod(file: File, fileType: string): Promise<string> {
    switch (fileType) {
      case 'text':
        return await this.processTextFile(file);
      case 'word':
        return await this.processWordFile(file);
      default:
        throw new Error(`无法处理的文件类型: ${fileType}`);
    }
  }

  // 处理文本文件
  private static async processTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = () => reject(new Error('文本文件读取失败'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  // 处理Word文档
  private static async processWordFile(file: File): Promise<string> {
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'doc') {
        // 对于.doc文件，提供用户指导
        return await this.processDocFile(file);
      } else {
        // 对于.docx文件，使用mammoth库
        return await this.processDocxFile(file);
      }
    } catch (error) {
      console.error('Word文档解析失败:', error);
      if (error instanceof Error) {
        throw new Error(`Word文档解析失败: ${error.message}`);
      }
      throw new Error('Word文档解析失败: 未知错误，请确保文档格式正确');
    }
  }

  // 处理.docx文件
  private static async processDocxFile(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({
        arrayBuffer,
        options: {
          includeDefaultStyleMap: true,
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Title'] => h1:fresh",
            "p[style-name='Subtitle'] => h2:fresh"
          ],
          // 转换表格
          tables: true
        }
      });

      if (result.messages.length > 0) {
        console.warn('Word文档解析警告:', result.messages);
      }

      // 清理提取的文本
      let text = result.value;

      // 移除多余的空行
      text = text.replace(/\n\s*\n\s*\n/g, '\n\n');

      // 移除页眉页脚等常见模式
      text = text.replace(/第\s*\d+\s*页/g, '');
      text = text.replace(/Page\s*\d+/g, '');

      // 移除制表符，替换为空格
      text = text.replace(/\t/g, ' ');

      // 保留段落结构但��理多余空格
      text = text.replace(/ +/g, ' ');
      text = text.replace(/\n +/g, '\n');

      // 清理文档开头和结尾的空白
      text = text.trim();

      // 如果提取的���本为空或太短，可能是文档损坏或格式问题
      if (text.length < 10) {
        throw new Error('文档内容提取失败或文档为空，请检查文档是否损坏');
      }

      return text;
    } catch (error) {
      console.error('DOCX文档解析失败:', error);
      throw new Error(`DOCX文档解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 处理.doc文件
  private static async processDocFile(file: File): Promise<string> {
    // 提供用户手动转换指导
    return `您上传的是旧版Word文档(.doc格式)。

由于浏览器安全限制，无法直接解析.doc格式的文件。请选择以下方案之一：

方案一：手动转换文档（推荐）
1. 使用Microsoft Word或WPS打开文档
2. 选择"文件" → "另存为"
3. 选择"Word文档(*.docx)"格式
4. 保存后重新上传转换后的文件

方案二：使用在线转换工具
1. 访问 https://convertio.co/doc-docx/ 或其他在线转换网站
2. 上传您的.doc文件
3. 转换为.docx格式后重新上传

方案三：复制粘贴内容
1. 打开.doc文件
2. 全选并复制文本内容(Ctrl+A, Ctrl+C)
3. 粘贴到应用的文本输入框中

文件信息：
文件名：${file.name}
文件大小：${(file.size / 1024).toFixed(1)} KB

提示：为了获得最佳体验，建议使用.docx格式文件。`;
  }

  // 清理和预处理文本
  static cleanText(text: string): string {
    return text
      // 移除多余的空白字符
      .replace(/\s+/g, ' ')
      // 移除特殊字符
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      // 移除多余的换行
      .replace(/\n\s*\n/g, '\n\n')
      // 首尾空格
      .trim();
  }

  // 分段处理长文本
  static splitText(text: string, maxLength: number = 3000): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.。!！?？]/);
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length < maxLength) {
        currentChunk += sentence + '。';
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = sentence + '。';
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  // 获取文件类型图标
  static getFileIcon(fileType: string): string {
    const icons: Record<string, string> = {
      text: '📄',
      word: '📝'
    };

    return icons[fileType] || '📎';
  }

  // 获取文件类型描述
  static getFileTypeDescription(fileType: string): string {
    const descriptions: Record<string, string> = {
      text: '文本文档',
      word: 'Word文档'
    };

    return descriptions[fileType] || '未知类型';
  }
}