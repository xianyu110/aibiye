import React from 'react';
import { GraduationCap } from 'lucide-react';

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
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">
              AI毕业
            </span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#" onClick={(e) => e.preventDefault()} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">核心功能</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">范文库</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">价格方案</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">关于我们</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="hidden sm:block text-slate-600 hover:text-slate-900 font-medium">
              登录
            </button>
            <button 
              onClick={onLogoClick}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-md hover:shadow-lg text-sm"
            >
              开始写作
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};