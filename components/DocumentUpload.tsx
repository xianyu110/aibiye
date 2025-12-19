import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, FileText, Image, FileSpreadsheet, Presentation } from 'lucide-react';
import { DocumentService, ProcessedDocument } from '../services/documentService';

interface DocumentUploadProps {
  onTextExtracted: (text: string, metadata?: ProcessedDocument['metadata']) => void;
  isLoading: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onTextExtracted, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [documentMetadata, setDocumentMetadata] = useState<ProcessedDocument['metadata'] | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractingProgress, setExtractingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = [
    { extension: 'txt', name: '文本文档', icon: FileText },
    { extension: 'doc', name: 'Word文档(旧版)', icon: FileText },
    { extension: 'docx', name: 'Word文档(新版)', icon: FileText },
    { extension: 'pdf', name: 'PDF文档', icon: FileText },
    { extension: 'jpg', name: 'JPEG图片', icon: Image },
    { extension: 'jpeg', name: 'JPEG图片', icon: Image },
    { extension: 'png', name: 'PNG图片', icon: Image },
    { extension: 'xls', name: 'Excel表格(旧版)', icon: FileSpreadsheet },
    { extension: 'xlsx', name: 'Excel表格(新版)', icon: FileSpreadsheet },
    { extension: 'ppt', name: 'PowerPoint(旧版)', icon: Presentation },
    { extension: 'pptx', name: 'PowerPoint(新版)', icon: Presentation },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // 检查文件格式
    if (!DocumentService.isSupported(file.name)) {
      alert('不支持的文件格式。请上传支持的文档格式文件');
      return;
    }

    setUploadedFile(file);
    await extractTextFromFile(file);
  };

  const extractTextFromFile = async (file: File) => {
    setIsExtracting(true);
    setExtractingProgress(0);

    try {
      // 获取文件类型用于显示处理信息
      const fileType = DocumentService.getFileType(file.name);
      const isGeminiProcessed = ['pdf', 'image', 'excel', 'powerpoint'].includes(fileType);
      const isDocFile = file.name.toLowerCase().endsWith('.doc');

      let processedDocument;

      // 模拟进度更新
      if (isGeminiProcessed) {
        // Gemini AI处理，显示AI分析进度
        const progressInterval = setInterval(() => {
          setExtractingProgress(prev => {
            if (prev < 30) return prev + 5;
            if (prev < 70) return prev + 3;
            if (prev < 90) return prev + 1;
            return prev;
          });
        }, 100);

        processedDocument = await DocumentService.processDocument(file);
        clearInterval(progressInterval);
        setExtractingProgress(100);
      } else if (isDocFile) {
        // DOC文件转换处理
        const progressInterval = setInterval(() => {
          setExtractingProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        processedDocument = await DocumentService.processDocument(file);
        clearInterval(progressInterval);
        setExtractingProgress(100);
      } else {
        // 本地快速处理
        setExtractingProgress(50);
        processedDocument = await DocumentService.processDocument(file);
        setExtractingProgress(100);
      }

      const cleanedText = DocumentService.cleanText(processedDocument.text);

      setExtractedText(cleanedText);
      setDocumentMetadata(processedDocument.metadata);

      // 添加成功反馈
      const fileType = DocumentService.getFileType(file.name);
      const isGeminiProcessed = processedDocument.metadata.processingMethod === 'gemini';

      let successMessage = `✅ 文档解析成功！\n\n`;
      successMessage += `文件名：${file.name}\n`;
      successMessage += `提取文本：${cleanedText.length} 字符\n`;
      successMessage += `处理方式：${isGeminiProcessed ? '🤖 AI智能解析' : '🔒 本地解析'}\n`;
      successMessage += `文档类型：${DocumentService.getFileTypeDescription(fileType)}`;

      if (cleanedText.length < 50) {
        successMessage += `\n\n⚠️ 提取的文本较少，请确认文档内容是否���确`;
      } else if (cleanedText.length > 10000) {
        successMessage += `\n\n💡 文本较长，建议分段处理以获得最佳效果`;
      }

      // 显示成功提示（使用console.log而不是alert，避免打断用户体验）
      console.log(successMessage);

      onTextExtracted(cleanedText, processedDocument.metadata);
    } catch (error) {
      console.error('文件处理失败:', error);

      let errorMessage = '文件处理失败，请重试';

      if (error instanceof Error) {
        // 根据错误类型提供更具体的提示
        if (error.message.includes('API Key未配置')) {
          errorMessage = '🔑 AI文档解析功能未配置\n\n请联系管理员配置Gemini API Key，或尝试上传Word/TXT文件使用本地解析功能。';
        } else if (error.message.includes('文件过大') || error.message.includes('文件大小')) {
          errorMessage = '📁 文件过大\n\n' + error.message + '\n请尝试压缩文件或分割成多个小文件。';
        } else if (error.message.includes('不支持的文件格式')) {
          errorMessage = '📄 不支持的文件格式\n\n' + error.message + '\n请选择支持的文件格式。';
        } else if (error.message.includes('网络连接错误')) {
          errorMessage = '🌐 网络连接错误\n\n请检查网络连接后重试，或尝试使用Word/TXT文件进行本地解析。';
        } else if (error.message.includes('API调用频率过高')) {
          errorMessage = '⚡ API调用过于频繁\n\n请稍等片刻后重试，或尝试使用Word/TXT文件进行本地解析。';
        } else if (error.message.includes('文档内容无法识别')) {
          errorMessage = '📷 无法识别文档内容\n\n请确保文档清晰可读，或尝试其他文件。';
        } else {
          errorMessage = `❌ ${error.message}`;
        }
      }

      // 显示友好的错误提示
      if (confirm(errorMessage + '\n\n是否查看支持的文件格式说明？')) {
        // 滚动到格式说明区域
        document.querySelector('.bg-gradient-to-r.from-blue-50.to-purple-50')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

      setUploadedFile(null);
      setDocumentMetadata(null);
      setExtractingProgress(0);
    } finally {
      setTimeout(() => {
        setIsExtracting(false);
        setExtractingProgress(0);
      }, 500);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setExtractedText('');
    setDocumentMetadata(null);
    onTextExtracted('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // 获取处理消息
  const getProcessingMessage = (fileName: string, progress: number): string => {
    const fileType = DocumentService.getFileType(fileName);
    const isGeminiProcessed = ['pdf', 'image', 'excel', 'powerpoint'].includes(fileType);
    const isDocFile = fileName.toLowerCase().endsWith('.doc');

    if (isGeminiProcessed) {
      if (progress < 30) return '🤖 AI正在分析文档结构...';
      if (progress < 70) return '🧠 AI正在提取和解析内容...';
      if (progress < 90) return '⚡ AI正在优化文本格式...';
      return '✨ AI解析即将完成...';
    }

    if (isDocFile) {
      if (progress < 30) return '📄 正在转换.doc文件...';
      if (progress < 70) return '🔤 正在提取文本内容...';
      return '📝 正在优化文档格式...';
    }

    return '⚡ 正在提取文本内容...';
  };

  // 获取处理详情
  const getProcessingDetails = (fileName: string, progress: number): string => {
    const fileType = DocumentService.getFileType(fileName);
    const isGeminiProcessed = ['pdf', 'image', 'excel', 'powerpoint'].includes(fileType);
    const isDocFile = fileName.toLowerCase().endsWith('.doc');

    if (isGeminiProcessed) {
      if (progress < 30) return `使用Gemini AI解析${DocumentService.getFileTypeDescription(fileType)}`;
      if (progress < 70) return `智能识别文档内容和格式`;
      if (progress < 90) return `清理和优化提取的文本`;
      return `即将完成，请稍候...`;
    }

    if (isDocFile) {
      if (progress < 30) return '解析文档结构...';
      if (progress < 70) return '提取文本内容...';
      return '创建DOCX格式...';
    }

    return '';
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">上传文档</h3>
        <p className="text-sm text-gray-600">
          支持Word、PDF、图片、Excel、PowerPoint等格式，AI智能解析文档内容
        </p>
      </div>

      {/* 上传区域 */}
      {!uploadedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.doc,.docx,.pdf,.jpg,.jpeg,.png,.bmp,.tiff,.gif,.webp,.xls,.xlsx,.ppt,.pptx"
            onChange={handleFileInput}
            className="hidden"
            disabled={isLoading}
          />

          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            点击上传或拖拽文件到此处
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            支持Word、PDF、图片、Excel、PowerPoint等格式，AI智能解析
          </p>
          <p className="text-xs text-gray-500">
            最大文件大小：20M (PDF/图片/Excel/PPT)，100M (Word/TXT)
          </p>
        </div>
      ) : (
        /* 已上传文件显示 */
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                {documentMetadata && (
                  <span className="text-lg">{DocumentService.getFileIcon(documentMetadata.fileType)}</span>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{uploadedFile.name}</h4>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span>{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                  {documentMetadata && (
                    <span>{DocumentService.getFileTypeDescription(documentMetadata.fileType)}</span>
                  )}
                </div>
              </div>
              {extractedText && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            <button
              onClick={removeFile}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {isExtracting ? (
            <div className="py-4">
              <div className="flex items-center justify-center mb-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"></div>
                <span className="text-sm text-gray-600">
                  {getProcessingMessage(uploadedFile?.name || '', extractingProgress)}
                </span>
              </div>
              {extractingProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2 ml-8 mr-8">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${extractingProgress}%` }}
                  ></div>
                </div>
              )}
              {getProcessingDetails(uploadedFile?.name || '', extractingProgress) && (
                <div className="text-xs text-gray-500 mt-2 text-center">
                  {getProcessingDetails(uploadedFile?.name || '', extractingProgress)}
                </div>
              )}
            </div>
          ) : extractedText ? (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">提取的文本内容</span>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{extractedText.length} 字符</span>
                  {documentMetadata && (
                    <span>
                      {Math.ceil(extractedText.length / 3000)} 段可处理
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">
                  {extractedText}
                </p>
              </div>
              {extractedText.length > 3000 && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                  💡 文本较长，建议分段处理以获得最佳效果
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center text-amber-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              文本提取失败，请重试
            </div>
          )}
        </div>
      )}

      {/* 支持的格式说明 */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">📁 支持的文档格式</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {supportedFormats.map((format) => {
            const Icon = format.icon;
            return (
              <div key={format.extension} className="flex items-center space-x-2">
                <Icon className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">.{format.extension}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-xs text-blue-700">
            🚀 <strong>AI智能解析：</strong>PDF、图片、Excel、PowerPoint使用Gemini 3 Flash Preview AI模型进行智能解析
          </p>
          <p className="text-xs text-green-700">
            🔒 <strong>本地处理：</strong>Word文档使用mammoth.js库进行本地解析，安全可靠，保护隐私
          </p>
          <p className="text-xs text-orange-600">
            ⚠️ <strong>注意事项：</strong>PDF/图片/Excel/PPT最大20MB，Word/TXT最大100MB
          </p>
        </div>
      </div>
    </div>
  );
};