import React, { useState, useRef } from 'react';
import { Sparkles, RefreshCw, CheckCircle, AlertCircle, Upload, FileText, X } from 'lucide-react';
import { ParaphraseMode } from '../services/geminiService';
import { extractTextFromDocx, isDocxFile, formatFileSize } from '../services/docxService';

interface ParaphraseFormProps {
  onParaphrase: (text: string, mode: ParaphraseMode) => void;
  isLoading: boolean;
}

export const ParaphraseForm: React.FC<ParaphraseFormProps> = ({ onParaphrase, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [paraphraseMode, setParaphraseMode] = useState<ParaphraseMode>('standard');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modes = [
    { id: 'standard' as ParaphraseMode, name: '标准改写', description: '保持专业术语，改变表达方式', icon: '📝' },
    { id: 'light' as ParaphraseMode, name: '轻度改写', description: '小幅调整语句结构', icon: '🌱' },
    { id: 'deep' as ParaphraseMode, name: '深度改写', description: '大幅重构句子，降低重复率', icon: '🔄' },
    { id: 'academic' as ParaphraseMode, name: '学术风格', description: '转换为学术语言风格', icon: '🎓' }
  ];

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  const handleParaphrase = () => {
    if (!inputText.trim()) {
      return;
    }
    onParaphrase(inputText, paraphraseMode);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleParaphrase();
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!isDocxFile(file)) {
      alert('请上传.docx格式的Word文档');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB限制
      alert('文件大小不能超过10MB');
      return;
    }

    setUploadedFile(file);
    setIsExtracting(true);

    try {
      const text = await extractTextFromDocx(file);
      setInputText(text);
      alert(`成功提取${text.length}个字符`);
    } catch (error) {
      console.error('文件解析失败:', error);
      alert('文件解析失败，请确保文件格式正确');
      setUploadedFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearFile = () => {
    setUploadedFile(null);
    setInputText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            智能文本降重工具
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            采用先进的AI技术，智能改写文本内容，有效降低重复率
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">选择改写模式</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modes.map((mode) => (
              <div
                key={mode.id}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paraphraseMode === mode.id
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
                onClick={() => setParaphraseMode(mode.id)}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{mode.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 mb-1">{mode.name}</h4>
                    <p className="text-sm text-slate-600">{mode.description}</p>
                  </div>
                </div>
                {paraphraseMode === mode.id && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* File Upload Area */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">上传文档（可选）</h3>
          
          {uploadedFile ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-slate-800">{uploadedFile.name}</p>
                  <p className="text-sm text-slate-600">{formatFileSize(uploadedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">
                {isExtracting ? '正在解析文档...' : '点击上传或拖拽Word文档到此处'}
              </p>
              <p className="text-sm text-slate-500">
                支持.docx格式，最大10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isLoading || isExtracting}
              />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">输入文本</h3>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span>字符数: {charCount}</span>
              <span>词数: {wordCount}</span>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入需要降重的文本内容，或上传Word文档自动提取..."
              className="w-full h-64 p-4 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isLoading || isExtracting}
            />

            {charCount > 5000 && (
              <div className="absolute top-2 right-2 flex items-center text-amber-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                建议分段处理，效果更佳
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={handleParaphrase}
            disabled={isLoading || !inputText.trim()}
            className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>改写中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>开始改写</span>
              </>
            )}
          </button>

          <button
            onClick={() => setInputText('')}
            disabled={isLoading}
            className="px-8 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:cursor-not-allowed transition-all"
          >
            清空内容
          </button>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 使用技巧</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• 支持上传Word文档（.docx格式），自动提取文本</li>
            <li>• 建议分段输入，每次处理1000-2000字符效果最佳</li>
            <li>• 深度改写模式重复率更低，但需要仔细核对内容</li>
            <li>• 改写后可下载为Word文档或纯文本格式</li>
            <li>• 按 Ctrl+Enter 快速开始改写</li>
          </ul>
        </div>
      </div>
    </div>
  );
};