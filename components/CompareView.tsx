import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, FileText, CheckCircle } from 'lucide-react';

interface TextSegment {
  text: string;
  type: 'unchanged' | 'added' | 'removed' | 'modified';
}

interface CompareViewProps {
  originalText: string;
  paraphrasedText: string;
  similarity?: number;
  className?: string;
}

export const CompareView: React.FC<CompareViewProps> = ({
  originalText,
  paraphrasedText,
  similarity,
  className = ''
}) => {
  const [showStats, setShowStats] = useState(true);
  const [currentView, setCurrentView] = useState<'split' | 'unified'>('split');

  // 计算文本差异（使用简单的基于行的对比算法）
  const textSegments = useMemo(() => {
    const originalLines = originalText.split('\n');
    const paraphrasedLines = paraphrasedText.split('\n');
    const segments: TextSegment[] = [];

    // 使用 LCS (最长公共子序列) 算法找出相同的行
    const lcs = longestCommonSubsequence(originalLines, paraphrasedLines);

    let i = 0, j = 0;
    while (i < originalLines.length || j < paraphrasedLines.length) {
      if (i < originalLines.length && j < paraphrasedLines.length && originalLines[i] === paraphrasedLines[j]) {
        segments.push({ text: originalLines[i], type: 'unchanged' });
        i++;
        j++;
      } else {
        // 找到下一个匹配点
        let nextMatch = -1;
        for (let k = j; k < paraphrasedLines.length; k++) {
          if (originalLines[i] === paraphrasedLines[k]) {
            nextMatch = k;
            break;
          }
        }

        if (nextMatch !== -1) {
          // 添加被改写的行
          while (j < nextMatch) {
            segments.push({ text: paraphrasedLines[j], type: 'added' });
            j++;
          }
        } else if (i < originalLines.length) {
          // 原始行被删除
          segments.push({ text: originalLines[i], type: 'removed' });
          i++;
        } else {
          // 添加的新行
          segments.push({ text: paraphrasedLines[j], type: 'added' });
          j++;
        }
      }
    }

    return segments;
  }, [originalText, paraphrasedText]);

  // 计算统计信息
  const stats = useMemo(() => {
    const originalLength = originalText.length;
    const paraphrasedLength = paraphrasedText.length;
    const addedLength = textSegments.filter(s => s.type === 'added').reduce((sum, s) => sum + s.text.length, 0);
    const removedLength = textSegments.filter(s => s.type === 'removed').reduce((sum, s) => sum + s.text.length, 0);
    const modifiedLength = textSegments.filter(s => s.type === 'modified').reduce((sum, s) => sum + s.text.length, 0);
    const unchangedLength = textSegments.filter(s => s.type === 'unchanged').reduce((sum, s) => sum + s.text.length, 0);

    const changeRate = originalLength > 0 ? ((addedLength + removedLength + modifiedLength) / originalLength * 100) : 0;
    const compressionRate = originalLength > 0 ? ((originalLength - paraphrasedLength) / originalLength * 100) : 0;

    return {
      originalLength,
      paraphrasedLength,
      addedLength,
      removedLength,
      modifiedLength,
      unchangedLength,
      changeRate,
      compressionRate
    };
  }, [originalText, paraphrasedText, textSegments]);

  return (
    <div className={`compare-view ${className}`}>
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            文档对比
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('split')}
              className={`px-3 py-1 rounded text-sm ${
                currentView === 'split'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              左右对比
            </button>
            <button
              onClick={() => setCurrentView('unified')}
              className={`px-3 py-1 rounded text-sm ${
                currentView === 'unified'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              统一视图
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showStats ? '隐藏' : '显示'}统计</span>
        </button>
      </div>

      {/* 统计信息 */}
      {showStats && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-3">对比统计</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded">
              <p className="text-xs text-gray-500">原文长度</p>
              <p className="text-lg font-semibold">{stats.originalLength.toLocaleString()} 字符</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="text-xs text-gray-500">改写长度</p>
              <p className="text-lg font-semibold">{stats.paraphrasedLength.toLocaleString()} 字符</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="text-xs text-gray-500">修改率</p>
              <p className="text-lg font-semibold text-orange-600">{stats.changeRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="text-xs text-gray-500">压缩率</p>
              <p className="text-lg font-semibold text-blue-600">{stats.compressionRate.toFixed(1)}%</p>
            </div>
          </div>
          {similarity !== undefined && (
            <div className="mt-3 bg-white p-3 rounded">
              <p className="text-xs text-gray-500">相似度</p>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${similarity}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{similarity.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 对比视图 */}
      <div className="compare-container border rounded-lg overflow-hidden">
        {currentView === 'split' ? (
          <div className="flex h-full">
            {/* 原文 */}
            <div className="w-1/2 border-r">
              <div className="bg-gray-100 px-4 py-2 border-b">
                <h4 className="font-semibold text-gray-700">原文</h4>
              </div>
              <div className="p-4 overflow-auto h-96 whitespace-pre-wrap text-sm">
                {originalText}
              </div>
            </div>
            {/* 改写文 */}
            <div className="w-1/2">
              <div className="bg-gray-100 px-4 py-2 border-b">
                <h4 className="font-semibold text-gray-700">改写文</h4>
              </div>
              <div className="p-4 overflow-auto h-96 whitespace-pre-wrap text-sm">
                {paraphrasedText}
              </div>
            </div>
          </div>
        ) : (
          <div className="unified-view p-4 overflow-auto h-96">
            {textSegments.map((segment, index) => (
              <div
                key={index}
                className={`segment ${
                  segment.type === 'added'
                    ? 'bg-green-100 border-l-4 border-green-500 pl-4'
                    : segment.type === 'removed'
                    ? 'bg-red-100 border-l-4 border-red-500 pl-4 line-through'
                    : segment.type === 'modified'
                    ? 'bg-yellow-100 border-l-4 border-yellow-500 pl-4'
                    : 'pl-4'
                }`}
              >
                <pre className="whitespace-pre-wrap text-sm font-mono">{segment.text}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// LCS 算法实现
function longestCommonSubsequence(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}