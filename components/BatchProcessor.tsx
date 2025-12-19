import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Download, Trash2, PlayCircle, PauseCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { paraphraseText, ParaphraseMode } from '../services/geminiService';
import { downloadAsDocx } from '../services/docxService';

interface BatchFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  originalText: string;
  paraphrasedText?: string;
  progress: number;
  error?: string;
}

interface BatchProcessorProps {
  onBatchComplete?: (results: BatchFile[]) => void;
}

export const BatchProcessor: React.FC<BatchProcessorProps> = ({ onBatchComplete }) => {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [mode, setMode] = useState<ParaphraseMode>('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 添加文件
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: BatchFile[] = Array.from(selectedFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      originalText: '',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // 自动读取文本内容
    newFiles.forEach(batchFile => {
      if (batchFile.file.type.startsWith('text/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setFiles(prev => prev.map(f =>
            f.id === batchFile.id ? { ...f, originalText: content } : f
          ));
        };
        reader.readAsText(batchFile.file);
      }
    });
  }, []);

  // 删除文件
  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  // 清空列表
  const clearAll = useCallback(() => {
    if (isProcessing) return;
    setFiles([]);
  }, [isProcessing]);

  // 处理单个文件
  const processFile = async (batchFile: BatchFile): Promise<void> => {
    try {
      // 更新状态为处理中
      setFiles(prev => prev.map(f =>
        f.id === batchFile.id
          ? { ...f, status: 'processing', progress: 0 }
          : f
      ));

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f =>
          f.id === batchFile.id
            ? { ...f, progress: Math.min(f.progress + 10, 90) }
            : f
        ));
      }, 500);

      // 执行改写
      const paraphrased = await paraphraseText(batchFile.originalText, mode);

      clearInterval(progressInterval);

      // 更新完成状态
      setFiles(prev => prev.map(f =>
        f.id === batchFile.id
          ? {
              ...f,
              status: 'completed',
              paraphrasedText: paraphrased,
              progress: 100
            }
          : f
      ));
    } catch (error) {
      // 更新错误状态
      setFiles(prev => prev.map(f =>
        f.id === batchFile.id
          ? {
              ...f,
              status: 'error',
              error: error instanceof Error ? error.message : '处理失败',
              progress: 0
            }
          : f
      ));
    }
  };

  // 批量处理
  const startBatchProcessing = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    abortControllerRef.current = new AbortController();

    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');

    for (let i = 0; i < pendingFiles.length; i++) {
      // 检查是否被取消
      if (abortControllerRef.current?.signal.aborted) {
        break;
      }

      setCurrentProcessingIndex(i);
      await processFile(pendingFiles[i]);

      // 短暂延迟避免API限流
      if (i < pendingFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsProcessing(false);
    setCurrentProcessingIndex(null);

    // 通知完成
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length > 0) {
      onBatchComplete?.(completedFiles);
    }
  };

  // 停止处理
  const stopProcessing = () => {
    abortControllerRef.current?.abort();
    setIsProcessing(false);
    setCurrentProcessingIndex(null);
  };

  // 下载单个文件
  const downloadSingle = async (batchFile: BatchFile) => {
    if (!batchFile.paraphrasedText) return;

    const fileName = `改写_${batchFile.file.name}`;
    if (fileName.endsWith('.txt')) {
      // 文本文件
      const blob = new Blob([batchFile.paraphrasedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } else if (fileName.endsWith('.docx')) {
      // Word文档
      await downloadAsDocx(batchFile.paraphrasedText, fileName);
    }
  };

  // 批量下载
  const downloadAll = async () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    for (const file of completedFiles) {
      await downloadSingle(file);
      // 短暂延迟避免浏览器阻止多个下载
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <div className="batch-processor bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <FileText className="w-6 h-6 mr-2" />
        批量处理
      </h2>

      {/* 文件选择区域 */}
      <div className="mb-6">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">点击或拖拽文件到此处</p>
          <p className="text-sm text-gray-500">支持 .txt, .doc, .docx 格式</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.doc,.docx"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      </div>

      {/* 控制面板 */}
      {files.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                已选择 {files.length} 个文件
              </span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as ParaphraseMode)}
                className="px-3 py-1 border rounded text-sm"
                disabled={isProcessing}
              >
                <option value="standard">标准模式</option>
                <option value="light">轻度改写</option>
                <option value="deep">深度改写</option>
                <option value="academic">学术模式</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearAll}
                disabled={isProcessing}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                清空
              </button>
              {!isProcessing ? (
                <button
                  onClick={startBatchProcessing}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>开始处理</span>
                </button>
              ) : (
                <button
                  onClick={stopProcessing}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <PauseCircle className="w-4 h-4" />
                  <span>停止处理</span>
                </button>
              )}
            </div>
          </div>

          {/* 进度统计 */}
          {isProcessing && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>处理进度</span>
                <span>{currentProcessingIndex != null ? `${currentProcessingIndex + 1}/${files.length}` : ''}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(files.filter(f => f.status === 'completed').length / files.length) * 100}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* 批量下载 */}
          {files.some(f => f.status === 'completed') && (
            <button
              onClick={downloadAll}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Download className="w-4 h-4" />
              <span>下载全部</span>
            </button>
          )}
        </div>
      )}

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((batchFile) => (
            <div
              key={batchFile.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1">
                <FileText className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{batchFile.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(batchFile.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* 状态图标 */}
                {batchFile.status === 'pending' && (
                  <div className="text-gray-400">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                {batchFile.status === 'processing' && (
                  <div className="text-blue-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                )}
                {batchFile.status === 'completed' && (
                  <div className="text-green-500">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
                {batchFile.status === 'error' && (
                  <div className="text-red-500" title={batchFile.error}>
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}

                {/* 进度条 */}
                {batchFile.status === 'processing' && (
                  <div className="w-24">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${batchFile.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                {batchFile.status === 'completed' && (
                  <button
                    onClick={() => downloadSingle(batchFile)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={() => removeFile(batchFile.id)}
                  disabled={isProcessing}
                  className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};