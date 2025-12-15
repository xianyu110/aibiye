import React, { useState } from 'react';
import { CheckCircle, Copy, Download, RefreshCw, ArrowLeft, Sparkles, Eye, EyeOff, FileDiff, FileText } from 'lucide-react';
import { ParaphraseMode } from '../types';
import { downloadAsDocx } from '../services/docxService';

interface ResultViewProps {
  originalText: string;
  paraphrasedText: string;
  onReset: () => void;
  onReparaphrase: (text: string, mode: ParaphraseMode) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ originalText, paraphrasedText, onReset, onReparaphrase }) => {
  const [viewMode, setViewMode] = useState<'result' | 'comparison'>('result');
  const [showOriginal, setShowOriginal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    alert(message);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([paraphrasedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `改写结果_${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadDocx = async () => {
    try {
      setIsDownloading(true);
      const filename = `改写结果_${new Date().getTime()}.docx`;
      await downloadAsDocx(paraphrasedText, filename);
      alert('Word文档已下载！');
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  const calculateSimilarity = () => {
    if (!originalText || !paraphrasedText) return 0;

    const originalWords = originalText.toLowerCase().split(/\s+/);
    const paraphrasedWords = paraphrasedText.toLowerCase().split(/\s+/);

    const originalSet = new Set(originalWords);
    const paraphrasedSet = new Set(paraphrasedWords);

    const intersection = new Set([...originalSet].filter(x => paraphrasedSet.has(x)));
    const union = new Set([...originalSet, ...paraphrasedSet]);

    const similarity = intersection.size / union.size;
    return Math.round((1 - similarity) * 100);
  };

  const improvementPercentage = calculateSimilarity();

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onReset}
              className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回改写
            </button>

            <div className="flex items-center space-x-2">
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                降重率: {improvementPercentage}%
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              改写完成
            </h1>
            <p className="text-slate-600 text-lg">
              您的文本已成功改写，有效降低了重复率
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white shadow-sm">
            <button
              onClick={() => setViewMode('result')}
              className={`px-6 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                viewMode === 'result'
                  ? 'bg-green-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              改写结果
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-6 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                viewMode === 'comparison'
                  ? 'bg-green-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileDiff className="w-4 h-4 inline mr-1" />
              对比视图
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => onReparaphrase(originalText, 'standard')}
            className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            重新改写
          </button>

          <button
            onClick={() => handleCopy(paraphrasedText, '改写结果已复制到剪贴板！')}
            className="flex items-center space-x-2 px-6 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            <Copy className="w-5 h-5" />
            复制结果
          </button>

          <button
            onClick={handleDownloadDocx}
            disabled={isDownloading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                下载Word
              </>
            )}
          </button>

          <button
            onClick={handleDownloadTxt}
            className="flex items-center space-x-2 px-6 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            <Download className="w-5 h-5" />
            下载TXT
          </button>
        </div>

        {/* Content Display */}
        {viewMode === 'result' ? (
          /* Result View */
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">改写结果</h3>
              <p className="text-sm text-slate-600 mt-1">
                以下是根据您的要求优化后的文本内容
              </p>
            </div>
            <div className="p-8">
              <div className="prose max-w-none">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {paraphrasedText}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Comparison View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Text */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">原始文本</h3>
                <p className="text-sm text-slate-600 mt-1">您输入的原文内容</p>
              </div>
              <div className="p-8">
                <div className="prose max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                    {originalText}
                  </p>
                </div>
              </div>
            </div>

            {/* Paraphrased Text */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">改写结果</h3>
                <p className="text-sm text-slate-600 mt-1">优化后的文本内容</p>
              </div>
              <div className="p-8">
                <div className="prose max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {paraphrasedText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <h4 className="text-sm font-medium text-slate-600 mb-2">原文长度</h4>
            <p className="text-2xl font-bold text-slate-900">{originalText.length} 字符</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <h4 className="text-sm font-medium text-slate-600 mb-2">改写后长度</h4>
            <p className="text-2xl font-bold text-slate-900">{paraphrasedText.length} 字符</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <h4 className="text-sm font-medium text-slate-600 mb-2">预估降重率</h4>
            <p className="text-2xl font-bold text-green-600">{improvementPercentage}%</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h4 className="font-semibold text-amber-900 mb-2">⚠️ 重要提示</h4>
          <ul className="space-y-1 text-sm text-amber-800">
            <li>• AI改写结果可能存在细微差异，请仔细核对重要信息</li>
            <li>• 专业的术语和概念可能需要人工调整以确保准确性</li>
            <li>• 建议多次改写以获得最佳效果</li>
            <li>• 本工具仅用于学术辅助，请遵守学术诚信规范</li>
          </ul>
        </div>
      </div>
    </div>
  );
};