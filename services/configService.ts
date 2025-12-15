// 配置服务
import { GeminiDocumentService } from './geminiDocumentService';

interface AppConfig {
  deepseek: {
    apiKey: string;
    apiUrl: string;
    model: string;
  };
  gemini: {
    apiKey: string;
    apiUrl: string;
    model: string;
    enabled: boolean;
  };
}

export class ConfigService {
  private static config: AppConfig = {
    deepseek: {
      apiKey: '',
      apiUrl: 'https://api.deepseek.com/v1/chat/completions',
      model: 'deepseek-chat'
    },
    gemini: {
      apiKey: '',
      apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-2.0-flash',
      enabled: true
    }
  };

  // 初始化配置
  static initialize() {
    // 从环境变量读取配置
    this.config.deepseek.apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
    this.config.deepseek.apiUrl = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    this.config.deepseek.model = import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat';

    this.config.gemini.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.config.gemini.apiUrl = import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';
    this.config.gemini.model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
    this.config.gemini.enabled = import.meta.env.VITE_ENABLE_GEMINI_DOCUMENT_PROCESSING !== 'false';

    // 初始化Gemini服务
    if (this.config.gemini.enabled && this.config.gemini.apiKey) {
      GeminiDocumentService.initialize({
        apiKey: this.config.gemini.apiKey,
        apiUrl: this.config.gemini.apiUrl,
        model: this.config.gemini.model
      });
    }
  }

  // 获取DeepSeek配置
  static getDeepSeekConfig() {
    return { ...this.config.deepseek };
  }

  // 获取Gemini配置
  static getGeminiConfig() {
    return { ...this.config.gemini };
  }

  // 检查DeepSeek是否配置
  static isDeepSeekConfigured(): boolean {
    return !!this.config.deepseek.apiKey;
  }

  // 检查Gemini是否配置
  static isGeminiConfigured(): boolean {
    return this.config.gemini.enabled && !!this.config.gemini.apiKey;
  }

  // 检查是否可以使用Gemini进行文档处理
  static canUseGeminiForDocuments(): boolean {
    return this.isGeminiConfigured() && this.config.gemini.enabled;
  }

  // 获取所有配置状态
  static getConfigStatus() {
    return {
      deepseek: {
        configured: this.isDeepSeekConfigured(),
        apiKey: this.config.deepseek.apiKey ? '***已配置***' : '未配置',
        model: this.config.deepseek.model
      },
      gemini: {
        configured: this.isGeminiConfigured(),
        enabled: this.config.gemini.enabled,
        apiKey: this.config.gemini.apiKey ? '***已配置***' : '未配置',
        model: this.config.gemini.model
      }
    };
  }

  // 验证配置
  static validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.deepseek.apiKey) {
      errors.push('DeepSeek API Key未配置');
    }

    if (this.config.gemini.enabled && !this.config.gemini.apiKey) {
      console.warn('Gemini API Key未配置，将使用原生文档处理方法');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 在应用启动时调用
  static async initializeApp() {
    this.initialize();

    const validation = this.validateConfig();
    if (!validation.valid) {
      console.error('配置验证失败:', validation.errors);
    }

    if (this.isGeminiConfigured()) {
      console.log('✅ Gemini文档解析服务已启用');
    } else {
      console.log('⚠️ Gemini文档解析服务未配置，将使用原生处理方法');
    }

    if (this.isDeepSeekConfigured()) {
      console.log('✅ DeepSeek API已配置');
    } else {
      console.error('❌ DeepSeek API Key未配置，请检查环境变量');
    }

    return validation;
  }
}