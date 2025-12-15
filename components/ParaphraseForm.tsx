import React, { useState } from 'react';
import { Sparkles, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { ParaphraseMode } from '../services/geminiService';

interface ParaphraseFormProps {
  onParaphrase: (text: string, mode: ParaphraseMode) => void;
  isLoading: boolean;
}

export const ParaphraseForm: React.FC<ParaphraseFormProps> = ({ onParaphrase, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [paraphraseMode, setParaphraseMode] = useState<ParaphraseMode>('standard');

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
              placeholder="请输入需要降重的文本内容，支持中英文混合输入..."
              className="w-full h-64 p-4 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isLoading}
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
            <li>• 建议分段输入，每次处理1000-2000字符效果最佳</li>
            <li>• 深度改写模式重复率更低，但需要仔细核对内容</li>
            <li>• 改写后请务必检查专业术语和关键信息的准确性</li>
            <li>• 按 Ctrl+Enter 快速开始改写</li>
          </ul>
        </div>
      </div>
    </div>
  );
};