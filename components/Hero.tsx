import React from 'react';
import { Sparkles, RefreshCw, Shield, Zap } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative overflow-hidden pt-16 pb-32">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-medium mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 mr-2" />
          智能文本降重助手 免费使用
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
          智能文本降重，<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
            告别查重烦恼
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
          采用先进的AI技术，一键智能改写文本内容，有效降低重复率。<br/>
          保持原意不变，提升表达质量，让你的论文轻松通过查重检测。
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
          <button
            onClick={onStart}
            className="px-10 py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-xl hover:bg-green-700 hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            免费开始降重
          </button>
          <button className="px-10 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg shadow-sm hover:bg-slate-50 transition-all">
            查看效果对比
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">智能同义词替换</h3>
            <p className="text-slate-500">基于深度学习的同义词库，智能识别语境，精准替换词汇，保持语句通顺自然。</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 text-teal-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">快速批量处理</h3>
            <p className="text-slate-500">支持大段文本一键改写，处理速度快，效率高，轻松应对论文降重需求。</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">保持原意不变</h3>
            <p className="text-slate-500">采用语义理解技术，确保改写后的内容保持原意，逻辑清晰，表达更加精准。</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 pt-10 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
                ['100万+', '改写字符数'],
                ['98%', '用户满意度'],
                ['免费', '无使用限制'],
                ['24h', '随时可用'],
            ].map(([stat, label]) => (
                <div key={label}>
                    <div className="text-3xl font-bold text-slate-900">{stat}</div>
                    <div className="text-sm text-slate-500 font-medium mt-1">{label}</div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};