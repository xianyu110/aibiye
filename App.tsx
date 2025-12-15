import React, { useState, useRef, useEffect } from 'react';
import { ParaphraseMode } from './services/geminiService';
import { ToastContainer } from './components/Toast';
import { DocumentUpload } from './components/DocumentUpload';
import { paraphraseText } from './services/geminiService';
import { ConfigService } from './services/configService';
import { Sparkles, RefreshCw, Copy, Download, ArrowLeftRight, ChevronDown, Shield, Zap, Target, FileText } from 'lucide-react';

export default function App() {
  const [originalText, setOriginalText] = useState('');
  const [paraphrasedText, setParaphrasedText] = useState('');
  const [mode, setMode] = useState<ParaphraseMode>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputMethod, setInputMethod] = useState<'upload' | 'text'>('upload');
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'error' | 'success' | 'info' }>>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // 在组件挂载时初始化配置
  useEffect(() => {
    ConfigService.initializeApp().then(validation => {
      if (!validation.valid) {
        validation.errors.forEach(error => {
          console.error('配置错误:', error);
        });
      }
    });
  }, []);

  const addToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const scrollToEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGenerate = async () => {
    if (!originalText.trim()) {
      addToast(inputMethod === 'upload' ? '请先上传文档并提取文本' : '请输入需要改写的文本', 'error');
      return;
    }

    setIsGenerating(true);

    try {
      const result = await paraphraseText(originalText, mode);
      setParaphrasedText(result);
      addToast('文档改写成功！', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '改写失败，请重试';
      addToast(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast('已复制到剪贴板', 'success');
    } catch {
      addToast('复制失败', 'error');
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([paraphrasedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `改写结果_${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getCharCount = (text: string) => {
    return text.length;
  };

  const handleTextExtracted = (text: string, metadata?: { fileName: string; fileSize: number; fileType: string }) => {
    setOriginalText(text);
    if (text && metadata) {
      addToast(`从 ${metadata.fileName} 提取文本成功！`, 'success');
    } else if (text) {
      addToast('文档文本提取成功！', 'success');
    }
  };

  const modes = [
    { value: 'standard' as ParaphraseMode, label: '标准改写', desc: '保持原意，适度改写' },
    { value: 'light' as ParaphraseMode, label: '轻度改写', desc: '轻微调整，保留结构' },
    { value: 'deep' as ParaphraseMode, label: '深度改写', desc: '大幅改写，降重效果好' },
    { value: 'academic' as ParaphraseMode, label: '学术风格', desc: '学术化表达' }
  ];

  const faqs = [
    {
      question: '【安全护航】值得信任',
      answer: '我们采用HTTPS加密传输，确保您的文档数据安全。所有文档在处理后会自动删除，不会保存任何用户数据。符合GDPR及学术伦理规范。'
    },
    {
      question: '【隐私保障】查重后会收录我的论文吗？',
      answer: '不会。我们承诺不收录任何用户提交的文档。您的论文仅用于本次降重处理，处理完成后立即从服务器删除，绝不会被收录到任何数据库中。'
    },
    {
      question: '【流程收费】这个服务怎么计费的？',
      answer: '目前提供免费试用额度，每日可免费处理一定字数。如需更多额度，可选择按字数付费或订阅套餐。具体价格请查看价格页面。'
    },
    {
      question: '【大文件处理】文档超过20MB怎么办？',
      answer: '建议将大文档分段处理，每次处理1000-3000字符效果最佳。您也可以将文档拆分成多个部分分别上传处理。'
    },
    {
      question: '【多样方式】无法上传论文？',
      answer: '支持多种提交方式：直接粘贴文本、上传Word(doc/docx)、PDF、TXT、图片、Excel、PPT等多种格式文件。如遇到上传问题，请检查文件格式和大小，或尝试直接粘贴文本内容。'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MaynorAI论文</h1>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-600 hover:text-gray-900">论文降重</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">论文写作</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">作文写作</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">长文写作</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">英文翻译</a>
            </nav>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">今日大纲: <span className="text-pink-600 font-semibold">17266</span></span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-white rounded-full text-sm text-gray-700 shadow-sm">
              最新AI论文强力降重AIGC率！一键降低安全性能！
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              强力降论文AIGC痕迹|查重率
            </span>
            <br />
            <span className="text-gray-900">疑似度降低 60%</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            一键降低 论文aigc率 ai痕迹 查重率
          </p>
          <div className="flex justify-center space-x-4 mb-12">
            <button 
              onClick={scrollToEditor}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              立即降AIGC率
            </button>
            <button 
              onClick={scrollToEditor}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              立即降查重率
            </button>
          </div>
          <div className="text-sm text-gray-600 mb-8">
            适用于主流查重AIGC平台（实时更新）：
            <span className="ml-2 text-gray-800">知网 维普 万方检测</span>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">安全可靠</h3>
              <p className="text-sm text-gray-600">HTTPS加密传输，数据不留存，符合学术规范</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">快速高效</h3>
              <p className="text-sm text-gray-600">AI智能改写，秒级响应，大幅提升工作效率</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">精准降重</h3>
              <p className="text-sm text-gray-600">保持原意，有效降低重复率和AIGC检测率</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-4">
              轻松过最新知网AIGC检测
            </h2>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <img 
              src="https://qn1.meibp.com/paper/img/aigc2.png?10" 
              alt="AIGC检测对比图" 
              className="w-full rounded-xl"
            />
            <div className="text-center mt-6 text-sm text-gray-500">
              注意：数据均来自知网
            </div>
          </div>
        </div>
      </section>

      {/* Editor Section */}
      <section ref={editorRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">开始智能降重</h2>
            <p className="text-gray-600">输入文本，选择模式，一键生成</p>
          </div>

          {/* Mode Selection */}
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {modes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    mode === m.value
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1">{m.label}</div>
                  <div className="text-xs text-gray-500">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Input Method Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setInputMethod('upload')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  inputMethod === 'upload'
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>文档上传</span>
              </button>
              <button
                onClick={() => setInputMethod('text')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  inputMethod === 'text'
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>文本输入</span>
              </button>
            </div>
          </div>

          {/* Text Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Area */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    {inputMethod === 'upload' ? '文档内容' : '原文输入'}
                  </span>
                  <span className="text-xs text-gray-500">{getCharCount(originalText)} 字符</span>
                </div>
              </div>
              <div className="h-[400px]">
                {inputMethod === 'upload' ? (
                  <div className="p-5 h-full">
                    <DocumentUpload
                      onTextExtracted={handleTextExtracted}
                      isLoading={isGenerating}
                    />
                  </div>
                ) : (
                  <textarea
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    placeholder="请在此输入需要降重的文本内容...&#10;&#10;支持中英文混合输入，建议每次输入1000-3000字符以获得最佳效果。"
                    className="w-full p-5 h-full resize-none focus:outline-none text-gray-800 text-sm leading-relaxed"
                  />
                )}
              </div>
            </div>

            {/* Output Area */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">改写结果</span>
                  {paraphrasedText && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{getCharCount(paraphrasedText)} 字符</span>
                      <button
                        onClick={() => handleCopy(paraphrasedText)}
                        className="p-1.5 hover:bg-white rounded-lg transition-colors"
                        title="复制"
                      >
                        <Copy className="w-4 h-4 text-purple-600" />
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-1.5 hover:bg-white rounded-lg transition-colors"
                        title="下载"
                      >
                        <Download className="w-4 h-4 text-purple-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 h-[400px] overflow-y-auto custom-scrollbar">
                {paraphrasedText ? (
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{paraphrasedText}</p>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-sm">改写结果将在这里显示</p>
                      <p className="text-xs mt-2">请输入原文后点击"开始改写"按钮</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !originalText.trim()}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center space-x-3"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>改写中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>开始AIGC降重</span>
                </>
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h4 className="font-semibold text-blue-900 mb-3">说明：</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>1、本站降重和降aigc适用于主流查重平台；</p>
              <p>2、直接上传原文件效果最佳；</p>
              <p>3、支持中文、英语、日语、韩语、俄语等语言；</p>
              <p>4、安全保障：HTTPS加密传输，检测记录不留存，符合GDPR及学术伦理规范；</p>
              <p>5、任何问题可以点这里一联系客服；</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">常见问题</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === index ? 'transform rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm">
          <p className="mb-2">本网站设计及功能受版权保护，任何公司及个人不得复制及用于商业用途，违者将追究法律责任。</p>
          <p>©2018-2025 https://link3.cc/maynorai All rights reserved.</p>
        </div>
      </footer>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
