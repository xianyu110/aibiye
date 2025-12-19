// 抄袭检测服务
// 使用本地算法和AI检测相结合的方式

interface PlagiarismCheckOptions {
  checkWeb?: boolean; // 是否检测网络内容
  checkAcademic?: boolean; // 是否检测学术数据库
  language?: 'zh' | 'en';
  sensitivity?: 'low' | 'medium' | 'high';
}

interface PlagiarismResult {
  overallScore: number; // 总体相似度 0-100
  sources: PlagiarismSource[];
  suspiciousPassages: SuspiciousPassage[];
  report: PlagiarismReport;
}

interface PlagiarismSource {
  id: string;
  title: string;
  url?: string;
  similarity: number;
  matchType: 'exact' | 'paraphrase' | 'partial';
}

interface SuspiciousPassage {
  text: string;
  startIndex: number;
  endIndex: number;
  similarity: number;
  possibleSources: string[];
}

interface PlagiarismReport {
  summary: string;
  recommendations: string[];
  originalityScore: number;
}

export class PlagiarismService {
  private static instance: PlagiarismService;

  static getInstance(): PlagiarismService {
    if (!this.instance) {
      this.instance = new PlagiarismService();
    }
    return this.instance;
  }

  // 执行抄袭检测
  async checkPlagiarism(
    text: string,
    options: PlagiarismCheckOptions = {}
  ): Promise<PlagiarismResult> {
    const {
      checkWeb = true,
      checkAcademic = false,
      language = 'zh',
      sensitivity = 'medium'
    } = options;

    console.log('开始抄袭检测...');

    // 1. 文本预处理
    const cleanText = this.preprocessText(text);

    // 2. 分段处理
    const passages = this.splitIntoPassages(cleanText);

    // 3. 并行检测
    const [webResults, localResults] = await Promise.all([
      checkWeb ? this.checkAgainstWeb(passages, language) : [],
      this.checkLocalSimilarity(passages, sensitivity)
    ]);

    // 4. 使用AI进行深度分析
    const aiAnalysis = await this.analyzeWithAI(cleanText, passages, language);

    // 5. 合并结果
    const result = this.mergeResults(webResults, localResults, aiAnalysis, text);

    console.log('抄袭检测完成，相似度:', result.overallScore + '%');

    return result;
  }

  // 文本预处理
  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\u4e00-\u9fa5\w\s]/g, ' ') // 保留中文、英文、数字和空格
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 将文本分成段落
  private splitIntoPassages(text: string): string[] {
    const sentences = text.split(/[。！？.!?]/);
    const passages: string[] = [];

    // 每段包含3-5个句子
    for (let i = 0; i < sentences.length; i += 4) {
      const passage = sentences.slice(i, i + 4).join('。');
      if (passage.trim()) {
        passages.push(passage);
      }
    }

    return passages;
  }

  // 本地相似度检测
  private async checkLocalSimilarity(
    passages: string[],
    sensitivity: 'low' | 'medium' | 'high'
  ): Promise<Array<{ passage: string; similarity: number; sources: string[] }>> {
    // 模拟本地数据库检测
    const results: Array<{ passage: string; similarity: number; sources: string[] }> = [];

    // 这里可以集成真实的数据库
    const mockDatabase = [
      { text: "这是一个示例文本，用于测试相似度检测", source: "示例文档1" },
      { text: "人工智能技术的发展日新月异", source: "技术报告" },
      // 更多模拟数据...
    ];

    for (const passage of passages) {
      for (const item of mockDatabase) {
        const similarity = this.calculateSimilarity(passage, item.text);
        const threshold = sensitivity === 'high' ? 70 : sensitivity === 'medium' ? 80 : 90;

        if (similarity > threshold) {
          results.push({
            passage,
            similarity,
            sources: [item.source]
          });
        }
      }
    }

    return results;
  }

  // 网络内容检测（模拟）
  private async checkAgainstWeb(
    passages: string[],
    language: string
  ): Promise<Array<{ passage: string; url: string; similarity: number }>> {
    // 这里应该调用真实的搜索引擎API或学术数据库
    // 为了演示，返回模拟结果
    return [
      {
        passage: passages[0],
        url: "https://example.com/article1",
        similarity: 75
      }
    ];
  }

  // 使用AI进行深度分析
  private async analyzeWithAI(
    text: string,
    passages: string[],
    language: string
  ): Promise<{ suspiciousPassages: SuspiciousPassage[]; originalityScore: number }> {
    const prompt = language === 'zh'
      ? `请分析以下文本的原创性，识别可能存在抄袭风险的段落：

        ${text.substring(0, 2000)}...

        请返回JSON格式的分析结果：
        {
          "suspiciousPassages": [
            {
              "text": "可疑段落原文",
              "startIndex": 0,
              "endIndex": 100,
              "similarity": 85,
              "possibleSources": ["可能的来源1", "可能的来源2"]
            }
          ],
          "originalityScore": 75
        }`
      : `Please analyze the originality of the following text and identify potentially plagiarized passages:

        ${text.substring(0, 2000)}...

        Return the analysis in JSON format:
        {
          "suspiciousPassages": [
            {
              "text": "Original suspicious passage",
              "startIndex": 0,
              "endIndex": 100,
              "similarity": 85,
              "possibleSources": ["Source 1", "Source 2"]
            }
          ],
          "originalityScore": 75
        }`;

    try {
      // 使用Gemini API进行分析
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const data = await response.json();
        return JSON.parse(data.response);
      }
    } catch (error) {
      console.error('AI分析失败:', error);
    }

    // 返回默认结果
    return {
      suspiciousPassages: [],
      originalityScore: 85
    };
  }

  // 计算文本相似度（使用Jaccard相似度）
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(' ').filter(w => w));
    const words2 = new Set(text2.split(' ').filter(w => w));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return union.size === 0 ? 0 : (intersection.size / union.size) * 100;
  }

  // 合并检测结果
  private mergeResults(
    webResults: any[],
    localResults: any[],
    aiAnalysis: any,
    originalText: string
  ): PlagiarismResult {
    const sources: PlagiarismSource[] = [];
    const suspiciousPassages: SuspiciousPassage[] = [];

    // 处理网络检测结果
    webResults.forEach(result => {
      sources.push({
        id: `web_${sources.length}`,
        title: result.url,
        url: result.url,
        similarity: result.similarity,
        matchType: result.similarity > 90 ? 'exact' : result.similarity > 70 ? 'paraphrase' : 'partial'
      });
    });

    // 处理本地检测结果
    localResults.forEach(result => {
      const startIndex = originalText.indexOf(result.passage);
      if (startIndex !== -1) {
        suspiciousPassages.push({
          text: result.passage,
          startIndex,
          endIndex: startIndex + result.passage.length,
          similarity: result.similarity,
          possibleSources: result.sources
        });
      }
    });

    // 添加AI分析结果
    suspiciousPassages.push(...aiAnalysis.suspiciousPassages);

    // 计算总体相似度
    const maxSimilarity = Math.max(
      ...sources.map(s => s.similarity),
      ...suspiciousPassages.map(p => p.similarity),
      0
    );

    const overallScore = Math.min(maxSimilarity, 100);

    // 生成报告
    const report = this.generateReport(overallScore, suspiciousPassages);

    return {
      overallScore,
      sources,
      suspiciousPassages,
      report
    };
  }

  // 生成检测报告
  private generateReport(overallScore: number, suspiciousPassages: SuspiciousPassage[]): PlagiarismReport {
    let summary = '';
    let recommendations: string[] = [];
    let originalityScore = 100 - overallScore;

    if (overallScore < 20) {
      summary = '文本原创性很高，未发现明显的抄袭风险。';
      recommendations = ['继续保持良好的原创写作习惯'];
    } else if (overallScore < 50) {
      summary = '文本存在部分相似内容，建议进行适当修改以提高原创性。';
      recommendations = [
        '对相似度较高的段落进行改写',
        '增加自己的观点和分析',
        '正确引用相似内容的来源'
      ];
    } else if (overallScore < 80) {
      summary = '文本与现有内容相似度较高，存在抄袭风险，需要大幅修改。';
      recommendations = [
        '重新组织句子结构',
        '使用不同的表达方式',
        '补充个人见解和实例',
        '确保所有引用都正确标注'
      ];
    } else {
      summary = '文本相似度过高，存在严重抄袭风险，强烈建议重写。';
      recommendations = [
        '完全重新撰写内容',
        '使用不同的论证角度',
        '增加独特的个人观点',
        '严格遵循学术规范'
      ];
    }

    return {
      summary,
      recommendations,
      originalityScore
    };
  }

  // 生成详细的抄袭检测报告
  generateDetailedReport(result: PlagiarismResult): string {
    let report = '# 文本原创性检测报告\n\n';
    report += `## 检测概要\n\n`;
    report += `- **总体相似度**: ${result.overallScore.toFixed(1)}%\n`;
    report += `- **原创性得分**: ${result.report.originalityScore.toFixed(1)}%\n`;
    report += `- **可疑段落数量**: ${result.suspiciousPassages.length}\n`;
    report += `- **匹配来源数量**: ${result.sources.length}\n\n`;

    report += `## 检测结果摘要\n\n${result.report.summary}\n\n`;

    if (result.report.recommendations.length > 0) {
      report += `## 改进建议\n\n`;
      result.report.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
      report += '\n';
    }

    if (result.suspiciousPassages.length > 0) {
      report += `## 可疑段落详情\n\n`;
      result.suspiciousPassages.forEach((passage, index) => {
        report += `### 片段 ${index + 1}\n\n`;
        report += `**相似度**: ${passage.similarity.toFixed(1)}%\n\n`;
        report += `**内容**: "${passage.text}"\n\n`;
        if (passage.possibleSources.length > 0) {
          report += `**可能来源**: ${passage.possibleSources.join(', ')}\n\n`;
        }
        report += '---\n\n';
      });
    }

    if (result.sources.length > 0) {
      report += `## 匹配来源\n\n`;
      result.sources.forEach(source => {
        report += `- **${source.title}**\n`;
        report += `  - 相似度: ${source.similarity.toFixed(1)}%\n`;
        report += `  - 匹配类型: ${source.matchType}\n`;
        if (source.url) {
          report += `  - 链接: ${source.url}\n`;
        }
        report += '\n';
      });
    }

    report += `\n---\n*报告生成时间: ${new Date().toLocaleString()}*`;

    return report;
  }
}