import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLiveKitVoice } from './FrameworkWrapper';
import { Utensils } from 'lucide-react';

// Voice wave interface for React state management
interface VoiceWave {
  id: string;
  timestamp: number;
}

// Error boundary component for RestaurantVoiceBubble
class RestaurantVoiceBubbleErrorBoundary extends React.Component<
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
    console.error('RestaurantVoiceBubble Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="voice-bubble-error-fallback p-6 bg-red-900/20 border border-red-500/30 rounded-lg text-center">
          <div className="text-red-400 mb-3">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold">Restaurant Voice Component Error</h3>
          </div>
          <p className="text-red-300 text-sm mb-4">
            Something went wrong with the restaurant voice component. Please refresh the page.
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

const RestaurantVoiceBubble: React.FC = () => {
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
    if (agentSwitchTrigger > 0 && currentAgent !== 'restaurant' && isConnected) {
      debugLog('🔄 Another agent selected, disconnecting restaurant voice bubble...');
      disconnect();
    }
  }, [agentSwitchTrigger, currentAgent, isConnected, disconnect]);
  
  const voiceBubbleRef = useRef<HTMLDivElement>(null);
  const waveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // React-based voice wave management (replaces DOM manipulation)
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

  // React-based wave creation (replaces DOM manipulation)
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
    console.error(`❌ Restaurant Voice ${context} error:`, error);
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
      
      // Attempt to reconnect to restaurant
      const roomName = `restaurant_order_room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const tokenServerUrl = import.meta.env.VITE_RESTAURANT_ORDER_TOKEN_SERVER_URL;
      
      const tokenResponse = await fetch(`${tokenServerUrl}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_name: roomName,
          participant_identity: `restaurant_guest_${Date.now()}`,
          participant_name: 'Restaurant Guest',
          ttl_minutes: 30
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Restaurant token request failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      await connect(tokenData.token, roomName, tokenData.server_url);
      
      // Success - reset error state
      setHasError(false);
      setErrorMessage('');
      setRetryCount(0);
      debugLog('✅ Restaurant retry connection successful!');
      
    } catch (retryError) {
      const errorObj = retryError instanceof Error ? retryError : new Error('Restaurant retry failed');
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
    debugLog('🎯 RestaurantVoiceBubble clicked!', { isConnected, isConnecting, mediaDevicesSupported });
    
    // Clear any previous errors
    setHasError(false);
    setErrorMessage('');
    setRetryCount(0);
    
    if (!isConnected) {
      // Connect to restaurant room and auto-start voice agent
      debugLog('🔗 Connecting to restaurant voice agent...');
      try {
        // Generate restaurant room name explicitly
        const roomName = `restaurant_order_room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Get Restaurant Token Server URL (port 8005)
        const tokenServerUrl = import.meta.env.VITE_RESTAURANT_ORDER_TOKEN_SERVER_URL;
        
        // Get token from Restaurant Token Server (port 8005)
        const tokenResponse = await fetch(`${tokenServerUrl}/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            room_name: roomName,
            participant_identity: `restaurant_guest_${Date.now()}`,
            participant_name: 'Restaurant Guest',
            ttl_minutes: 30
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error(`Failed to get restaurant token: ${tokenResponse.status} ${tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();
        
        // Connect to restaurant room - FrameworkWrapper will handle disconnection if needed
        await connect(tokenData.token, roomName, tokenData.server_url);
        
        debugLog('✅ Restaurant voice agent connected and ready!');
        
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown restaurant connection error');
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
    if (hasError) {
      return errorMessage || 'Restaurant connection error occurred';
    }
    
    if (isRetrying) {
      return `Retrying restaurant connection... (${retryCount}/3)`;
    }
    
    if (!mediaDevicesSupported) {
      return 'Microphone not supported';
    }
    
    if (isConnecting) {
      return 'Connecting to restaurant...';
    }
    
    if (!isConnected) {
      return 'Tap to speak with our restaurant server';
    }
    
    if (!isAgentAvailable || !isAgentAvailable()) {
      return 'Waiting for restaurant AI agent to join...';
    }
    
    if (isActive) {
      return 'Restaurant server active - tap again to disconnect';
    }
    
    return 'Connected to restaurant - tap again to disconnect';
  };

  // Get bubble content based on state - RESTAURANT SYMBOL instead of logo
  const getBubbleContent = () => {
    // Always show restaurant symbol - no state-based icon changes
    return (
      <div className="restaurant-symbol">
        <Utensils className="w-16 h-16 text-white" />
        <div className="restaurant-name text-sm font-medium text-center text-white mt-2">
          Bella Vista Restaurant
        </div>
        <div className="restaurant-location text-xs opacity-70 text-center text-white">
          London, UK
        </div>
      </div>
    );
  };

  // Get CSS classes for animation states - SAME as original voice-bubble
  const getBubbleClasses = () => {
    let classes = 'restaurant-voice-bubble';
    
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
      cleanupAllWaves();
    };
  }, [isConnected, disconnect, cleanupAllWaves]);

  return (
    <RestaurantVoiceBubbleErrorBoundary>
      <div 
        className="voice-bubble-container relative"
        onClick={(e) => {
          // Fallback click handler in case of event bubbling issues
          if (e.target === e.currentTarget) {
            debugLog('🎯 Restaurant container clicked, triggering voice bubble');
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
          data-testid="restaurant-voice-bubble-clickable"
        >
          {getBubbleContent()}
          
          {/* React-based voice waves (replaces DOM manipulation) */}
          {voiceWaves.map((wave) => (
            <div
              key={wave.id}
              className="voice-wave"
            />
          ))}
        </div>
        
        {/* Tap to talk text */}
        <div className="text-center mt-1 md:mt-2">
          <p className="text-sm text-phi-light opacity-80">Tap to talk</p>
        </div>
        
        {/* Real-time transcriptions and responses */}
        <div className="transcript-container">
          {transcript && (
            <div className="transcript">
              <strong>Guest:</strong> {transcript}
            </div>
          )}
          {response && (
            <div className="response">
              <strong>Server:</strong> {response}
            </div>
          )}
        </div>
      </div>
    </RestaurantVoiceBubbleErrorBoundary>
  );
};

export default RestaurantVoiceBubble;
