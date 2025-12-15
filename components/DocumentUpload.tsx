import React, { useState, useRef, useEffect } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, FileText, Image, FileSpreadsheet, Presentation, Brain, Cpu } from 'lucide-react';
import { DocumentService, ProcessedDocument } from '../services/documentService';
import { ConfigService } from '../services/configService';

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
  const [useGemini, setUseGemini] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 检查是否可以使用Gemini
  useEffect(() => {
    setUseGemini(ConfigService.canUseGeminiForDocuments());
  }, []);

  const supportedFormats = [
    { extension: 'txt', name: '文本文档', icon: FileText },
    { extension: 'doc', name: 'Word文档(旧版)', icon: FileText },
    { extension: 'docx', name: 'Word文档(新版)', icon: FileText },
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
      alert('不支持的文件格式。请上传doc、docx或txt格式文件');
      return;
    }

    setUploadedFile(file);
    await extractTextFromFile(file);
  };

  const extractTextFromFile = async (file: File) => {
    setIsExtracting(true);
    try {
      const processedDocument = await DocumentService.processDocument(file, useGemini);
      const cleanedText = DocumentService.cleanText(processedDocument.text);

      setExtractedText(cleanedText);
      setDocumentMetadata(processedDocument.metadata);
      onTextExtracted(cleanedText, processedDocument.metadata);
    } catch (error) {
      console.error('文件处理失败:', error);
      alert(error instanceof Error ? error.message : '文件处理失败，请重试或尝试其他文件');
      setUploadedFile(null);
      setDocumentMetadata(null);
    } finally {
      setIsExtracting(false);
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

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">上传文档</h3>
        <p className="text-sm text-gray-600">
          支持doc、docx、txt格式文件，文件大小不超过100M
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
            accept=".txt,.doc,.docx"
            onChange={handleFileInput}
            className="hidden"
            disabled={isLoading}
          />

          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            点击上传或拖拽文件到此处
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            支持doc、docx、txt格式文件，文件大小不超过100M
          </p>
          <p className="text-xs text-gray-500">
            最大文件大小：100M
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
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"></div>
              <span className="text-sm text-gray-600">
                {useGemini ? '使用 AI 智能提取文本内容...' : '正在提取文本内容...'}
              </span>
              {useGemini && <Brain className="w-4 h-4 text-purple-600 ml-2" />}
            </div>
          ) : extractedText ? (
            <div className="mt-4">
              {documentMetadata?.processingMethod && (
                <div className="flex items-center justify-center py-2 mb-2">
                  {documentMetadata.processingMethod === 'gemini' ? (
                    <div className="flex items-center space-x-2 text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                      <Brain className="w-3 h-3" />
                      <span>AI智能解析</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                      <Cpu className="w-3 h-3" />
                      <span>原生解析</span>
                    </div>
                  )}
                </div>
              )}
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
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-blue-900">支持的文档格式</h4>
          {useGemini && (
            <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              <Brain className="w-3 h-3" />
              <span>AI增强</span>
            </div>
          )}
        </div>
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
        <p className="text-xs text-blue-700 mt-3">
          {useGemini ? (
            <>
              🚀 <strong>AI智能解析已启用</strong>：使用Gemini 2.0 Flash模型，支持OCR文字识别、表格理解、复杂布局解析
              <br />
              💡 提示：PDF、图片、Office文档解析效果显著提升
            </>
          ) : (
            <>
              💡 提示：配置Gemini API Key可启用AI智能解析，大幅提升文档解析效果
            </>
          )}
        </p>
        <p className="text-xs text-orange-600 mt-2">
          ⚠️ 注意：.doc格式需要Gemini API处理且限制为20MB，.docx和.txt格式可本地处理限制为100MB
        </p>
      </div>
    </div>
  );
};