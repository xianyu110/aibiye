// DeepSeek API 客户端配置
const getApiConfig = () => {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
  const apiUrl = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
  const model = import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat';

  return { apiKey, apiUrl, model };
};

// 定义改写模式的联合类型
export type ParaphraseMode = 'standard' | 'light' | 'deep' | 'academic';

const modePrompts: Record<ParaphraseMode, string> = {
  'standard': '保持专业术语不变，改变表达方式和句式结构',
  'light': '轻度调整语句顺序和词汇选择，保持原文风格',
  'deep': '大幅重构句子结构，使用更多同义词替换，显著���低重复率',
  'academic': '转换为更正式、更学术的语言风格'
};

// 分段信息接口
interface TextChunk {
  content: string;
  separator: string; // 记录原始分隔符
  index: number;
}

// 分段处理长文本，保留原始格式
const splitTextIntoChunks = (text: string, maxChunkSize: number = 2000): TextChunk[] => {
  const chunks: TextChunk[] = [];
  
  // 先按双换行分割，保留分隔符
  const parts = text.split(/(\n\n+)/);
  
  let currentChunk = '';
  let currentSeparators: string[] = [];
  let chunkIndex = 0;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    // 如果是分隔符，记录下来
    if (/^\n\n+$/.test(part)) {
      currentSeparators.push(part);
      continue;
    }
    
    // 如果是内容
    if (part) {
      // 检查是否需要新建chunk
      if (currentChunk && currentChunk.length + part.length > maxChunkSize) {
        // 保存当前chunk
        chunks.push({
          content: currentChunk,
          separator: currentSeparators.length > 0 ? currentSeparators[currentSeparators.length - 1] : '\n\n',
          index: chunkIndex++
        });
        currentChunk = part;
        currentSeparators = [];
      } else {
        // 添加到当前chunk
        if (currentChunk && currentSeparators.length > 0) {
          currentChunk += currentSeparators.join('');
          currentSeparators = [];
        }
        currentChunk += part;
      }
    }
  }
  
  // 添加最后一个chunk
  if (currentChunk) {
    chunks.push({
      content: currentChunk,
      separator: '', // 最后一个chunk没有后续分隔符
      index: chunkIndex
    });
  }
  
  return chunks;
};

export const paraphraseText = async (text: string, mode: ParaphraseMode = 'standard'): Promise<string> => {
  const { apiKey, apiUrl, model } = getApiConfig();

  if (!apiKey) {
    throw new Error("DeepSeek API Key 未配置。请在 .env 文件中设置 VITE_DEEPSEEK_API_KEY");
  }

  // 检查文本长度，如果太长则分段处理
  const MAX_CHUNK_SIZE = 2000; // 每段最多2000字符
  const needsSplit = text.length > MAX_CHUNK_SIZE;
  const chunks = needsSplit ? splitTextIntoChunks(text, MAX_CHUNK_SIZE) : [{ content: text, separator: '', index: 0 }];
  
  console.log(`文本长度: ${text.length}字符，分为${chunks.length}段处理`);

  const systemInstruction = modePrompts[mode];

  try {
    const paraphrasedChunks: Array<{ content: string; separator: string }> = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`正在处理第 ${i + 1}/${chunks.length} 段...`);

      const messages = [
        {
          role: "system",
          content: `你是一个专业的文本改写AI。${systemInstruction}。
重要：必须严格保持原文的段落结构和换行格式，不要合并或拆分段落。`
        },
        {
          role: "user",
          content: `请对以下文本进行改写${chunks.length > 1 ? `（这是第${i + 1}/${chunks.length}段）` : ''}：

【改写要求】：${systemInstruction}

【原文内容】：
${chunk.content}

【输出要求】：
- 只输出改写后的文本内容
- 不要添加任何解释或说明
- 不要使用markdown格式或代码块
- 直接输出纯净的改写文本
- 【重要】严格保持原文的段落结构，有几个段落就输出几个段落
- 【重要】保持原文的换行位置，不要随意添加或删除换行符
- 如果原文某处有空行，改写后也要保留空行`
        }
      ];

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: mode === 'light' ? 0.3 : 0.7,
          max_tokens: Math.min(chunk.content.length * 3, 8000), // 修复：更合理的token计算，中文约3倍，且不超过8000
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        console.error("DeepSeek API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url: apiUrl,
          model: model
        });
        throw new Error(`API请求失败: ${response.status} ${response.statusText}${errorData.message ? ' - ' + errorData.message : ''}`);
      }

      const result = await response.json();

      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        throw new Error("API返回格式异常");
      }

      let paraphrasedChunk = result.choices[0].message.content;

      if (!paraphrasedChunk) {
        throw new Error(`第${i + 1}段改写结果为空`);
      }

      // 只去除首尾的空白，但保留内部的换行符
      paraphrasedChunk = paraphrasedChunk.trim();

      paraphrasedChunks.push({
        content: paraphrasedChunk,
        separator: chunk.separator
      });

      // 如果有多段，添加短暂延迟避免API限流
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // 使用原始分隔符重新组装文本
    const finalResult = paraphrasedChunks
      .map((chunk, index) => chunk.content + chunk.separator)
      .join('');

    if (!finalResult || finalResult.length < text.length * 0.3) {
      throw new Error("改写结果异常，长度不足");
    }

    return finalResult;
  } catch (error) {
    console.error("DeepSeek Paraphrase Error:", error);
    if (error instanceof Error) {
      throw new Error(`文本改写失败: ${error.message}`);
    }
    throw new Error("文本改写失败，请稍后重试");
  }
};
