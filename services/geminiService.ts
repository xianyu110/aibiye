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

export const paraphraseText = async (text: string, mode: ParaphraseMode = 'standard'): Promise<string> => {
  const { apiKey, apiUrl, model } = getApiConfig();

  if (!apiKey) {
    throw new Error("DeepSeek API Key 未配置。请在 .env 文件中设置 VITE_DEEPSEEK_API_KEY");
  }

  const systemInstruction = modePrompts[mode];

  const messages = [
    {
      role: "system",
      content: `你是一个专业的文本改写AI。${systemInstruction}。确保改写内容准确、自然，保持原意不变。`
    },
    {
      role: "user",
      content: `
        你是一个专业的文本改写专家，擅长在保持原意不变的前提下，通过改变表达方式、句式结构和词汇选择来降低文本重复率。

        【改写要求】：${systemInstruction}
        【原文内容】：${text}

        请严格按照以下要求进行改写：
        1. 保持原文的核心信息和主要观点完全不变
        2. 保留所有专业术语、专有名词和数据
        3. 确保改写后的文本逻辑清晰、表达自然
        4. ${mode === 'academic' ? '使用更正式、更学术的表达方式' : '保持适当的语言风格'}
        5. ${mode === 'deep' ? '尽可能使用同义词替换和句式重构' : '适度调整，避免过度改写'}

        【输出要求】：
        - 只输出改写后的文本内容
        - 不要添加任何解释或说明
        - 不要使用markdown格式或代码块
        - 直接输出纯净的改写文本
      `
    }
  ];

  try {
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
        max_tokens: Math.max(text.length * 2, 1000),
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("DeepSeek API Error:", errorData);
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error("API返回格式异常");
    }

    const paraphrasedText = result.choices[0].message.content?.trim();

    if (!paraphrasedText || paraphrasedText.length < text.length * 0.5) {
      throw new Error("改写结果异常，请重试");
    }

    return paraphrasedText;
  } catch (error) {
    console.error("DeepSeek Paraphrase Error:", error);
    if (error instanceof Error) {
      throw new Error(`文本改写失败: ${error.message}`);
    }
    throw new Error("文本改写失败，请稍后重试");
  }
};
