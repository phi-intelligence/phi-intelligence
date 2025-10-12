import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentUploadProps {
  uploadedFiles: File[];
  onFileUpload: (files: File[]) => void;
}

interface FileWithStatus extends File {
  id: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
}

export default function DocumentUpload({ uploadedFiles, onFileUpload }: DocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ['.pdf', '.docx', '.txt', '.md'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type ${fileExtension} is not supported. Please upload PDF, DOCX, TXT, or MD files.`;
    }
    
    if (file.size > maxFileSize) {
      return `File size exceeds 10MB limit. Please choose a smaller file.`;
    }
    
    return null;
  };

  const processFiles = useCallback((newFiles: File[]) => {
    const validFiles: FileWithStatus[] = [];
    const errors: string[] = [];

    newFiles.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push({
          ...file,
          id: Math.random().toString(36).substr(2, 9),
          status: 'uploading',
          progress: 0
        });
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      
      // Simulate upload progress
      validFiles.forEach((file) => {
        const interval = setInterval(() => {
          setFiles(prev => prev.map(f => {
            if (f.id === file.id) {
              const newProgress = Math.min(f.progress + Math.random() * 30, 100);
              if (newProgress >= 100) {
                clearInterval(interval);
                return { ...f, progress: 100, status: 'success' };
              }
              return { ...f, progress: newProgress };
            }
            return f;
          }));
        }, 200);
      });

      // Update parent component
      onFileUpload(validFiles);
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  }, [processFiles]);

  const handleRemoveFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    // Update parent component with remaining files
    const remainingFiles = files.filter(f => f.id !== fileId);
    onFileUpload(remainingFiles);
  };

  const handleClearAll = () => {
    setFiles([]);
    onFileUpload([]);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'txt': return '📃';
      case 'md': return '📋';
      default: return '📄';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-500/10' 
            : 'border-gray-600 bg-slate-700/30 hover:border-gray-500'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Upload Your Documents
        </h3>
        <p className="text-gray-400 mb-4">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Supported formats: PDF, DOCX, TXT, MD (Max 10MB each)
        </p>
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose Files
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-semibold">
              Uploaded Files ({files.length})
            </h4>
            <Button
              onClick={handleClearAll}
              variant="outline"
              size="sm"
              className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {getFileIcon(file.name)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status Icon */}
                  {file.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-blue-400 text-xs">
                        {Math.round(file.progress)}%
                      </span>
                    </div>
                  )}
                  
                  {file.status === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  
                  {file.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}

                  {/* Remove Button */}
                  <Button
                    onClick={() => handleRemoveFile(file.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-gray-400 text-sm">
        <p>Upload documents to train your voice bot's knowledge base</p>
        <p className="text-xs mt-1">
          The bot will use these documents to answer questions accurately
        </p>
      </div>
    </div>
  );
}
