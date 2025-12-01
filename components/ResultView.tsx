import React from 'react';
import { CheckCircle, Copy, Download, RefreshCw, FileText, ArrowLeft } from 'lucide-react';

interface ResultViewProps {
  content: string;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ content, onReset }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert('内容已复制到剪贴板！');
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "毕业论文大纲与草稿_AI毕业.md";
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  };

  // Lightweight Markdown Renderer
  const renderMarkdown = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold text-slate-900 mt-8 mb-4 border-b pb-2">{parseBold(line.slice(2))}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold text-slate-800 mt-6 mb-3">{parseBold(line.slice(3))}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold text-slate-800 mt-4 mb-2">{parseBold(line.slice(4))}</h3>;
      }

      // List items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={index} className="ml-6 list-disc text-slate-700 leading-relaxed mb-1">
            {parseBold(line.trim().substring(2))}
          </li>
        );
      }
      
       // Numbered list items (simple detection)
       if (/^\d+\.\s/.test(line.trim())) {
         return (
           <div key={index} className="ml-6 text-slate-700 leading-relaxed mb-1 pl-2">
             {parseBold(line.trim())}
           </div>
         );
       }

      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      }

      // Paragraphs
      return <p key={index} className="text-slate-700 leading-7 mb-2 text-justify">{parseBold(line)}</p>;
    });
  };

  // Helper to parse **bold** text
  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-slate-900 font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-64px)]">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                生成完成
            </h2>
            <p className="text-sm text-slate-500 mt-1">AI 已根据您的要求生成了论文大纲与草稿。</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={onReset}
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            重写
          </button>
          <button 
            onClick={handleCopy}
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Copy className="w-4 h-4 mr-2" />
            复制
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            下载Markdown
          </button>
        </div>
      </div>

      {/* Document View */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col ring-1 ring-slate-900/5">
        {/* Toolbar Simulation */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-4 select-none shrink-0">
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500/20"></div>
            </div>
            <div className="h-4 w-px bg-slate-300 mx-2"></div>
            <div className="flex items-center gap-6 text-xs text-slate-600 font-medium">
                <span className="hover:text-blue-600 cursor-pointer transition-colors">文件</span>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">编辑</span>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">视图</span>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">格式</span>
            </div>
            <div className="flex-1"></div>
            <div className="text-xs text-slate-400 font-mono">字数统计: {content.length}</div>
        </div>

        {/* Paper Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-16 bg-white relative">
            <div className="max-w-[21cm] mx-auto bg-white min-h-full shadow-sm">
                {renderMarkdown(content)}
            </div>
            
            {/* Watermark simulation */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] overflow-hidden">
                <div className="transform -rotate-45 text-6xl font-bold text-slate-900 whitespace-nowrap select-none">
                    AI BIYE GENERATED • 仅供参考
                </div>
            </div>
        </div>
      </div>
      
      <div className="mt-6 text-center text-xs text-slate-400">
        AI 生成内容可能存在错误，请务必核实重要信息。本工具仅用于学术辅助，请遵守学校相关规定。
      </div>
    </div>
  );
};