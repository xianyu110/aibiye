import React, { useState } from 'react';
import { PaperParams, DegreeLevel, PaperType } from '../types';
import { ArrowRight, Book, PenTool, LayoutTemplate, Lightbulb } from 'lucide-react';

interface PaperFormProps {
  onSubmit: (params: PaperParams) => void;
  isLoading: boolean;
}

export const PaperForm: React.FC<PaperFormProps> = ({ onSubmit, isLoading }) => {
  const [params, setParams] = useState<PaperParams>({
    topic: '',
    keywords: '',
    degree: DegreeLevel.UNDERGRADUATE,
    type: PaperType.THESIS,
    subjectArea: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (params.topic.length < 2) return;
    onSubmit(params);
  };

  const handleChange = (field: keyof PaperParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white px-8 py-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <LayoutTemplate className="w-6 h-6 text-blue-600" />
            论文信息录入
          </h2>
          <p className="text-slate-500 mt-1">AI 将根据您填写的信息，为您定制专属的学术内容。</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                论文题目 (Title) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={params.topic}
                onChange={(e) => handleChange('topic', e.target.value)}
                placeholder="例如：基于深度学习的医疗图像诊断系统研究"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-slate-800 placeholder:text-slate-400 text-lg"
                required
              />
              <div className="flex items-start gap-2 mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span>提示：题目越具体，生成的提纲结构越准确。建议包含“基于...”、“...的研究”、“...分析”等学术词汇。</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  专业领域 (Subject) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Book className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={params.subjectArea}
                    onChange={(e) => handleChange('subjectArea', e.target.value)}
                    placeholder="例如：计算机科学与技术"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  关键词 (Keywords)
                </label>
                <div className="relative">
                  <PenTool className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={params.keywords}
                    onChange={(e) => handleChange('keywords', e.target.value)}
                    placeholder="例如：CNN，医学影像，辅助诊断"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  学历层次 (Degree)
                </label>
                <div className="relative">
                    <select
                    value={params.degree}
                    onChange={(e) => handleChange('degree', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none bg-white cursor-pointer appearance-none"
                    >
                    {Object.values(DegreeLevel).map(level => (
                        <option key={level} value={level}>{level}</option>
                    ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  文档类型 (Type)
                </label>
                <div className="relative">
                    <select
                    value={params.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none bg-white cursor-pointer appearance-none"
                    >
                    {Object.values(PaperType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading || !params.topic}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all ${
                isLoading || !params.topic
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>AI 正在深度思考并撰写中...</span>
                </>
              ) : (
                <>
                  <span>立即生成大纲与草稿</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">
              点击生成即表示您同意我们的用户协议。生成内容仅供学术参考。
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};