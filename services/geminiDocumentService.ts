// Gemini文档解析服务
// 使用gemini-3-flash-preview模型进行文档理解和OCR

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
    model: 'gemini-3-flash-preview'
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
      'webp': 'image/webp',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    return typeMap[extension] || file.type || 'application/octet-stream';
  }

  // 调用Gemini API
  private static async callGemini(request: GeminiRequest): Promise<string> {
    if (!this.config.apiKey || this.config.apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API Key未配置。请检查您的.env文件中的VITE_GEMINI_API_KEY配置');
    }

    // 使用配置的API URL
    const apiUrl = this.config.apiUrl || 'https://generativelanguage.googleapis.com/v1beta';

    // 根据API URL格式构建请求URL
    let url: string;
    if (apiUrl.includes('google.com') || apiUrl.includes('googleapis.com')) {
      // 官方Google API格式
      url = `${apiUrl}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;
    } else {
      // 中转API格式
      url = `${apiUrl}/models/${this.config.model}:generateContent`;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // 根据API类型添加认证头
      if (apiUrl.includes('google.com') || apiUrl.includes('googleapis.com')) {
        // 官方API使用URL参数认证，不需要额外的header
      } else {
        // 中转API使用Authorization头
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API错误详情:', errorText);

        if (response.status === 400) {
          throw new Error('请求格式错误，可能是文件过大或格式不支持');
        } else if (response.status === 403) {
          throw new Error('API Key无效或权限不足���请检查您的Gemini API Key');
        } else if (response.status === 429) {
          throw new Error('API调用频率过高，请稍后重试');
        } else {
          throw new Error(`API调用失败 (${response.status}): ${errorText}`);
        }
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Gemini API返回空结果，可能是文档内容无法识别');
      }

      const text = data.candidates[0].content.parts[0]?.text || '';
      // 清理提取的文本
      return this.cleanExtractedText(text);
    } catch (error) {
      console.error('Gemini API调用错误:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('网络连接错误，请检查网络后重试');
      }
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

      // 检测文件格式
      const isLegacyDoc = file.name.toLowerCase().endsWith('.doc');
      const mimeType = isLegacyDoc
        ? 'application/msword'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      const docType = isLegacyDoc ? 'Word 97-2003 (.doc)' : 'Word 2007+ (.docx)';

      const prompt = language === 'zh'
        ? `请提取${docType}文档中的所有文字内容。要求：
1. 保持原文的段落结构和格式
2. 识别标题、正文、表格等内容
3. 保留文档的结构层次和章节编号
4. 移除页眉页脚信息
5. 只返回提取的文字内容，不要添加额外说明`
        : `Extract all text content from this ${docType} document. Requirements:
1. Maintain the original paragraph structure and format
2. Recognize titles, body text, tables, and other content
3. Preserve the document's structural hierarchy and section numbers
4. Remove headers and footers
5. Only return the extracted text content without additional explanations`;

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

  // 清理和过滤提取的文本
  static cleanExtractedText(text: string): string {
    // 移除EMF+等图形对象标记
    text = text.replace(/EMF\+[+\w@]*@[\w\W]*?@/g, '');

    // 移除其他常见的二进制数据标记
    text = text.replace(/[A-F0-9]{20,}/g, ''); // 移除长串的十六进制字符
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // 移除控制字符

    // 移除重复的空白字符
    text = text.replace(/\s+/g, ' ');

    // 移除开头的"从...提取的内容"等重复文本
    text = text.replace(/^从\s+.*?提取的内容[：:]\s*/g, '');

    // 清理每行的开头和结尾
    const lines = text.split('\n');
    const cleanedLines = lines.map(line => line.trim()).filter(line => line.length > 0);

    // 重新组合，保持段落结构
    let result = '';
    let lastLineWasEmpty = false;

    for (let i = 0; i < cleanedLines.length; i++) {
      const line = cleanedLines[i];

      // 如果是单字符或短字符串且包含特殊字符，可能是乱码，跳过
      if (line.length < 5 && /[^\u4e00-\u9fa5\w\s.,!?;:()[\]{}"'，。！？；：（）【】《》]/.test(line)) {
        continue;
      }

      // 检查是否是乱码行（包含大量特殊字符）
      const specialCharRatio = (line.match(/[^\u4e00-\u9fa5\w\s.,!?;:()[\]{}"'，。！？；：（）【】《》]/g) || []).length / line.length;
      if (specialCharRatio > 0.3) {
        continue; // 跳过乱码行
      }

      result += line;

      // 判断是否需要换行
      const nextLine = cleanedLines[i + 1];
      if (nextLine && !lastLineWasEmpty) {
        // 如果下一行以句号、问号、感叹号或段落结束符结尾，或者当前行以这些标点结尾，则换行
        if (/[。！？.!?]$/.test(line) || /^[（(【[]"']/.test(nextLine)) {
          result += '\n\n';
          lastLineWasEmpty = true;
        } else {
          result += ' ';
          lastLineWasEmpty = false;
        }
      } else if (!nextLine) {
        // 最后一段
        result += '\n';
      }
    }

    // 最终清理
    result = result.replace(/\n{3,}/g, '\n\n'); // 最多两个连续换行
    result = result.replace(/ {2,}/g, ' '); // 最多一个空格

    return result.trim();
  }
}