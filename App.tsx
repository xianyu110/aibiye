import React, { useState, useRef, useEffect } from 'react';
import { ParaphraseMode } from './services/geminiService';
import { ToastContainer } from './components/Toast';
import { DocumentUpload } from './components/DocumentUpload';
import { CompareView } from './components/CompareView';
import { BatchProcessor } from './components/BatchProcessor';
import { paraphraseText } from './services/geminiService';
import { ConfigService } from './services/configService';
import { PlagiarismService } from './services/plagiarismService';
import { downloadAsDocx } from './services/docxService';
import { Sparkles, RefreshCw, Copy, Download, ArrowLeftRight, ChevronDown, Shield, Zap, Target, FileText, Edit3, PenTool, Languages, CheckCircle, Feather, Hammer, GraduationCap, Eye, BarChart3, FolderOpen, Search, Loader2 } from 'lucide-react';

export default function App() {
  const [originalText, setOriginalText] = useState('');
  const [paraphrasedText, setParaphrasedText] = useState('');
  const [mode, setMode] = useState<ParaphraseMode>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputMethod, setInputMethod] = useState<'upload' | 'text'>('upload');
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'error' | 'success' | 'info' }>>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // 新功能状态
  const [currentTab, setCurrentTab] = useState<'single' | 'compare' | 'plagiarism' | 'batch'>('single');
  const [showCompare, setShowCompare] = useState(false);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<any>(null);
  const [similarity, setSimilarity] = useState<number | undefined>();

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

      // 计算相似度
      const similarity = calculateSimilarity(originalText, result);
      setSimilarity(similarity);

      addToast('文档改写成功！', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '改写失败，请重试';
      addToast(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // 计算文本相似度
  const calculateSimilarity = (text1: string, text2: string): number => {
    const words1 = new Set(text1.split(' ').filter(w => w));
    const words2 = new Set(text2.split(' ').filter(w => w));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return union.size === 0 ? 0 : (intersection.size / union.size) * 100;
  };

  // 检测抄袭
  const handleCheckPlagiarism = async () => {
    if (!paraphrasedText.trim()) {
      addToast('请先进行文本改写', 'error');
      return;
    }

    setIsCheckingPlagiarism(true);
    try {
      const plagiarismService = PlagiarismService.getInstance();
      const result = await plagiarismService.checkPlagiarism(paraphrasedText, {
        checkWeb: true,
        checkAcademic: false,
        language: 'zh',
        sensitivity: 'medium'
      });
      setPlagiarismResult(result);
      addToast('抄袭检��完成！', 'success');
    } catch (error) {
      addToast('抄袭检测失败，请重试', 'error');
    } finally {
      setIsCheckingPlagiarism(false);
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
    { value: 'standard' as ParaphraseMode, label: '标准改写', desc: '保持原意，适度改写', icon: CheckCircle },
    { value: 'light' as ParaphraseMode, label: '轻度改写', desc: '轻微调整，保留结构', icon: Feather },
    { value: 'deep' as ParaphraseMode, label: '深度改写', desc: '大幅改写，降重效果好', icon: Hammer },
    { value: 'academic' as ParaphraseMode, label: '学术风格', desc: '学术化表达', icon: GraduationCap }
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
      question: '【AI智能解析】支持哪些文档格式？',
      answer: '🚀 现已支持多种格式：\n• Word文档 (.doc/.docx) - 本地解析，安全隐私\n• PDF文档 (.pdf) - AI智能解析\n• 图片文档 (.jpg/.png/.bmp等) - OCR文字识别\n• Excel表格 (.xls/.xlsx) - AI提取数据\n• PowerPoint (.ppt/.pptx) - AI提取内容\n• 文本文档 (.txt) - 直接处理'
    },
    {
      question: '【文件限制】文档大小限制是多少？',
      answer: '不同格式的文件大小限制：\n• PDF/图片/Excel/PowerPoint：最大20MB\n• Word文档/文本文件：最大100MB\n• 如超过限制，建议将大文档分段处理或压缩后上传'
    },
    {
      question: '【解析能力】AI解析效果如何？',
      answer: '我们使用Gemini 3 Flash Preview AI模型进行文档解析：\n• 🔍 智能识别文档结构和格式\n• 📝 保持原文段落和章节层次\n• 🌐 支持中英文混合识别\n• 📊 表格数据智能提取\n• 🖼️ 图片OCR文字识别\n准确率高，大幅超越传统解析方法'
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
              <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <RefreshCw className="w-4 h-4" />
                <span>论文降重</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <Edit3 className="w-4 h-4" />
                <span>论文写作</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <PenTool className="w-4 h-4" />
                <span>作文写作</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <FileText className="w-4 h-4" />
                <span>长文写作</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <Languages className="w-4 h-4" />
                <span>英文翻译</span>
              </a>
            </nav>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">今日大纲: <span className="text-pink-600 font-semibold">17266</span></span>
            </div>
          </div>
        </div>
      </header>

      {/* 功能标签页 */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto py-0">
            <button
              onClick={() => setCurrentTab('single')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                currentTab === 'single'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Edit3 className="w-5 h-5" />
              <span className="font-medium">单篇改写</span>
            </button>
            <button
              onClick={() => setCurrentTab('compare')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                currentTab === 'compare'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span className="font-medium">对比视图</span>
            </button>
            <button
              onClick={() => setCurrentTab('plagiarism')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                currentTab === 'plagiarism'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="font-medium">抄袭检测</span>
            </button>
            <button
              onClick={() => setCurrentTab('batch')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                currentTab === 'batch'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FolderOpen className="w-5 h-5" />
              <span className="font-medium">批量处理</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Section - 只在单篇改写时显示 */}
      {currentTab === 'single' && (
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
      )}

      {/* Comparison Section - 只在单篇改写时显示 */}
      {currentTab === 'single' && (
        <section className="py-16 bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-4">
                轻松过最新知网AIGC检测
              </h2>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <img
                src="https://youke2.picui.cn/s1/2025/12/16/69416e104af28.png"
                alt="AIGC检测对比图"
                className="w-full rounded-xl"
              />
              <div className="text-center mt-6 text-sm text-gray-500">
                注意：数据均来自知网
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Editor Section - 只在单篇改写时显示 */}
      {currentTab === 'single' && (
        <section ref={editorRef} className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">开始智能降重</h2>
              <p className="text-gray-600">输入文本，选择模式，一键生成</p>
            </div>

            {/* Mode Selection */}
            <div className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {modes.map((m) => {
                  const IconComponent = m.icon;
                  return (
                    <button
                      key={m.value}
                      onClick={() => setMode(m.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        mode === m.value
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <IconComponent className={`w-5 h-5 ${
                          mode === m.value ? 'text-purple-600' : 'text-gray-600'
                        }`} />
                        <div className="font-semibold text-gray-900">{m.label}</div>
                      </div>
                      <div className="text-xs text-gray-500">{m.desc}</div>
                    </button>
                  );
                })}
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

            {/* 额外功能按钮 - 改写完成后显示 */}
            {paraphrasedText && (
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setShowCompare(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  <span>查看对比</span>
                </button>
                <button
                  onClick={handleCheckPlagiarism}
                  disabled={isCheckingPlagiarism}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isCheckingPlagiarism ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  <span>抄袭检测</span>
                </button>
                {similarity !== undefined && (
                  <div className="flex items-center space-x-2 px-4 py-3 bg-gray-100 rounded-lg">
                    <span className="text-sm text-gray-600">相似度:</span>
                    <span className="font-semibold text-purple-600">{similarity.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            )}

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
      )}

      {/* 对比视图弹窗 */}
      {showCompare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">文档对比</h2>
              <button
                onClick={() => setShowCompare(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <CompareView
                originalText={originalText}
                paraphrasedText={paraphrasedText}
                similarity={similarity}
              />
            </div>
          </div>
        </div>
      )}

      {/* 其他标签页内容 */}
      {currentTab !== 'single' && (
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            {/* 对比视图标签页 */}
            {currentTab === 'compare' && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">文档对比视图</h2>
                  <p className="text-gray-600">对比原文和改写后的内容，查看修改差异</p>
                </div>
                {originalText && paraphrasedText ? (
                  <CompareView
                    originalText={originalText}
                    paraphrasedText={paraphrasedText}
                    similarity={similarity}
                  />
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <FileText className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">请先在"单篇改写"页面完成文本改写</p>
                  </div>
                )}
              </div>
            )}

            {/* 抄袭检测标签页 */}
            {currentTab === 'plagiarism' && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">抄袭检测</h2>
                  <p className="text-gray-600">检测文本的原创性，确保内容安全</p>
                </div>
                {paraphrasedText ? (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">检测文本预览</h3>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {paraphrasedText.substring(0, 1000)}...
                        </p>
                      </div>
                      <button
                        onClick={handleCheckPlagiarism}
                        disabled={isCheckingPlagiarism}
                        className="mt-4 w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {isCheckingPlagiarism ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>检测中...</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-5 h-5" />
                            <span>开始检测</span>
                          </>
                        )}
                      </button>
                    </div>

                    {plagiarismResult && (
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">检测结果</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-500">相似度</p>
                              <p className="text-2xl font-bold text-orange-600">
                                {plagiarismResult.overallScore.toFixed(1)}%
                              </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-500">原创性得分</p>
                              <p className="text-2xl font-bold text-green-600">
                                {plagiarismResult.report.originalityScore.toFixed(1)}%
                              </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-500">匹配来源</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {plagiarismResult.sources.length}
                              </p>
                            </div>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="font-semibold text-blue-900 mb-2">检测摘要</p>
                            <p className="text-sm text-blue-800">{plagiarismResult.report.summary}</p>
                          </div>
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <p className="font-semibold text-yellow-900 mb-2">改进建议</p>
                            <ul className="text-sm text-yellow-800 space-y-1">
                              {plagiarismResult.report.recommendations.map((rec: string, index: number) => (
                                <li key={index} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <Search className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">请先在"单篇改写"页面完成文本改写</p>
                  </div>
                )}
              </div>
            )}

            {/* 批量处理标签页 */}
            {currentTab === 'batch' && (
              <BatchProcessor
                onBatchComplete={(results) => {
                  addToast(`成功处理 ${results.length} 个文件`, 'success');
                }}
              />
            )}
          </div>
        </main>
      )}

      {/* FAQ Section - 只在单篇改写时显示 */}
      {currentTab === 'single' && (
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
      )}

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
