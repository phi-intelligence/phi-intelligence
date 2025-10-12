import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, FileText, Image, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResumeViewerProps {
  resumeUrl: string;
  fileName?: string;
  onClose: () => void;
}

interface FileInfo {
  name: string;
  type: string;
  size?: string;
  extension: string;
}

export default function ResumeViewer({ resumeUrl, fileName, onClose }: ResumeViewerProps) {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    analyzeFile();
  }, [resumeUrl]);

  const analyzeFile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Extract file information from URL
      const url = new URL(resumeUrl);
      const pathParts = url.pathname.split('/');
      const fullFileName = fileName || pathParts[pathParts.length - 1] || 'resume';
      const extension = fullFileName.split('.').pop()?.toLowerCase() || '';

      // Determine file type
      const fileType = getFileType(extension);
      setIsPdf(fileType === 'pdf');
      setIsImage(['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension));

      setFileInfo({
        name: fullFileName,
        type: fileType,
        extension: extension,
        size: 'Unknown' // File size would need server-side info
      });

    } catch (err) {
      setError('Failed to analyze file');
      console.error('Error analyzing file:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileType = (extension: string): string => {
    switch (extension.toLowerCase()) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Microsoft Word Document';
      case 'txt':
        return 'Text Document';
      case 'jpg':
      case 'jpeg':
        return 'JPEG Image';
      case 'png':
        return 'PNG Image';
      case 'gif':
        return 'GIF Image';
      case 'webp':
        return 'WebP Image';
      default:
        return 'Unknown File Type';
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = fileInfo?.name || 'resume';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(resumeUrl, '_blank');
  };

  const renderFilePreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-2">Error loading file</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="h-96 border border-border rounded-lg overflow-hidden">
          <iframe
            src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full"
            title="Resume PDF Viewer"
          />
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="h-96 border border-border rounded-lg overflow-hidden">
          <img
            src={resumeUrl}
            alt="Resume"
            className="w-full h-full object-contain bg-muted/20"
            onError={() => setError('Failed to load image')}
          />
        </div>
      );
    }

    // For other file types, show file info
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-white mb-2">File Preview Not Available</p>
          <p className="text-muted-foreground text-sm">
            This file type cannot be previewed. Please download to view.
          </p>
        </div>
      </div>
    );
  };

  const getFileIcon = () => {
    if (isPdf) return <FileText className="w-5 h-5 text-red-400" />;
    if (isImage) return <Image className="w-5 h-5 text-green-400" />;
    return <File className="w-5 h-5 text-blue-400" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            {getFileIcon()}
            <div>
              <h2 className="text-xl font-semibold text-white">Resume Viewer</h2>
              {fileInfo && (
                <p className="text-sm text-muted-foreground">
                  {fileInfo.name} • {fileInfo.type}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Information */}
          {fileInfo && (
            <Card className="bg-muted/20 border-border/50">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">File Name:</span>
                    <p className="text-white font-medium">{fileInfo.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">File Type:</span>
                    <p className="text-white font-medium">{fileInfo.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Extension:</span>
                    <p className="text-white font-medium">{fileInfo.extension.toUpperCase()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Preview */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
            {renderFilePreview()}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
            <Button
              onClick={handleDownload}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Resume
            </Button>
            <Button
              onClick={handleOpenInNewTab}
              variant="outline"
              className="border-border/50 text-white hover:bg-accent"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-muted-foreground hover:text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
