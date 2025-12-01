import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PaperForm } from './components/PaperForm';
import { ResultView } from './components/ResultView';
import { generateThesisContent } from './services/geminiService';
import { AppState, PaperParams } from './types';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    setAppState(AppState.FORM);
  };

  const handleLogoClick = () => {
    setAppState(AppState.LANDING);
    setGeneratedContent('');
  };

  const handleFormSubmit = async (params: PaperParams) => {
    setIsLoading(true);
    setAppState(AppState.GENERATING); 
    
    // Slight delay to ensure UI updates
    setTimeout(async () => {
        try {
            const result = await generateThesisContent(params);
            setGeneratedContent(result);
            setAppState(AppState.RESULT);
        } catch (error) {
            alert("抱歉，生成过程中遇到了一些问题，请稍后重试。");
            setAppState(AppState.FORM);
        } finally {
            setIsLoading(false);
        }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header onLogoClick={handleLogoClick} />
      
      <main className="flex-grow">
        {appState === AppState.LANDING && (
          <Hero onStart={handleStart} />
        )}

        {(appState === AppState.FORM || appState === AppState.GENERATING) && (
          <PaperForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        )}

        {appState === AppState.RESULT && (
          <ResultView 
            content={generatedContent} 
            onReset={() => setAppState(AppState.FORM)} 
          />
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-1 md:col-span-2">
             <span className="text-xl font-bold text-white block mb-4 flex items-center gap-2">
               AI毕业
             </span>
             <p className="max-w-xs text-slate-400 leading-relaxed">
               致力于利用人工智能技术辅助学术研究，帮助高校师生提高论文写作效率，降低创作门槛。
             </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-base">产品服务</h4>
            <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">大纲生成器</a></li>
                <li><a href="#" className="hover:text-white transition-colors">文献综述辅助</a></li>
                <li><a href="#" className="hover:text-white transition-colors">语法润色</a></li>
                <li><a href="#" className="hover:text-white transition-colors">查重检测</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-base">关于公司</h4>
            <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">关于我们</a></li>
                <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
                <li><a href="#" className="hover:text-white transition-colors">用户协议</a></li>
                <li><a href="#" className="hover:text-white transition-colors">联系合作</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} AI Biye. All rights reserved. 仅供学术辅助研究使用。
        </div>
      </footer>
    </div>
  );
}