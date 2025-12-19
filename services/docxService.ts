import mammoth from 'mammoth';
import { Document, Paragraph, TextRun, AlignmentType, Packer } from 'docx';
import { saveAs } from 'file-saver';

/**
 * 清理提取的文本中的乱码
 */
function cleanExtractedText(text: string): string {
  // 移除EMF+等图形对象标记
  text = text.replace(/EMF\+[+\w@]*@[\w\W]*?@/g, '');

  // 移除其他常见的二进制数据标记
  text = text.replace(/[A-F0-9]{20,}/g, ''); // 移除长串的十六进制字符
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // 移除控制字符

  // 移除重复的空白字符
  text = text.replace(/\s+/g, ' ');

  // 移除开头的"从...提取的内容"等重复文本
  text = text.replace(/^从\s+.*?提取的内容[：:]\s*/g, '');

  // 按行清理
  const lines = text.split('\n');
  const cleanedLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // 跳过空行
    if (!trimmedLine) continue;

    // 如果是单字符或短字符串且包含特殊字符，可能是乱码，跳过
    if (trimmedLine.length < 5 && /[^\u4e00-\u9fa5\w\s.,!?;:()[\]{}"'，。！？；：（）【】《》]/.test(trimmedLine)) {
      continue;
    }

    // 检查是否是乱码行（包含大量特殊字符）
    const specialCharRatio = (trimmedLine.match(/[^\u4e00-\u9fa5\w\s.,!?;:()[\]{}"'，。！？；：（）【】《》]/g) || []).length / trimmedLine.length;
    if (specialCharRatio > 0.3) {
      continue; // 跳过乱码行
    }

    cleanedLines.push(trimmedLine);
  }

  // 重新组合，保持段落结构
  return cleanedLines.join('\n\n');
}

/**
 * 从docx文件中提取纯文本
 */
export async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (!result.value) {
      throw new Error('无法从文档中提取文本');
    }

    // 清理提取的文本
    return cleanExtractedText(result.value);
  } catch (error) {
    console.error('提取文本失败:', error);
    throw new Error('文档解析失败，请确保文件格式正确');
  }
}

/**
 * 从docx文件中提取HTML（保留更多格式）
 */
export async function extractHtmlFromDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    if (!result.value) {
      throw new Error('无法从文档中提取内容');
    }
    
    return result.value;
  } catch (error) {
    console.error('提取HTML失败:', error);
    throw new Error('文档解析失败，请确保文件格式正确');
  }
}

/**
 * 将文本转换为真正的docx文件并下载
 */
export async function downloadAsDocx(text: string, filename: string = '改写结果.docx') {
  try {
    // 按段落分割文本
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    // 创建段落对象
    const docParagraphs = paragraphs.map(paraText => {
      // 处理段落内的换行
      const lines = paraText.split('\n');
      
      return new Paragraph({
        children: lines.flatMap((line, index) => {
          const runs = [
            new TextRun({
              text: line,
              font: 'Microsoft YaHei', // 使用微软雅黑字体
              size: 24, // 12pt = 24 half-points
            })
          ];
          
          // 如果不是最后一行，添加换行
          if (index < lines.length - 1) {
            runs.push(new TextRun({ break: 1 }));
          }
          
          return runs;
        }),
        spacing: {
          after: 200, // 段后间距
          line: 360, // 行距 1.5倍
        },
        alignment: AlignmentType.LEFT,
      });
    });

    // 创建文档
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,    // 2.54cm = 1440 twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: docParagraphs,
      }],
    });

    // 生成docx文件
    const blob = await Packer.toBlob(doc);
    
    // 下载文件
    saveAs(blob, filename);
    
    console.log('文档已生成并下载');
  } catch (error) {
    console.error('生成docx失败:', error);
    throw new Error('生成Word文档失败');
  }
}

/**
 * 检查文件是否为docx格式
 */
export function isDocxFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.docx') || 
         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
}

/**
 * 检查文件是否为doc格式（旧版Word）
 */
export function isDocFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.doc') || 
         file.type === 'application/msword';
}

/**
 * 文件大小格式化
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
