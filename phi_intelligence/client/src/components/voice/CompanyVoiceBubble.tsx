import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLiveKitVoice } from './FrameworkWrapper';
import { Building2, Mic, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { generateRoomName, LIVEKIT_CONFIG } from '@/config/livekit';

// Company voice wave interface for React state management
interface CompanyVoiceWave {
  id: string;
  timestamp: number;
}

// Company voice bubble props interface
interface CompanyVoiceBubbleProps {
  companyName: string;
  companyDescription: string;
  voicebotId: string;
  filesCount: number;
  chunksCount: number;
  onConnectionChange?: (isConnected: boolean) => void;
  onError?: (error: string) => void;
}

// Error boundary component for CompanyVoiceBubble
class CompanyVoiceBubbleErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CompanyVoiceBubble Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="company-voice-bubble-error-fallback p-6 bg-red-900/20 border border-red-500/30 rounded-lg text-center">
          <div className="text-red-400 mb-3">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Company Voice Component Error</h3>
          </div>
          <p className="text-red-300 text-sm mb-4">
            Something went wrong with the company voice component. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const CompanyVoiceBubble: React.FC<CompanyVoiceBubbleProps> = ({
  companyName,
  companyDescription,
  voicebotId,
  filesCount,
  chunksCount,
  onConnectionChange,
  onError
}) => {
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
    room
  } = useLiveKitVoice();
  
  // Debug mode - set to false to reduce console noise
  const DEBUG_MODE = false;
  
  // Helper function for conditional logging
  const debugLog = (message: string, ...args: any[]) => {
    if (DEBUG_MODE) {
      console.log(message, ...args);
    }
  };
  
  const companyVoiceBubbleRef = useRef<HTMLDivElement>(null);
  const waveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // React-based company voice wave management
  const [companyVoiceWaves, setCompanyVoiceWaves] = useState<CompanyVoiceWave[]>([]);
  
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

  // React-based company wave creation
  const createCompanyVoiceWave = useCallback(() => {
    const waveId = `company-wave-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newWave: CompanyVoiceWave = { id: waveId, timestamp: Date.now() };
    
    setCompanyVoiceWaves(prev => [...prev, newWave]);
    
    // Auto-remove after animation completes (1.5 seconds)
    setTimeout(() => {
      setCompanyVoiceWaves(prev => prev.filter(wave => wave.id !== waveId));
    }, 1500);
  }, []);

  // Cleanup all company waves when stopping
  const cleanupAllCompanyWaves = useCallback(() => {
    setCompanyVoiceWaves([]);
  }, []);

  // Enhanced error handling with retry mechanism
  const handleCompanyConnectionError = useCallback((error: Error, context: string) => {
    console.error(`❌ Company Voice ${context} error:`, error);
    setHasError(true);
    setErrorMessage(`${context} failed: ${error.message}`);
    
    // Notify parent component of error
    if (onError) {
      onError(`${context} failed: ${error.message}`);
    }
    
    // Auto-clear error after 8 seconds
    setTimeout(() => {
      setHasError(false);
      setErrorMessage('');
    }, 8000);
  }, [onError]);

  // Retry company connection mechanism
  const retryCompanyConnection = useCallback(async () => {
    if (retryCount >= 3) {
      setErrorMessage('Maximum retry attempts reached. Please check your connection.');
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      
      // Attempt to reconnect to company voicebot
      const roomName = `company_${voicebotId}`;
      const companyTokenServerUrl = import.meta.env.VITE_COMPANY_TOKEN_SERVER_URL;
      
      const tokenResponse = await fetch(`${companyTokenServerUrl}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_name: roomName,
          participant_identity: `company_user_${Date.now()}`,
          participant_name: 'Company User',
          ttl_minutes: 60,
          voicebot_id: voicebotId,
          company_name: companyName,
          description: companyDescription,
          can_publish: true,
          can_subscribe: true,
          can_publish_data: true,
          can_update_metadata: true
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Company token request failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      const companyLiveKitUrl = import.meta.env.VITE_LIVEKIT_COMPANY_URL;
      await connect(tokenData.token, roomName, companyLiveKitUrl);
      
      // Success - reset error state
      setHasError(false);
      setErrorMessage('');
      setRetryCount(0);
      debugLog('✅ Company voice retry connection successful!');
      
    } catch (retryError) {
      const errorObj = retryError instanceof Error ? retryError : new Error('Company retry failed');
      handleCompanyConnectionError(errorObj, 'retry');
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, connect, handleCompanyConnectionError, voicebotId, companyName, companyDescription]);

  // Start company wave animation when AI is speaking
  useEffect(() => {
    if (isSpeaking && isConnected) {
      const interval = getWaveInterval();
      waveIntervalRef.current = setInterval(createCompanyVoiceWave, interval);

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
      cleanupAllCompanyWaves();
    }
  }, [isSpeaking, isConnected, createCompanyVoiceWave, getWaveInterval, cleanupAllCompanyWaves]);

  // Handle company voice bubble click
  const handleCompanyVoiceBubbleClick = async () => {
    debugLog('🎯 CompanyVoiceBubble clicked!', { isConnected, isConnecting, mediaDevicesSupported });
    
    // Clear any previous errors
    setHasError(false);
    setErrorMessage('');
    setRetryCount(0);
    
    if (!isConnected) {
      // First tap: connect to company mode room and auto-start voice agent
      debugLog('🔗 Connecting to company voice agent...');
      try {
        // Generate company room name explicitly
        const roomName = `company_${voicebotId}`;
        
        // Get Company Token Server URL (port 8002)
        const companyTokenServerUrl = import.meta.env.VITE_COMPANY_TOKEN_SERVER_URL;
        
        // Get token from Company Token Server (port 8002)
        const tokenResponse = await fetch(`${companyTokenServerUrl}/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            room_name: roomName,
            participant_identity: `company_user_${Date.now()}`,
            participant_name: 'Company User',
            ttl_minutes: 60,
            voicebot_id: voicebotId,
            company_name: companyName,
            description: companyDescription,
            can_publish: true,
            can_subscribe: true,
            can_publish_data: true,
            can_update_metadata: true
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error(`Failed to get company token: ${tokenResponse.status} ${tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();
        
        // Connect with company token and server URL using FrameworkWrapper
        // This will automatically start the company voice agent and enable microphone
        const companyLiveKitUrl = import.meta.env.VITE_LIVEKIT_COMPANY_URL;
      await connect(tokenData.token, roomName, companyLiveKitUrl);
        
        debugLog('✅ Company voice agent connected and ready!');
        debugLog('🏢 Company Room:', roomName);
        debugLog('📚 Knowledge Base:', filesCount, 'files,', chunksCount, 'chunks indexed');
        
        // Notify parent component of connection change
        if (onConnectionChange) {
          onConnectionChange(true);
        }
        
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown company connection error');
        handleCompanyConnectionError(errorObj, 'connection');
      }
    } else {
      // Second tap: disconnect and stop talking
      debugLog('🔌 Disconnecting from company voice agent...');
      try {
        await disconnect();
        debugLog('✅ Company voice agent disconnected successfully!');
        
        // Notify parent component of connection change
        if (onConnectionChange) {
          onConnectionChange(false);
        }
        
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown company disconnection error');
        handleCompanyConnectionError(errorObj, 'disconnection');
      }
    }
  };

  // Get company status text based on current state
  const getCompanyStatusText = () => {
    if (hasError) {
      return errorMessage || 'Company connection error occurred';
    }
    
    if (isRetrying) {
      return `Retrying company connection... (${retryCount}/3)`;
    }
    
    if (!mediaDevicesSupported) {
      return 'Microphone not supported';
    }
    
    if (isConnecting) {
      return 'Connecting to company voice agent...';
    }
    
    if (!isConnected) {
      return `Tap to connect to ${companyName} voice assistant`;
    }
    
    if (!isAgentAvailable || !isAgentAvailable()) {
      return 'Waiting for company AI agent to join...';
    }
    
    if (isActive) {
      return `${companyName} voice agent active - tap again to disconnect`;
    }
    
    return `Connected to ${companyName} - tap again to disconnect`;
  };

  // Get company bubble content based on state
  const getCompanyBubbleContent = () => {
    // Show company icon and name
    return (
      <div className="company-symbol">
        <div className="company-icon mb-2">
          <Building2 className="w-12 h-12 text-phi-light" />
        </div>
        <div className="company-name text-sm font-medium text-center">
          {companyName}
        </div>
        <div className="company-stats text-xs opacity-70 text-center mt-1">
          {filesCount} files • {chunksCount} chunks
        </div>
      </div>
    );
  };

  // Get CSS classes for company animation states
  const getCompanyBubbleClasses = () => {
    let classes = 'company-voice-bubble';
    
    if (hasError) {
      classes += ' error';
    } else if (isSpeaking && isConnected) {
      classes += ' speaking';
    } else if (isActive && isConnected) {
      classes += ' listening';
    } else if (isConnected) {
      classes += ' paused';
    }
    
    if (isConnected) {
      classes += ' connected';
    }
    
    if (!mediaDevicesSupported) {
      classes += ' disabled';
    }
    
    if (isRetrying) {
      classes += ' retrying';
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
      cleanupAllCompanyWaves();
    };
  }, [isConnected, disconnect, cleanupAllCompanyWaves]);

  return (
    <CompanyVoiceBubbleErrorBoundary>
      <div 
        className="company-voice-bubble-container relative"
        onClick={(e) => {
          // Fallback click handler in case of event bubbling issues
          if (e.target === e.currentTarget) {
            debugLog('🎯 Company container clicked, triggering company voice bubble');
            handleCompanyVoiceBubbleClick();
          }
        }}
      >
        {/* Company voice bubble for visual feedback - CLICKABLE */}
        <div 
          ref={companyVoiceBubbleRef}
          className={getCompanyBubbleClasses()}
          onClick={handleCompanyVoiceBubbleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCompanyVoiceBubbleClick();
            }
          }}
          style={{ 
            cursor: 'pointer',
            position: 'relative',
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
          data-testid="company-voice-bubble-clickable"
        >
          {getCompanyBubbleContent()}
          
          {/* React-based company voice waves */}
          {companyVoiceWaves.map((wave) => (
            <div
              key={wave.id}
              className="company-voice-wave"
            />
          ))}
        </div>
        
        {/* Company status display */}
        <div className={`company-status-text ${hasError ? 'text-red-400' : 'text-phi-light'}`}>
          {getCompanyStatusText()}
        </div>
        
        {/* Company real-time transcriptions and responses */}
        <div className="company-transcript-container">
          {transcript && (
            <div className="company-transcript">
              <strong>You:</strong> {transcript}
            </div>
          )}
          {response && (
            <div className="company-response">
              <strong>{companyName}:</strong> {response}
            </div>
          )}
        </div>
        
        {/* Enhanced error display with retry button */}
        {hasError && (
          <div className="company-error-message mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">{errorMessage}</span>
            </div>
            {retryCount < 3 && (
              <button
                onClick={retryCompanyConnection}
                disabled={isRetrying}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin inline" />
                    Retrying...
                  </>
                ) : (
                  'Retry Connection'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </CompanyVoiceBubbleErrorBoundary>
  );
};

export default CompanyVoiceBubble;
