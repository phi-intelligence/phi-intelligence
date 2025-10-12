import React, { useState, useRef } from 'react';
import { Mic, Upload, Settings, Play, Save, Download, Building2, Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FrameworkWrapper } from '@/components/voice/FrameworkWrapper';
import VoiceSelection from './voicebot/components/VoiceSelection';
import MainVoiceBot from './voicebot/components/MainVoiceBot';
import PersonalityTemplates from './voicebot/components/PersonalityTemplates';
import DocumentUpload from './voicebot/components/DocumentUpload';
import { useToast } from '@/hooks/use-toast';

export default function VoicebotDashboard() {
  return (
    <FrameworkWrapper>
      <VoicebotDashboardContent />
    </FrameworkWrapper>
  );
}

function VoicebotDashboardContent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [selectedVoice, setSelectedVoice] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [botStatus, setBotStatus] = useState<'ready' | 'building' | 'testing' | 'active'>('ready');
  const [currentStep, setCurrentStep] = useState(1);
  const [companyVoicebot, setCompanyVoicebot] = useState<{
    id: string;
    companyName: string;
    botName: string;
    companyDescription: string;
    filesCount?: number;
    chunksCount?: number;
  } | null>(null);
  
  // Company information state
  const [companyName, setCompanyName] = useState('');
  const [botName, setBotName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleVoiceSelect = (voiceId: number) => {
    setSelectedVoice(voiceId);
    setCurrentStep(2);
  };

  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplate(templateId);
    setCurrentStep(3);
  };

  // Validation functions
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

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    setCurrentStep(4);
  };

  const createVoicebot = async () => {
    // Company name validation
    if (!companyName.trim()) {
      toast({
        title: "Company Name Required",
        description: "Please enter a company name",
        variant: "destructive"
      });
      return;
    }

    // Bot name validation
    const botNameValidation = validateBotName(botName);
    if (!botNameValidation.isValid) {
      toast({
        title: "Invalid Bot Name",
        description: botNameValidation.message,
        variant: "destructive"
      });
      return;
    }

    // Flexible validation - Files OR Description required
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

    // Description validation (only if provided)
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
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        formData.append('voicebot_id', voicebotId);
        uploadedFiles.forEach(file => {
          formData.append('files', file);
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
      }

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
          bot_name: botName,
          description: companyDescription.trim() || null,
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
      const voicebot = {
        id: voicebotId,
        companyName: companyName,
        botName: botName,
        companyDescription: companyDescription,
        filesCount: indexResult.files_count || uploadedFiles.length,
        chunksCount: indexResult.chunks_count || uploadedFiles.length * 10
      };

      setProcessingProgress(100);
      setCompanyVoicebot(voicebot);
      setBotStatus('active');
      setIsProcessing(false);
      
      toast({
        title: "Voicebot Created Successfully!",
        description: `Your company voicebot has been created with ${voicebot.filesCount} files and ${voicebot.chunksCount} knowledge chunks.`,
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

  const handleTestBot = () => {
    setBotStatus('testing');
    // Simulate testing
    setTimeout(() => {
      setBotStatus('active');
    }, 2000);
  };

  const steps = [
    { id: 1, name: 'Voice', status: currentStep >= 1 ? 'completed' : 'pending' },
    { id: 2, name: 'Personality', status: currentStep >= 2 ? 'completed' : 'pending' },
    { id: 3, name: 'Documents', status: currentStep >= 3 ? 'completed' : 'pending' },
    { id: 4, name: 'Test', status: currentStep >= 4 ? 'completed' : 'pending' }
  ];

  return (
    <div className="min-h-screen bg-phi-black text-phi-white">
      {/* Top Bar Header */}
      <section className="py-3 px-4 border-b border-phi-gray">
        <div className="max-w-full mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-light text-phi-white">
              Voice Bot Builder
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-phi-gray text-sm">Step {currentStep} of 4</span>
              <div className="flex space-x-2">
                {steps.map((step, index) => (
                  <div key={step.id} className={`w-2 h-2 rounded-full ${
                    step.status === 'completed' 
                      ? 'bg-phi-light' 
                      : step.status === 'current'
                      ? 'bg-white'
                      : 'bg-phi-gray'
                  }`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content - Responsive */}
      <section className="px-2 sm:px-4 py-4">
        <div className="max-w-full mx-auto">
          {/* Mobile Layout (Stacked) - Scrollable */}
          <div className="block lg:hidden space-y-4 pb-8">
            {/* Voice Selection - Mobile */}
            <Card className="bg-phi-black border-phi-gray">
              <CardHeader className="pb-2">
                <CardTitle className="text-phi-white flex items-center gap-2 text-sm">
                  <Mic className="w-4 h-4 text-phi-light" />
                  Voice Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <VoiceSelection 
                  selectedVoice={selectedVoice}
                  onVoiceSelect={handleVoiceSelect}
                />
              </CardContent>
            </Card>

            {/* Main Voice Bot - Mobile */}
            <Card className="bg-phi-black border-phi-gray">
              <CardHeader className="pb-2">
                <CardTitle className="text-phi-white text-center text-sm">
                  Your Voice Bot
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-center mb-4">
                  <MainVoiceBot 
                    selectedVoice={selectedVoice}
                    selectedTemplate={selectedTemplate}
                    botStatus={botStatus}
                    onBuildBot={createVoicebot}
                    onTestBot={handleTestBot}
                    companyVoicebot={companyVoicebot}
                  />
                </div>

                {/* Company Information Form - Mobile */}
                <div className="space-y-3">
                  <div className="bg-phi-gray/20 rounded-lg p-3">
                    <h4 className="text-phi-white text-sm font-semibold mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-phi-light" />
                      Company Information
                    </h4>
                    <div className="space-y-2">
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Company Name *"
                        className="bg-black border-phi-gray text-phi-white text-xs h-8"
                      />
                      <Input
                        value={botName}
                        onChange={(e) => setBotName(e.target.value)}
                        placeholder="Bot Name *"
                        className="bg-black border-phi-gray text-phi-white text-xs h-8"
                      />
                      <Textarea
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        placeholder="Company Description (optional)"
                        className="bg-black border-phi-gray text-phi-white text-xs"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Data File Upload Section - Mobile */}
                  <div className="bg-phi-gray/20 rounded-lg p-2">
                    <h4 className="text-phi-white text-xs font-semibold mb-1 flex items-center gap-1">
                      <Upload className="w-3 h-3 text-phi-light" />
                      Upload Files
                    </h4>
                    <DocumentUpload 
                      uploadedFiles={uploadedFiles}
                      onFileUpload={handleFileUpload}
                    />
                  </div>

                  {/* Create Voicebot Button - Mobile */}
                  <div className="bg-phi-gray/20 rounded-lg p-3">
                    <Button
                      onClick={createVoicebot}
                      disabled={
                        !companyName.trim() || 
                        !botName.trim() || 
                        (uploadedFiles.length === 0 && !companyDescription.trim()) || 
                        isProcessing
                      }
                      className="w-full bg-phi-light hover:bg-phi-light/80 text-phi-black text-xs h-8"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Creating... {processingProgress}%
                        </>
                      ) : (
                        <>
                          <Brain className="h-3 w-3 mr-1" />
                          Create Voicebot
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Templates - Mobile */}
            <Card className="bg-phi-black border-phi-gray">
              <CardHeader className="pb-2">
                <CardTitle className="text-phi-white flex items-center gap-2 text-sm">
                  <Settings className="w-4 h-4 text-phi-light" />
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <PersonalityTemplates 
                  selectedTemplate={selectedTemplate}
                  onTemplateSelect={handleTemplateSelect}
                />
              </CardContent>
            </Card>
          </div>

          {/* Desktop Layout (3 Columns) */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 h-[calc(100vh-80px)]">
            {/* Left Column - Voice Selection */}
            <div className="col-span-3">
              <Card className="bg-phi-black border-phi-gray h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-phi-white flex items-center gap-2 text-sm">
                    <Mic className="w-4 h-4 text-phi-light" />
                    Voice Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <VoiceSelection 
                    selectedVoice={selectedVoice}
                    onVoiceSelect={handleVoiceSelect}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Center Column - Main Voice Bot */}
            <div className="col-span-6">
              <Card className="bg-phi-black border-phi-gray h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-phi-white text-center text-sm">
                    Your Voice Bot
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 h-[calc(100%-60px)] flex flex-col">
                  <div className="flex-1">
                    <MainVoiceBot 
                      selectedVoice={selectedVoice}
                      selectedTemplate={selectedTemplate}
                      botStatus={botStatus}
                      onBuildBot={createVoicebot}
                      onTestBot={handleTestBot}
                      companyVoicebot={companyVoicebot}
                    />
                  </div>

                  {/* Company Information Form */}
                  <div className="mt-4 space-y-3">
                    <div className="bg-phi-gray/20 rounded-lg p-3">
                      <h4 className="text-phi-white text-sm font-semibold mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-phi-light" />
                        Company Information
                      </h4>
                      <div className="space-y-2">
                        <Input
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Company Name *"
                          className="bg-black border-phi-gray text-phi-white text-xs h-8"
                        />
                        <Input
                          value={botName}
                          onChange={(e) => setBotName(e.target.value)}
                          placeholder="Bot Name *"
                          className="bg-black border-phi-gray text-phi-white text-xs h-8"
                        />
                        <Textarea
                          value={companyDescription}
                          onChange={(e) => setCompanyDescription(e.target.value)}
                          placeholder="Company Description (optional)"
                          className="bg-black border-phi-gray text-phi-white text-xs"
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Data File Upload Section */}
                    <div className="bg-phi-gray/20 rounded-lg p-2">
                      <h4 className="text-phi-white text-xs font-semibold mb-1 flex items-center gap-1">
                        <Upload className="w-3 h-3 text-phi-light" />
                        Upload Files
                      </h4>
                      <DocumentUpload 
                        uploadedFiles={uploadedFiles}
                        onFileUpload={handleFileUpload}
                      />
                    </div>

                    {/* Create Voicebot Button */}
                    <div className="bg-phi-gray/20 rounded-lg p-3">
                      <Button
                        onClick={createVoicebot}
                        disabled={
                          !companyName.trim() || 
                          !botName.trim() || 
                          (uploadedFiles.length === 0 && !companyDescription.trim()) || 
                          isProcessing
                        }
                        className="w-full bg-phi-light hover:bg-phi-light/80 text-phi-black text-xs h-8"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Creating... {processingProgress}%
                          </>
                        ) : (
                          <>
                            <Brain className="h-3 w-3 mr-1" />
                            Create Voicebot
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Personality Templates */}
            <div className="col-span-3">
              <Card className="bg-phi-black border-phi-gray h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-phi-white flex items-center gap-2 text-sm">
                    <Settings className="w-4 h-4 text-phi-light" />
                    Templates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <PersonalityTemplates 
                    selectedTemplate={selectedTemplate}
                    onTemplateSelect={handleTemplateSelect}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
