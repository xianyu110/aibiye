// 文档处理服务
import { GeminiDocumentService } from './geminiDocumentService';
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
    word: ['.doc', '.docx'],
    pdf: ['.pdf'],
    image: ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'],
    excel: ['.xls', '.xlsx'],
    powerpoint: ['.ppt', '.pptx']
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
  static async processDocument(file: File, useGemini: boolean = true): Promise<ProcessedDocument> {
    const fileType = this.getFileType(file.name);

    if (!this.isSupported(file.name)) {
      throw new Error(`不支持的文件格式: ${file.name}`);
    }

    let extractedText = '';
    let processingMethod: 'native' | 'gemini' = 'native';
    let fileSizeLimit = 50 * 1024 * 1024; // 50MB限制

    // 如果使用Gemini，检查文件大小限制
    if (useGemini) {
      if (!GeminiDocumentService.isFileTypeSupported(file)) {
        throw new Error(`该文件类型不支持Gemini处理: ${file.name}`);
      }
      if (!GeminiDocumentService.checkFileSizeLimit(file)) {
        throw new Error('文件大小超过Gemini处理限制(20MB)');
      }
      fileSizeLimit = 20 * 1024 * 1024; // 20MB
    }

    if (file.size > fileSizeLimit) {
      throw new Error(`文件大小不能超过${Math.round(fileSizeLimit / 1024 / 1024)}MB`);
    }

    try {
      // 优先使用Gemini处理
      if (useGemini && GeminiDocumentService.isFileTypeSupported(file)) {
        try {
          switch (fileType) {
            case 'pdf':
              extractedText = await GeminiDocumentService.processPdfDocument(file);
              processingMethod = 'gemini';
              break;
            case 'image':
              extractedText = await GeminiDocumentService.processImageDocument(file);
              processingMethod = 'gemini';
              break;
            case 'word':
              extractedText = await GeminiDocumentService.processWordDocument(file);
              processingMethod = 'gemini';
              break;
            case 'excel':
              extractedText = await GeminiDocumentService.processExcelDocument(file);
              processingMethod = 'gemini';
              break;
            case 'powerpoint':
              extractedText = await GeminiDocumentService.processPowerPointDocument(file);
              processingMethod = 'gemini';
              break;
            default:
              // 回退到原生处理
              extractedText = await this.processWithNativeMethod(file, fileType);
              processingMethod = 'native';
          }
        } catch (geminiError) {
          console.warn('Gemini处理失败，回退到原生处理:', geminiError);
          extractedText = await this.processWithNativeMethod(file, fileType);
          processingMethod = 'native';
        }
      } else {
        // 使用原生处理方法
        extractedText = await this.processWithNativeMethod(file, fileType);
        processingMethod = 'native';
      }
    } catch (error) {
      console.error('文档处理失败:', error);
      throw new Error(`文档处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    return {
      text: extractedText,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType,
        extractedAt: new Date(),
        processingMethod
      }
    };
  }

  // 使用原生方法处理文档
  private static async processWithNativeMethod(file: File, fileType: string): Promise<string> {
    switch (fileType) {
      case 'text':
        return await this.processTextFile(file);
      case 'word':
        return await this.processWordFile(file);
      case 'pdf':
        return await this.processPdfFile(file);
      case 'image':
        return await this.processImageFile(file);
      case 'excel':
        return await this.processExcelFile(file);
      case 'powerpoint':
        return await this.processPowerPointFile(file);
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
      // 检查文件扩展名
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'doc') {
        // 旧版.doc格式提示
        throw new Error('不支持旧版.doc格式，请将文档另存为.docx格式后再上传');
      }

      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({
        arrayBuffer,
        // 添加更多配置选项
        options: {
          includeDefaultStyleMap: true,
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Title'] => h1:fresh",
            "p[style-name='Subtitle'] => h2:fresh"
          ]
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

      // 移除制表符
      text = text.replace(/\t/g, ' ');

      // 保留段落结构但清理多余空格
      text = text.replace(/ +/g, ' ');
      text = text.replace(/\n +/g, '\n');

      return text.trim();
    } catch (error) {
      console.error('Word文档解析失败:', error);
      throw new Error(`Word文档解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 处理PDF文档
  private static async processPdfFile(file: File): Promise<string> {
    // 实际项目中需要使用pdf.js或pdf-parse库
    await this.simulateProcessing(3000);
    return `从PDF文档 "${file.name}" 提取的文本内容示例。\n\n` +
           `实际部署时，请集成pdf.js或pdf-parse库来正确解析PDF文档。\n` +
           `安装命令: npm install pdf-parse\n` +
           `支持从PDF中提取文本内容。`;
  }

  // 处理图片文件 (OCR) - 仅当Gemini不可用时使用
  private static async processImageFile(file: File): Promise<string> {
    // 当Gemini不可用时的提示
    await this.simulateProcessing(5000);
    return `从图片 "${file.name}" 识别的文本内容。\n\n` +
           `注意：当前使用的是模拟处理。实际部署时建议：\n` +
           `1. 配置Gemini API Key以获得最佳OCR效果\n` +
           `2. 或集成Tesseract.js库 (npm install tesseract.js)\n` +
           `3. Gemini API支持更好的中文识别和复杂布局处理`;
  }

  // 处理Excel文件
  private static async processExcelFile(file: File): Promise<string> {
    await this.simulateProcessing(2500);
    return `从Excel文档 "${file.name}" 提取的表格数据。\n\n` +
           `注意：当前使用的是模拟处理。实际部署时建议：\n` +
           `1. 配置Gemini API Key以获得最佳表格识别效果\n` +
           `2. 或集成xlsx库 (npm install xlsx)\n` +
           `3. Gemini能够更好地理解表格结构和复杂格式`;
  }

  // 处理PowerPoint文件
  private static async processPowerPointFile(file: File): Promise<string> {
    // 实际项目中需要使用pptx2json库
    await this.simulateProcessing(3000);
    return `从PowerPoint文档 "${file.name}" 提取的文本��容示例。\n\n` +
           `实际部署时，请集成相应的PPT解析库来正确解析PowerPoint文档。\n` +
           `支持提取幻灯片中的文本内容。`;
  }

  // 模拟处理延迟
  private static simulateProcessing(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
      word: '📝',
      pdf: '📋',
      image: '🖼️',
      excel: '📊',
      powerpoint: '📑'
    };

    return icons[fileType] || '📎';
  }

  // 获取文件类型描述
  static getFileTypeDescription(fileType: string): string {
    const descriptions: Record<string, string> = {
      text: '文本文档',
      word: 'Word文档',
      pdf: 'PDF文档',
      image: '图片文档',
      excel: 'Excel表格',
      powerpoint: 'PowerPoint演示文稿'
    };

    return descriptions[fileType] || '未知类型';
  }
}