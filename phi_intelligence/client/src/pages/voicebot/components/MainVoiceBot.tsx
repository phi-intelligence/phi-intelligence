import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLiveKitVoice } from '@/components/voice/FrameworkWrapper';
import { generateRoomName, getTokenServerUrl, LIVEKIT_CONFIG } from '@/config/livekit';

// Voice wave interface for React state management
interface VoiceWave {
  id: string;
  timestamp: number;
}

interface MainVoiceBotProps {
  selectedVoice: number | null;
  selectedTemplate: number | null;
  botStatus: 'ready' | 'building' | 'testing' | 'active';
  onBuildBot: () => void;
  onTestBot: () => void;
  companyVoicebot?: {
    id: string;
    companyName: string;
    botName: string;
    companyDescription: string;
    filesCount?: number;
    chunksCount?: number;
  } | null;
}

export default function MainVoiceBot({ 
  selectedVoice, 
  selectedTemplate, 
  botStatus, 
  onBuildBot, 
  onTestBot,
  companyVoicebot
}: MainVoiceBotProps) {
  const { 
    isConnected, 
    isConnecting, 
    isSpeaking, 
    transcript, 
    response, 
    error,
    isActive,
    mediaDevicesSupported,
    connect,
    disconnect,
    isAgentAvailable,
    room,
    currentAgent,
    agentSwitchTrigger
  } = useLiveKitVoice();
  
  // Debug mode - set to false to reduce console noise
  const DEBUG_MODE = false;
  
  // Helper function for conditional logging
  const debugLog = (message: string, ...args: any[]) => {
    if (DEBUG_MODE) {
      console.log(message, ...args);
    }
  };

  // Handle agent switching - disconnect if another agent is selected
  useEffect(() => {
    if (agentSwitchTrigger > 0 && currentAgent !== 'phi' && isConnected) {
      debugLog('🔄 Another agent selected, disconnecting phi voice bubble...');
      disconnect();
    }
  }, [agentSwitchTrigger, currentAgent, isConnected, disconnect]);
  
  const voiceBubbleRef = useRef<HTMLDivElement>(null);
  const waveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // React-based voice wave management
  const [voiceWaves, setVoiceWaves] = useState<VoiceWave[]>([]);
  
  // Error state management
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Performance optimization - device capability detection
  const getWaveInterval = useCallback(() => {
    try {
      const memory = (performance as any).memory;
      if (memory && memory.jsHeapSizeLimit < 2147483648) { // 2GB
        return 500; // Slower on low-end devices
      }
      return 300; // Normal speed
    } catch {
      return 400; // Fallback for unsupported browsers
    }
  }, []);

  // React-based wave creation
  const createVoiceWave = useCallback(() => {
    const waveId = `wave-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newWave: VoiceWave = { id: waveId, timestamp: Date.now() };
    
    setVoiceWaves(prev => [...prev, newWave]);
    
    // Auto-remove after animation completes (1.5 seconds)
    setTimeout(() => {
      setVoiceWaves(prev => prev.filter(wave => wave.id !== waveId));
    }, 1500);
  }, []);

  // Cleanup all waves when stopping
  const cleanupAllWaves = useCallback(() => {
    setVoiceWaves([]);
  }, []);

  // Enhanced error handling with retry mechanism
  const handleConnectionError = useCallback((error: Error, context: string) => {
    console.error(`❌ Voice ${context} error:`, error);
    setHasError(true);
    setErrorMessage(`${context} failed: ${error.message}`);
    
    // Auto-clear error after 8 seconds
    setTimeout(() => {
      setHasError(false);
      setErrorMessage('');
    }, 8000);
  }, []);

  // Retry connection mechanism
  const retryConnection = useCallback(async () => {
    if (retryCount >= 3) {
      setErrorMessage('Maximum retry attempts reached. Please check your connection.');
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      
      // Attempt to reconnect to company room
      const roomName = `company_${Date.now()}`;
      const companyTokenServerUrl = import.meta.env.VITE_COMPANY_TOKEN_SERVER_URL;
      
      const tokenResponse = await fetch(`${companyTokenServerUrl}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_name: roomName,
          participant_identity: `company_user_${Date.now()}`,
          participant_name: 'Company User',
          ttl_minutes: 60,
          voicebot_id: `voicebot_${Date.now()}`,
          company_name: 'Your Company',
          bot_name: 'Voice Bot',
          description: 'Custom voice bot',
          can_publish: true,
          can_subscribe: true,
          can_publish_data: true,
          can_update_metadata: true
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token request failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      const companyLiveKitUrl = import.meta.env.VITE_LIVEKIT_COMPANY_URL;
      await connect(tokenData.token, roomName, companyLiveKitUrl);
      
      // Success - reset error state
      setHasError(false);
      setErrorMessage('');
      setRetryCount(0);
      debugLog('✅ Retry connection successful!');
      
    } catch (retryError) {
      const errorObj = retryError instanceof Error ? retryError : new Error('Retry failed');
      handleConnectionError(errorObj, 'retry');
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, connect, handleConnectionError]);

  // Start wave animation when AI is speaking
  useEffect(() => {
    if (isSpeaking && isConnected) {
      const interval = getWaveInterval();
      waveIntervalRef.current = setInterval(createVoiceWave, interval);

      return () => {
        if (waveIntervalRef.current) {
          clearInterval(waveIntervalRef.current);
        }
      };
    } else {
      // Stop waves when AI stops speaking
      if (waveIntervalRef.current) {
        clearInterval(waveIntervalRef.current);
        waveIntervalRef.current = null;
      }
      // Clean up any remaining waves
      cleanupAllWaves();
    }
  }, [isSpeaking, isConnected, createVoiceWave, getWaveInterval, cleanupAllWaves]);

  // Handle voice bubble click
  const handleVoiceBubbleClick = async () => {
    debugLog('🎯 Main VoiceBubble clicked!', { isConnected, isConnecting, mediaDevicesSupported, companyVoicebot });
    
    // Only allow connection if voicebot is created
    if (!companyVoicebot) {
      debugLog('❌ No voicebot created yet');
      return;
    }
    
    // Clear any previous errors
    setHasError(false);
    setErrorMessage('');
    setRetryCount(0);
    
    if (!isConnected) {
      // Connect to Company room (like VoicebotBuilderPage)
      debugLog('🔗 Connecting to Company voice agent...');
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
            bot_name: companyVoicebot.botName,
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
        
        debugLog('✅ Company voice agent connected and ready!');
        
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown connection error');
        handleConnectionError(errorObj, 'connection');
      }
    } else {
      // Disconnect from current agent
      debugLog('🔌 Disconnecting from current voice agent...');
      try {
        await disconnect();
        debugLog('✅ Voice agent disconnected successfully!');
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown disconnection error');
        handleConnectionError(errorObj, 'disconnection');
      }
    }
  };

  // Get status text based on current state
  const getStatusText = () => {
    if (!companyVoicebot) {
      return 'Create a voicebot to activate';
    }
    
    if (hasError) {
      return errorMessage || 'Connection error occurred';
    }
    
    if (isRetrying) {
      return `Retrying connection... (${retryCount}/3)`;
    }
    
    if (!mediaDevicesSupported) {
      return 'Microphone not supported';
    }
    
    if (isConnecting) {
      return 'Connecting to voice agent...';
    }
    
    if (isConnected && isActive) {
      return 'Voice agent active - Click to disconnect';
    }
    
    if (isConnected) {
      return 'Connected - Click to start conversation';
    }
    
    return 'Click to connect to voice agent';
  };

  // Get bubble content based on state
  const getBubbleContent = () => {
    if (!companyVoicebot) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-phi-gray text-8xl mb-2">●</div>
          <div className="text-phi-gray text-lg text-center font-medium">
            Your Voice Bot
          </div>
        </div>
      );
    }
    
    if (hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-red-400 text-8xl mb-2">⚠</div>
          <div className="text-red-400 text-lg text-center">Error</div>
        </div>
      );
    }
    
    if (isRetrying) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-yellow-400 text-8xl mb-2 animate-spin">⟳</div>
          <div className="text-yellow-400 text-lg text-center">Retrying</div>
        </div>
      );
    }
    
    if (isConnecting) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-blue-400 text-8xl mb-2 animate-pulse">⚡</div>
          <div className="text-blue-400 text-lg text-center">Connecting</div>
        </div>
      );
    }
    
    if (isSpeaking && isConnected) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-green-400 text-8xl mb-2 animate-bounce">●</div>
          <div className="text-green-400 text-lg text-center">Speaking</div>
        </div>
      );
    }
    
    if (isConnected && isActive) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-green-400 text-8xl mb-2">●</div>
          <div className="text-green-400 text-lg text-center">Active</div>
        </div>
      );
    }
    
    if (isConnected) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-blue-400 text-8xl mb-2">●</div>
          <div className="text-blue-400 text-lg text-center">Ready</div>
        </div>
      );
    }
    
    // Voicebot created but not connected - show white glow
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-white text-8xl mb-2">●</div>
        <div className="text-white text-lg text-center font-medium">
          {companyVoicebot.botName}
        </div>
      </div>
    );
  };

  // Get CSS classes for animation states
  const getBubbleClasses = () => {
    let classes = 'relative w-64 h-64 rounded-full cursor-pointer transition-all duration-300 flex flex-col items-center justify-center group border-2';
    
    if (!companyVoicebot) {
      // Inactive state - gray
      classes += ' border-phi-gray bg-phi-gray/20 cursor-not-allowed';
    } else if (hasError) {
      classes += ' border-red-500 bg-red-500/20';
    } else if (isSpeaking && isConnected) {
      classes += ' border-phi-light bg-phi-light/20 animate-pulse';
    } else if (isActive && isConnected) {
      classes += ' border-phi-light bg-phi-light/20';
    } else if (isConnected) {
      classes += ' border-phi-light bg-phi-light/10';
    } else {
      // Voicebot created but not connected - white border glow
      classes += ' border-white bg-white/10 shadow-lg shadow-white/20';
    }
    
    return classes;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
      // Clean up any remaining waves
      if (waveIntervalRef.current) {
        clearInterval(waveIntervalRef.current);
      }
      cleanupAllWaves();
    };
  }, [isConnected, disconnect, cleanupAllWaves]);

  return (
    <div className="space-y-4">
      {/* Main Voice Bot Bubble */}
      <div className="flex justify-center">
        <div 
          className="voice-bubble-container relative"
          onClick={(e) => {
            // Fallback click handler in case of event bubbling issues
            if (e.target === e.currentTarget) {
              debugLog('🎯 Container clicked, triggering voice bubble');
              handleVoiceBubbleClick();
            }
          }}
        >
          {/* Voice bubble for visual feedback - CLICKABLE */}
          <div 
            ref={voiceBubbleRef}
            className={getBubbleClasses()}
            onClick={handleVoiceBubbleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleVoiceBubbleClick();
              }
            }}
            style={{ 
              cursor: 'pointer',
              position: 'relative',
              zIndex: 1000,
              pointerEvents: 'auto'
            }}
            data-testid="main-voice-bubble-clickable"
          >
            {getBubbleContent()}
            
            {/* React-based voice waves */}
            {voiceWaves.map((wave) => (
              <div
                key={wave.id}
                className="voice-wave"
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Status display */}
      <div className="text-center">
        <div className={`status-text text-sm ${hasError ? 'text-red-400' : 'text-phi-light'}`}>
          {getStatusText()}
        </div>
      </div>
      
      {/* Real-time transcriptions and responses */}
      <div className="transcript-container max-w-md mx-auto">
        {transcript && (
          <div className="transcript bg-phi-gray/30 rounded-lg p-3 mb-2">
            <div className="text-xs text-phi-gray mb-1">You said:</div>
            <div className="text-phi-white text-sm">{transcript}</div>
          </div>
        )}
        {response && (
          <div className="response bg-phi-gray/30 rounded-lg p-3">
            <div className="text-xs text-phi-gray mb-1">AI Response:</div>
            <div className="text-phi-white text-sm">{response}</div>
          </div>
        )}
      </div>

      {/* Configuration Status */}
      <div className="space-y-1 text-center">
        <div className="flex items-center justify-center gap-4 text-xs">
          <span className={`${selectedVoice ? 'text-phi-light' : 'text-phi-gray'}`}>
            Voice: {selectedVoice ? '✓' : '✗'}
          </span>
          <span className={`${selectedTemplate ? 'text-phi-light' : 'text-phi-gray'}`}>
            Template: {selectedTemplate ? '✓' : '✗'}
          </span>
        </div>
      </div>
    </div>
  );
}