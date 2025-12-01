import { GoogleGenAI } from "@google/genai";
import { PaperParams } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateThesisContent = async (params: PaperParams): Promise<string> => {
  const ai = getClient();
  
  const prompt = `
    你是一位经验丰富的学术论文指导教授，擅长指导学生撰写高水平的中文学术论文。
    请根据以下输入信息，为学生生成一份详细的论文大纲和部分初稿。
    
    【论文题目】：${params.topic}
    【所属专业】：${params.subjectArea}
    【关键词】：${params.keywords}
    【学历层次】：${params.degree}
    【文档类型】：${params.type}
    
    请严格按照以下结构输出内容（必须是标准的 Markdown 格式）：

    # ${params.topic}

    ## 摘要 (Abstract)
    （此处撰写中文摘要，约 200-300 字，概括研究背景、目的、方法、主要结果和结论。）
    
    **Abstract:**
    (Generate the corresponding English Abstract here.)

    ## 关键词 (Keywords)
    ${params.keywords}；(English Keywords)

    ## 论文大纲 (Outline)
    （请生成详细的三级提纲，例如：第一章、1.1、1.1.1。确保逻辑严密，章节安排合理。）

    ## 第一章：绪论 (Introduction Draft)
    （基于大纲，撰写第一章“绪论”的完整草稿，约 600 字。包含研究背景、研究意义、国内外研究现状综述。请使用**加粗**标记核心概念。）

    ## 主要参考文献 (References)
    （列出 10-15 篇与该主题高度相关的参考文献，包含中文和英文文献。格式必须严格遵循 GB/T 7714-2015 标准。）

    【严格限制】：
    1.  **只输出 Markdown 内容**，不要包含任何开场白（如“好的，这是您的论文...”）或结束语。
    2.  学术语言必须严谨、客观、规范，符合${params.degree}水平。
    3.  不要使用代码块（\`\`\`markdown）包裹内容，直接输出纯文本。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "你是一个专业的学术写作辅助AI。你的输出必须是纯净的Markdown格式，专注于学术内容的生成，语气庄重，逻辑清晰。",
        temperature: 0.7, 
      }
    });

    return response.text || "内容生成失败，请稍后重试。";
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("AI 服务连接超时，请检查网络设置或稍后重试。");
  }
};