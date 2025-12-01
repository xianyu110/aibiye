import React from 'react';
import { Sparkles, FileText, Zap, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative overflow-hidden pt-16 pb-32">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 mr-2" />
          AI 论文写作助手 2.0 全新上线
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
          搞定毕业论文，<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            只需一杯咖啡的时间
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
          输入题目，一键生成千字大纲、开题报告、文献综述和正文草稿。<br/>
          专为中国大学生打造，查重率低，引用规范，效率提升 10 倍。
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
          <button 
            onClick={onStart}
            className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            立即生成论文
          </button>
          <button className="px-10 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg shadow-sm hover:bg-slate-50 transition-all">
            查看高分范文
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">智能大纲生成</h3>
            <p className="text-slate-500">根据专业和课题，自动生成逻辑严密的三级论文提纲，搭好论文骨架。</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">极速初稿写作</h3>
            <p className="text-slate-500">告别写作瓶颈，AI 辅助生成开题报告、摘要、致谢及正文段落，灵感源源不断。</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 text-teal-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">学术规范保障</h3>
            <p className="text-slate-500">生成内容符合学术语言规范，支持生成标准参考文献格式 (GB/T 7714)。</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 pt-10 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
                ['50万+', '已生成论文'],
                ['99%', '用户好评率'],
                ['100+', '覆盖专业'],
                ['24h', '随时在线'],
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