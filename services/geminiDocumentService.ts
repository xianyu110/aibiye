// Gemini文档解析服务
// 使用gemini-2.0-flash模型进行文档理解和OCR

interface GeminiConfig {
  apiKey: string;
  apiUrl?: string;
  model?: string;
}

interface GeminiRequest {
  contents: Array<{
    role: string;
    parts: Array<{
      inline_data?: {
        mime_type: string;
        data: string;
      };
      text?: string;
    }>;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiDocumentService {
  private static config: GeminiConfig = {
    apiKey: '',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.0-flash'
  };

  // 初始化配置
  static initialize(config: GeminiConfig) {
    this.config = { ...this.config, ...config };
  }

  // 获取配置
  static getConfig(): GeminiConfig {
    return { ...this.config };
  }

  // 文件转换为base64
  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // 移除data:image/...;base64,前缀
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  }

  // 获取MIME类型
  private static getMimeType(file: File): string {
    const typeMap: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'bmp': 'image/bmp',
      'tiff': 'image/tiff',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    return typeMap[extension] || file.type || 'application/octet-stream';
  }

  // 调用Gemini API
  private static async callGemini(request: GeminiRequest): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Gemini API Key未配置');
    }

    const url = `${this.config.apiUrl}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API调用失败: ${response.status} ${errorText}`);
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Gemini API返回空结果');
      }

      const text = data.candidates[0].content.parts[0]?.text || '';
      return text;
    } catch (error) {
      console.error('Gemini API调用错误:', error);
      throw error;
    }
  }

  // 处理图片文档 (OCR)
  static async processImageDocument(file: File, language: string = 'zh'): Promise<string> {
    try {
      const base64Data = await this.fileToBase64(file);
      const mimeType = this.getMimeType(file);

      const prompt = language === 'zh'
        ? `请提取图片中的所有文字内容。要求：
1. 保持原文的段落结构
2. 识别所有���见文字，包括中英文
3. 如果有表格，请用表格形式呈现
4. 只返回提取的文字内容，不要添加额外说明`
        : `Extract all text content from this image. Requirements:
1. Maintain the original paragraph structure
2. Recognize all visible text including Chinese and English
3. If there are tables, present them in table format
4. Only return the extracted text content without additional explanations`;

      const request: GeminiRequest = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              },
              {
                text: prompt
              }
            ]
          }
        ]
      };

      return await this.callGemini(request);
    } catch (error) {
      console.error('图片文档处理失败:', error);
      throw new Error(`图片文档处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 处理PDF文档
  static async processPdfDocument(file: File, language: string = 'zh'): Promise<string> {
    try {
      const base64Data = await this.fileToBase64(file);

      const prompt = language === 'zh'
        ? `请提取PDF文档中的所有文字内容。要求：
1. 保持原文的章节结构和段落格式
2. 识别所有文字，包括标题、正文、表格内容
3. 保留重要的格式信息（如标题层级）
4. 如果是学术论文，请保留章节编号
5. 只返回提取的文字内容，不要添加额外说明`
        : `Extract all text content from this PDF document. Requirements:
1. Maintain the original chapter structure and paragraph format
2. Recognize all text including titles, body text, and table content
3. Preserve important formatting information (such as heading levels)
4. If it's an academic paper, preserve chapter numbers
5. Only return the extracted text content without additional explanations`;

      const request: GeminiRequest = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                inline_data: {
                  mime_type: 'application/pdf',
                  data: base64Data
                }
              },
              {
                text: prompt
              }
            ]
          }
        ]
      };

      return await this.callGemini(request);
    } catch (error) {
      console.error('PDF文档处理失败:', error);
      throw new Error(`PDF文档处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 处理Word文档
  static async processWordDocument(file: File, language: string = 'zh'): Promise<string> {
    try {
      const base64Data = await this.fileToBase64(file);

      const prompt = language === 'zh'
        ? `请提取Word文档中的所有文字内容。要求：
1. 保持原文的段落结构和格式
2. 识别标题、正文、表格等内容
3. 保留文档的结构层次
4. 只返回提取的文字内容，不要添加额外说明`
        : `Extract all text content from this Word document. Requirements:
1. Maintain the original paragraph structure and format
2. Recognize titles, body text, tables, and other content
3. Preserve the document's structural hierarchy
4. Only return the extracted text content without additional explanations`;

      const request: GeminiRequest = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                inline_data: {
                  mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  data: base64Data
                }
              },
              {
                text: prompt
              }
            ]
          }
        ]
      };

      return await this.callGemini(request);
    } catch (error) {
      console.error('Word文档处理失败:', error);
      throw new Error(`Word文档处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 处理Excel文档
  static async processExcelDocument(file: File, language: string = 'zh'): Promise<string> {
    try {
      const base64Data = await this.fileToBase64(file);

      const prompt = language === 'zh'
        ? `请提取Excel表格中的所有数据。要求：
1. 保持表格的结构和行列关系
2. 识别所有单元格内容
3. 用清晰的格式表示表格数据
4. 包括工作表名称
5. 只返回提取的数据内容，不要添加额外说明`
        : `Extract all data from this Excel spreadsheet. Requirements:
1. Maintain the table structure and row-column relationships
2. Recognize all cell contents
3. Present table data in a clear format
4. Include worksheet names
5. Only return the extracted data content without additional explanations`;

      const request: GeminiRequest = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                inline_data: {
                  mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  data: base64Data
                }
              },
              {
                text: prompt
              }
            ]
          }
        ]
      };

      return await this.callGemini(request);
    } catch (error) {
      console.error('Excel文档处理失败:', error);
      throw new Error(`Excel文档处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 处理PowerPoint文档
  static async processPowerPointDocument(file: File, language: string = 'zh'): Promise<string> {
    try {
      const base64Data = await this.fileToBase64(file);

      const prompt = language === 'zh'
        ? `请提取PowerPoint演示文稿中的所有文字内容。要求：
1. 按幻灯片顺序组织内容
2. 识别每页幻灯片的标题和正文
3. 保留演讲者备注（如果有）
4. 用清晰的格式标记幻灯片页码
5. 只返回提取的文字内容，不要添加额外说明`
        : `Extract all text content from this PowerPoint presentation. Requirements:
1. Organize content by slide order
2. Recognize titles and body text of each slide
3. Preserve speaker notes (if any)
4. Clearly mark slide numbers
5. Only return the extracted text content without additional explanations`;

      const request: GeminiRequest = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                inline_data: {
                  mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                  data: base64Data
                }
              },
              {
                text: prompt
              }
            ]
          }
        ]
      };

      return await this.callGemini(request);
    } catch (error) {
      console.error('PowerPoint文档处理失败:', error);
      throw new Error(`PowerPoint文档处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 检查文件大小限制（Gemini限制）
  static checkFileSizeLimit(file: File): boolean {
    const maxSize = 20 * 1024 * 1024; // 20MB，Gemini的限制
    return file.size <= maxSize;
  }

  // 获取支持文件类型
  static getSupportedFileTypes(): string[] {
    return [
      '.pdf',
      '.jpg', '.jpeg',
      '.png', '.bmp', '.tiff', '.gif', '.webp',
      '.docx', '.doc',
      '.xlsx', '.xls',
      '.pptx', '.ppt'
    ];
  }

  // 检查文件类型是否支持
  static isFileTypeSupported(file: File): boolean {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return this.getSupportedFileTypes().includes(extension);
  }
}