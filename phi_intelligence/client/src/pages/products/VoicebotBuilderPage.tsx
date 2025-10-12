import React, { useState, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { Mic, Brain, CheckCircle, Upload, X, FileText, Building2, AlertCircle, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLiveKitVoice } from '@/components/voice/FrameworkWrapper';
import { FrameworkWrapper } from '@/components/voice/FrameworkWrapper';
import Robot3D from '@/components/three/Robot3D';
import VoiceConnectionButton from '@/components/voice/VoiceConnectionButton';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sanitizeFileInfo, validateFilename, type SanitizedFile } from '@/utils/filenameUtils';
import './voicebot-builder.css';

interface UploadedFile {
  name: string;
  originalName: string;  // Keep original name for reference
  sanitizedName: string; // Sanitized name for upload
  wasSanitized: boolean; // Sanitization flag
  size: number;
  type: string;
  file: File;
}

interface CompanyVoicebot {
  id: string;
  companyName: string;
  botName: string;           // ✅ NEW: Bot personal name
  companyDescription: string;
  files: UploadedFile[];
  createdAt: Date;
  status: 'processing' | 'ready' | 'error';
  chunksCount?: number;
  filesCount?: number;
}



export default function VoicebotBuilderPage() {
  return (
    <FrameworkWrapper>
      <VoicebotBuilderPageContent />
    </FrameworkWrapper>
  );
}

function VoicebotBuilderPageContent() {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { 
    isConnected, 
    isConnecting,
    connect, 
    disconnect, 
    isActive,
    isSpeaking,
    transcript,
    response,
    mediaDevicesSupported,
    error: voiceError
  } = useLiveKitVoice();
  
  // State management
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [companyVoicebot, setCompanyVoicebot] = useState<CompanyVoicebot | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [botName, setBotName] = useState('');           // ✅ NEW: Bot name state
  const [companyDescription, setCompanyDescription] = useState('');
  const [connectionError, setConnectionError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);


  // File validation
  const validFileTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/json',
    'text/xml',
    'text/html'
  ];

  // ✅ NEW: Validation functions
  const validateDescription = (description: string): { isValid: boolean; wordCount: number; message?: string } => {
    const wordCount = description.trim().split(/\s+/).filter(w => w).length;
    
    if (wordCount === 0) return { isValid: true, wordCount: 0 }; // Optional field
    
    if (wordCount < 15) {
      return { 
        isValid: false, 
        wordCount, 
        message: `Description needs at least 15 words (currently ${wordCount})` 
      };
    }
    
    if (wordCount > 100) {
      return { 
        isValid: false, 
        wordCount, 
        message: `Description should be under 100 words (currently ${wordCount})` 
      };
    }
    
    return { isValid: true, wordCount };
  };

  const validateBotName = (name: string): { isValid: boolean; message?: string } => {
    const trimmed = name.trim();
    
    if (trimmed.length < 2) {
      return { isValid: false, message: "Bot name must be at least 2 characters" };
    }
    
    if (trimmed.length > 20) {
      return { isValid: false, message: "Bot name must be under 20 characters" };
    }
    
    if (!/^[a-zA-Z0-9\s]+$/.test(trimmed)) {
      return { isValid: false, message: "Bot name can only contain letters, numbers, and spaces" };
    }
    
    return { isValid: true };
  };

  // Handle file uploads
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => validFileTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      const skippedCount = files.length - validFiles.length;
      toast({
        title: "File Upload Warning",
        description: `Some files were skipped. Only PDF, DOC, DOCX, TXT, CSV, JSON, XML, and HTML files are supported. Skipped ${skippedCount} file(s).`,
        variant: "destructive"
      });
    }

    const newUploadedFiles: UploadedFile[] = validFiles.map(file => {
      // Sanitize filename silently
      const sanitizedInfo = sanitizeFileInfo(file.name);
      
      return {
        name: sanitizedInfo.sanitizedName,  // Use sanitized name for display
        originalName: sanitizedInfo.originalName,  // Keep original name
        sanitizedName: sanitizedInfo.sanitizedName,  // Sanitized name
        wasSanitized: sanitizedInfo.wasSanitized,  // Sanitization flag
        size: file.size,
        type: file.type,
        file: file
      };
    });

    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
    
    if (validFiles.length > 0) {
      toast({
        title: "Files Uploaded",
        description: `Successfully uploaded ${validFiles.length} file(s)`,
      });
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Create company voicebot
  const createVoicebot = async () => {
    // ✅ Company name validation
    if (!companyName.trim()) {
      toast({
        title: "Company Name Required",
        description: "Please enter a company name",
        variant: "destructive"
      });
      return;
    }

    // ✅ Bot name validation
    const botNameValidation = validateBotName(botName);
    if (!botNameValidation.isValid) {
      toast({
        title: "Invalid Bot Name",
        description: botNameValidation.message,
        variant: "destructive"
      });
      return;
    }

    // ✅ NEW: Flexible validation - Files OR Description required
    const hasFiles = uploadedFiles.length > 0;
    const hasDescription = companyDescription.trim().length > 0;
    
    if (!hasFiles && !hasDescription) {
      toast({
        title: "Content Required",
        description: "Please provide either files or a description (or both) to create your voicebot",
        variant: "destructive"
      });
      return;
    }

    // ✅ Description validation (only if provided)
    if (hasDescription) {
      const descValidation = validateDescription(companyDescription);
      if (!descValidation.isValid) {
        toast({
          title: "Description Requirements",
          description: descValidation.message,
          variant: "destructive"
        });
        return;
      }
    }

    setIsProcessing(true);
    setProcessingProgress(10);

    try {
      // Step 1: Generate unique voicebot ID
      const userId = `user_${Date.now()}`;
      const voicebotId = `voicebot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setProcessingProgress(20);

      // Step 2: Upload files to Company Token Server (port 8002)
      const formData = new FormData();
      formData.append('voicebot_id', voicebotId);
      uploadedFiles.forEach(file => {
        // Create a new File object with sanitized name
        const sanitizedFile = new File([file.file], file.sanitizedName, {
          type: file.file.type,
          lastModified: file.file.lastModified
        });
        formData.append('files', sanitizedFile);
      });

      const uploadResponse = await fetch(`${import.meta.env.VITE_RAG_SERVER_URL}/rag/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('Files uploaded:', uploadResult);
      setProcessingProgress(40);

      // Step 3: Index knowledge base using Company Token Server (port 8002)
      setProcessingProgress(60);
      const indexResponse = await fetch(`${import.meta.env.VITE_RAG_SERVER_URL}/rag/index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          company_name: companyName,
          bot_name: botName,           // ✅ NEW
          description: companyDescription.trim() || null,  // Send null if empty
          voicebot_id: voicebotId
        }),
      });

      if (!indexResponse.ok) {
        throw new Error(`Indexing failed: ${indexResponse.statusText}`);
      }

      const indexResult = await indexResponse.json();
      console.log('Knowledge base indexed:', indexResult);
      setProcessingProgress(80);

      // Step 4: Create voicebot object
      const voicebot: CompanyVoicebot = {
        id: voicebotId,
        companyName: companyName,
        botName: botName,           // ✅ NEW
        companyDescription: companyDescription,
        files: uploadedFiles,
        createdAt: new Date(),
        status: 'ready',
        chunksCount: indexResult.chunks_count,
        filesCount: indexResult.files_count
      };

      setProcessingProgress(100);
      setCompanyVoicebot(voicebot);
      setIsProcessing(false);
      
      toast({
        title: "Voicebot Created Successfully!",
        description: `Your company voicebot has been created with ${indexResult.files_count} files and ${indexResult.chunks_count} knowledge chunks.`,
      });

    } catch (error) {
      console.error('Error creating voicebot:', error);
      setIsProcessing(false);
      setProcessingProgress(0);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Error Creating Voicebot",
        description: `Failed to create voicebot: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  // Connection handlers
  const handleConnect = async () => {
    if (!companyVoicebot) {
      toast({
        title: "No Voicebot Available",
        description: "Please create a voicebot first",
        variant: "destructive"
      });
      return;
    }

    setConnectionError('');
    setRetryCount(0);

    try {
      const roomName = `company_${companyVoicebot.id}`;
      const companyTokenServerUrl = import.meta.env.VITE_COMPANY_TOKEN_SERVER_URL;
      
      const tokenResponse = await fetch(`${companyTokenServerUrl}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_name: roomName,
          participant_identity: `company_user_${Date.now()}`,
          participant_name: 'Company User',
          ttl_minutes: 60,
          voicebot_id: companyVoicebot.id,
          company_name: companyVoicebot.companyName,
          bot_name: companyVoicebot.botName,  // ✅ ADD: Bot name
          description: companyVoicebot.companyDescription,
          can_publish: true,
          can_subscribe: true,
          can_publish_data: true,
          can_update_metadata: true
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Failed to get company token: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      const companyLiveKitUrl = import.meta.env.VITE_LIVEKIT_COMPANY_URL;
      await connect(tokenData.token, roomName, companyLiveKitUrl);
      
      toast({
        title: "Connected Successfully",
        description: `Connected to ${companyVoicebot.botName} at ${companyVoicebot.companyName}`,
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      setConnectionError(errorMessage);
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setConnectionError('');
      setRetryCount(0);
      toast({
        title: "Disconnected",
        description: "Voice connection closed",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown disconnection error';
      setConnectionError(errorMessage);
      toast({
        title: "Disconnection Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleRetry = async () => {
    if (retryCount >= 3) {
      setConnectionError('Maximum retry attempts reached. Please check your connection.');
      return;
    }
    setRetryCount(prev => prev + 1);
    setConnectionError('');
    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    await handleConnect();
  };

  const getRobotAnimationState = (): 'stationary' | 'connected' | 'disconnected' => {
    if (!companyVoicebot) return 'stationary';
    if (connectionError || voiceError) return 'disconnected';
    if (isConnected) return 'connected';
    return 'stationary';
  };





  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section id="voicebot-builder-hero" className="py-24 px-6 relative overflow-hidden">
        {/* Content Overlay */}
        <div className="relative z-20 text-center max-w-7xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-light glow-text text-white mb-8">
            Custom Voice Agents
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto mb-12 text-white">
            Create AI voice assistants trained on your company's knowledge base. 
            Upload documents and get instant voice responses to customer questions.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Brain className="h-5 w-5" />
              <span>RAG-Powered</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Mic className="h-5 w-5" />
              <span>Voice Interface</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Shield className="h-5 w-5" />
              <span>Company Secure</span>
            </div>
          </div>

          
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Left Column - Voicebot Creation */}
            <div className="space-y-8">
              <Card className="p-6 bg-black/30 border border-white/20">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  Company Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name *</label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter your company name"
                      className="bg-black/20 border border-white/20 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Bot Name *</label>
                    <Input
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      placeholder="e.g., Alex, Sarah, Phoenix"
                      className="bg-black/20 border border-white/20 text-white"
                    />

                    {botName.trim() && !validateBotName(botName).isValid && (
                      <p className="text-xs text-red-400 mt-1">{validateBotName(botName).message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Company Description 
                      <span className="text-xs opacity-60 ml-2">(15-100 words recommended)</span>
                    </label>
                    <Textarea
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      placeholder="Brief description of your company and services (15-100 words for optimal AI performance)"
                      className="bg-black/20 border border-white/20 text-white"
                      rows={4}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs opacity-60">
                        {companyDescription.trim().split(/\s+/).filter(w => w).length} words
                      </p>
                      {companyDescription.trim() && (
                        <p className={`text-xs ${
                          validateDescription(companyDescription).isValid 
                            ? 'text-green-400' 
                            : 'text-yellow-400'
                        }`}>
                          {validateDescription(companyDescription).isValid 
                            ? '✓ Optimal length' 
                            : validateDescription(companyDescription).message
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-black/30 border border-white/20">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Upload className="h-6 w-6" />
                  Upload Documents
                </h2>
                

                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.csv,.json,.xml,.html"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="mb-4"
                      disabled={isProcessing}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                    
                    <p className="text-sm opacity-70">
                      Supported: PDF, DOC, DOCX, TXT, CSV, JSON, XML, HTML
                    </p>
                    <p className="text-xs opacity-50 mt-2">
                      Optional if you provide a description above
                    </p>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Uploaded Files:</h3>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-black/20 border border-white/10 p-3 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs opacity-60">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <Button
                            className="text-red-400 hover:text-red-300 bg-transparent border-none p-0 h-auto"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

                            <Card className="p-6 bg-black/30 border border-white/20">
                <Button
                  onClick={createVoicebot}
                  disabled={
                    !companyName.trim() || 
                    !botName.trim() || 
                    (uploadedFiles.length === 0 && !companyDescription.trim()) || 
                    isProcessing
                  }
                  className="w-full py-3 text-lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Voicebot... {processingProgress}%
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Create Voicebot
                    </>
                  )}
                </Button>

                {isProcessing && (
                  <div className="mt-4">
                    <div className="w-full bg-black/30 border border-white/20 rounded-full h-2">
                      <div 
                        className="bg-phi-light h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column - Voicebot Interface */}
            <div className="space-y-8">
              {companyVoicebot ? (
                <Card className="p-6 bg-black/30 border border-white/20">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Mic className="h-6 w-6" />
                    {companyVoicebot.botName} - {companyVoicebot.companyName} Assistant
                  </h2>
                  <p className="text-sm opacity-70 mb-6 text-center">
                    Your custom RAG-powered voice assistant trained on company documents
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 border border-white/10 p-4 rounded text-center">
                        <div className="text-2xl font-bold text-phi-light">{companyVoicebot.filesCount}</div>
                        <div className="text-sm opacity-70">Files</div>
                      </div>
                      <div className="bg-black/20 border border-white/10 p-4 rounded text-center">
                        <div className="text-2xl font-bold text-phi-light">{companyVoicebot.chunksCount}</div>
                        <div className="text-sm opacity-70">Knowledge Chunks</div>
                      </div>
                    </div>
                    
                    <div className="bg-black/20 border border-white/10 p-4 rounded">
                      <div className="text-sm opacity-70 mb-1">Status</div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-phi-light" />
                        <span className="font-medium">Ready for Voice Conversations</span>
                      </div>
                    </div>
                  </div>

                  {/* Company Robot 3D Animation */}
                  <div className="flex justify-center mb-6">
                    <div className="w-96 h-96 bg-black border border-white/20 rounded-lg overflow-hidden">
                      <Robot3D
                        animationState={getRobotAnimationState()}
                        isConnected={isConnected}
                        isActive={isActive}
                        isSpeaking={isSpeaking}
                        error={connectionError || voiceError || undefined}
                      />
                    </div>
                  </div>

                  {/* Voice Connection Button */}
                  <div className="space-y-4">
                    <VoiceConnectionButton
                      isConnected={isConnected}
                      isConnecting={isConnecting}
                      isActive={isActive}
                      isSpeaking={isSpeaking}
                      mediaDevicesSupported={mediaDevicesSupported}
                      error={connectionError || voiceError || undefined}
                      onConnect={handleConnect}
                      onDisconnect={handleDisconnect}
                      onRetry={handleRetry}
                      companyName={companyVoicebot.companyName}
                      size="lg"
                    />

                    {!mediaDevicesSupported && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Microphone access is required for voice conversations. 
                          Please ensure you're using HTTPS or localhost.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="p-6 bg-black/30 border border-white/20">
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-6">Company Voice Assistant</h3>
                    <p className="opacity-70 mb-6">
                      Create a company voicebot to activate your custom voice assistant
                    </p>
                    
                    {/* Inactive Company Robot 3D Animation */}
                    <div className="flex justify-center mb-6">
                      <div className="w-96 h-96 bg-black border border-white/20 rounded-lg overflow-hidden">
                        <Robot3D
                          animationState="stationary"
                          isConnected={false}
                          isActive={false}
                          isSpeaking={false}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-xs opacity-60">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Fill the form and upload documents to activate</span>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Voice Conversation Display */}
              {isConnected && (
                <Card className="p-6 bg-black/30 border border-white/20">
                  <h3 className="text-lg font-medium mb-4">Voice Conversation</h3>
                  
                  <div className="space-y-4">
                    {transcript && (
                      <div className="bg-black/20 border border-white/10 p-3 rounded">
                        <div className="text-sm opacity-70 mb-1">You said:</div>
                        <div>{transcript}</div>
                      </div>
                    )}
                    
                    {response && (
                      <div className="bg-black/20 border border-white/10 p-3 rounded">
                        <div className="text-sm opacity-70 mb-1">AI Response:</div>
                        <div>{response}</div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
