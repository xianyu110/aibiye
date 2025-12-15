import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

export const LoadingView: React.FC = () => {
  const loadingMessages = [
    "分析原文结构...",
    "智能识别专业术语...",
    "生成同义词库...",
    "重构语句表达...",
    "优化语言风格...",
    "完成文本改写..."
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <RefreshCw className="w-10 h-10 text-green-600 animate-spin" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            正在智能改写文本
          </h2>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-green-500" />
            <span className="text-green-600 font-medium">AI处理中</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full animate-pulse"
                     style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>

          <p className="text-slate-600 text-sm">
            {loadingMessages[currentMessageIndex]}
          </p>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>请稍候，AI正在为您优化文本内容...</p>
          <p className="mt-2">预计需要 10-30 秒</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 text-left">
          <div className="flex items-center space-x-3 text-sm text-slate-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>保持原文核心含义不变</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-slate-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>保留专业术语和专有名词</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-slate-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>确保文本逻辑清晰通顺</span>
          </div>
        </div>
      </div>
    </div>
  );
};