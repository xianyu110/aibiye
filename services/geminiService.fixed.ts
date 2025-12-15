import { GoogleGenerativeAI } from "@google/generative-ai";

// 定义改写模式类型
type ParaphraseMode = 'standard' | 'light' | 'deep' | 'academic';

const getClient = () => {
  const apiKey = import.meta.env.VITE_API_KEY; // 修复：使用 import.meta.env
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenerativeAI(apiKey); // 修复：正确的构造函数
};

export const paraphraseText = async (text: string, mode: ParaphraseMode = 'standard'): Promise<string> => {
  const ai = getClient();

  const modePrompts: Record<ParaphraseMode, string> = { // 修复：添加类型注解
    'standard': '保持专业术语不变，改变表达方式和句式结构',
    'light': '轻度调整语句顺序和词汇选择，保持原文风格',
    'deep': '大幅重构句子结构，使用更多同义词替换，显著降低重复率',
    'academic': '转换为更正式、更学术的语言风格'
  };

  const systemInstruction = modePrompts[mode];

  const prompt = `
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
  `;

  try {
    // 修复：正确的API调用方式
    const model = ai.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      systemInstruction: `你是一个专业的文本改写AI。${systemInstruction}。确保改写内容准确、自然，保持原意不变。`
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: mode === 'light' ? 0.3 : 0.7,
      }
    });

    // 修复：正确的响应处理
    const response = await result.response;
    const resultText = response.text().trim();

    if (!resultText || resultText.length < text.length * 0.5) {
      throw new Error("改写结果异常，请重试");
    }

    return resultText;
  } catch (error) {
    console.error("Gemini Paraphrase Error:", error);
    throw new Error("文本改写失败，请稍后重试");
  }
};
