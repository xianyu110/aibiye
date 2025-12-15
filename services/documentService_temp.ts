// 处理Word文档
  private static async processWordFile(file: File): Promise<string> {
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

      // 保留段落结构但清理多余空格
      text = text.replace(/ +/g, ' ');
      text = text.replace(/\n +/g, '\n');

      // 清理文档开头和结尾的空白
      text = text.trim();

      // 如果提取的文本为空或太短，可能是文档损坏或格式问题
      if (text.length < 10) {
        throw new Error('文档内容提取失败或文档为空，请检查文档是否损坏');
      }

      return text;
    } catch (error) {
      console.error('Word文档解析失败:', error);
      if (error instanceof Error) {
        throw new Error(`Word文档解析失败: ${error.message}`);
      }
      throw new Error('Word文档解析失败: 未知错误，请确保文档格式正确');
    }
  }