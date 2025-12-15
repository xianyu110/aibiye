import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer group"
            onClick={onLogoClick}
          >
            <div className="bg-green-600 p-2 rounded-lg group-hover:bg-green-700 transition-colors">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600 tracking-tight">
              AI降重
            </span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#" onClick={(e) => e.preventDefault()} className="text-slate-600 hover:text-green-600 font-medium transition-colors">功能特点</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-slate-600 hover:text-green-600 font-medium transition-colors">使用指南</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-slate-600 hover:text-green-600 font-medium transition-colors">API文档</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-slate-600 hover:text-green-600 font-medium transition-colors">关于我们</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="hidden sm:block text-slate-600 hover:text-slate-900 font-medium">
              登录
            </button>
            <button
              onClick={onLogoClick}
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all shadow-md hover:shadow-lg text-sm"
            >
              免费使用
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};