import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Room, RoomEvent, Track, RemoteParticipant, LocalParticipant } from 'livekit-client';
import { 
  RoomContext,
  RoomAudioRenderer,
  StartAudio,
  useRoomContext
} from '@livekit/components-react';

// Import LiveKit configuration
import { LIVEKIT_CONFIG, getRoomConfig, generateRoomName, getTokenServerUrl } from '@/config/livekit';

// Define the context type interface
interface LiveKitVoiceContextType {
  // Room state
  room: Room | null;
  isConnected: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  transcript: string;
  response: string;
  error: string | null;
  isActive: boolean; // Simplified: single active state instead of complex listening states
  connectionAttempts: number;
  maxConnectionAttempts: number;
  mediaDevicesSupported: boolean;
  agentState: 'unknown' | 'available' | 'speaking' | 'unavailable';
  currentAgent: string | null;
  agentSwitchTrigger: number;
  participants: RemoteParticipant[];
  
  // Token server utilities
  checkTokenServerHealth: (mode?: 'phi' | 'company') => Promise<any>;
  testTokenServerConnection: (mode?: 'phi' | 'company') => Promise<any>;
  
  // Connection management
  connect: (token: string, roomName: string, serverUrl: string) => Promise<void>;
  disconnect: () => Promise<void>;
  resetConnectionAttempts: () => void;
  handleConnectionFailure: () => void;
  
  // Microphone control (simplified)
  getMicrophoneTrack: () => any;
  
  // Room information
  getParticipants: () => RemoteParticipant[];
  isAgentAvailable: () => boolean;
  getAgentType: () => string;
  connectWithAgentDetection: (token: string, roomName: string, serverUrl: string) => Promise<void>;
  checkAgentResponse: () => any;
  
  // LiveKit React integration
  livekitRoom: Room | null;
}

// Create context with proper default value
const LiveKitVoiceContext = createContext<LiveKitVoiceContextType | null>(null);

export const useLiveKitVoice = () => {
  const context = useContext(LiveKitVoiceContext);
  if (!context) {
    throw new Error('useLiveKitVoice must be used within a FrameworkWrapper');
  }
  return context;
};

export const FrameworkWrapper = ({ children }: { children: React.ReactNode }) => {
  // Get LiveKit configuration for phi mode
  const phiConfig = getRoomConfig('phi');
  
  // Debug mode - set to false to reduce console noise
  const DEBUG_MODE = false;
  
  // Helper function for conditional logging
  const debugLog = (message: string, ...args: any[]) => {
    if (DEBUG_MODE) {
      console.log(message, ...args);
    }
  };
  
  const debugWarn = (message: string, ...args: any[]) => {
    if (DEBUG_MODE) {
      console.warn(message, ...args);
    }
  };
  
  // Create LiveKit room instance with proper configuration
  const room = useMemo(() => {
    // Create room with correct LiveKit configuration
    const newRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
      // Remove invalid preConnectBuffer option
    });
    
    // Room created (no logging to reduce console noise)
    return newRoom;
  }, []);

  // State variables with proper types
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null); // Fixed: proper type
  const [isActive, setIsActive] = useState(false); // Simplified: single active state
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [maxConnectionAttempts] = useState(3);
  const [mediaDevicesSupported, setMediaDevicesSupported] = useState(false);
  const [agentState, setAgentState] = useState<'unknown' | 'available' | 'speaking' | 'unavailable'>('unknown');
  const [participants, setParticipants] = useState(new Map<string, RemoteParticipant>());
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [agentSwitchTrigger, setAgentSwitchTrigger] = useState(0);
  
  // Performance optimization status
  const [optimizationStatus, setOptimizationStatus] = useState({
    preemptiveGeneration: true,
    ttsTextPacing: true,
    interruptionOptimization: true,
    deepgramOptimization: true,
    aiTurnDetection: true
  });

  // Dual token server configuration
  const PHI_TOKEN_SERVER_URL = getTokenServerUrl('phi'); // Port 8001
  const COMPANY_TOKEN_SERVER_URL = getTokenServerUrl('company'); // Port 8002

  // Check media device support
  useEffect(() => {
    const checkMediaDevices = () => {
      const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      setMediaDevicesSupported(supported);
      debugLog('🎤 Media devices supported:', supported);
    };
    
    checkMediaDevices();
    
    // Check again when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkMediaDevices();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Room event handlers
  useEffect(() => {
    const handleTrackSubscribed = (track: any, publication: any, participant: RemoteParticipant) => {
      debugLog('📡 Track subscribed:', track.kind, 'from', participant.identity);
      
      if (track.kind === Track.Kind.Audio) {
        // Check if this is an AI agent speaking
        if (participant.identity.includes('agent') || participant.identity.includes('phi')) {
          setIsSpeaking(true);
          setAgentState('speaking');
          debugLog('🎤 AI agent started speaking');
        }
      }
    };

    const handleTrackUnsubscribed = (track: any, publication: any, participant: RemoteParticipant) => {
      debugLog('📡 Track unsubscribed:', track.kind, 'from', participant.identity);
      
      if (track.kind === Track.Kind.Audio) {
        // Check if this is an AI agent stopped speaking
        if (participant.identity.includes('agent') || participant.identity.includes('phi')) {
          setIsSpeaking(false);
          setAgentState('unknown');
          debugLog('🔇 AI agent stopped speaking');
        }
      }
    };

    const handleParticipantConnected = (participant: RemoteParticipant) => {
      debugLog('👤 Participant connected:', participant.identity);
      setParticipants(prev => new Map(prev).set(participant.sid, participant));
      
      // Check if this is an AI agent
      if (participant.identity.includes('agent') || participant.identity.includes('phi')) {
        setAgentState('available');
        debugLog('🤖 AI agent detected and available');
      }
    };

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      debugLog('👤 Participant disconnected:', participant.identity);
      setParticipants(prev => {
        const newMap = new Map(prev);
        newMap.delete(participant.sid);
        return newMap;
      });
      
      // Check if this was an AI agent
      if (participant.identity.includes('agent') || participant.identity.includes('phi')) {
        setAgentState('unavailable');
        debugLog('🤖 AI agent disconnected');
      }
    };

    const handleConnected = () => {
      debugLog('✅ Connected to LiveKit room');
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionAttempts(0);
      setError(null);
    };

    const handleDisconnected = () => {
      debugLog('🔌 Disconnected from LiveKit room');
      setIsConnected(false);
      setIsConnecting(false);
      setIsActive(false);
      setIsSpeaking(false);
      setAgentState('unknown');
      setParticipants(new Map());
    };

    const handleConnectionStateChanged = (connectionState: any) => {
      debugLog('🔄 Connection state changed:', connectionState);
      
      if (connectionState === 'connecting') {
        setIsConnecting(true);
      } else if (connectionState === 'connected') {
        setIsConnecting(false);
      } else if (connectionState === 'disconnected') {
        setIsConnecting(false);
      }
    };

    // Set up event listeners
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);
    room.on(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);

    return () => {
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      room.off(RoomEvent.Connected, handleConnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
      room.off(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);
    };
  }, [room]);

  // Connection management
  const connect = useCallback(async (token: string, roomName: string, serverUrl: string) => {
    try {
      // Extract agent type from room name for tracking
      const agentType = roomName.split('_')[0]; // e.g., 'hotel', 'restaurant', 'hospital', 'phi'
      
      // If already connecting, wait for it to complete or fail
      if (isConnecting) {
        debugLog('⚠️ Already connecting, waiting...');
        return;
      }

      // If already connected to any room, disconnect first
      if (isConnected) {
        debugLog('🔄 Switching agents - disconnecting from current room first...');
        await disconnect();
        // Wait longer for complete disconnection to prevent race conditions
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      debugLog('🔗 Connecting to room:', roomName, 'on server:', serverUrl);
      setIsConnecting(true);
      setError(null);
      
      // Reset all states before connecting to new agent
      setIsActive(false);
      setIsSpeaking(false);
      setAgentState('unknown');
      setParticipants(new Map());
      setCurrentAgent(agentType);
      
      // Trigger agent switch to notify other voice bubbles
      setAgentSwitchTrigger(prev => prev + 1);

      // Connect to the room
      await room.connect(serverUrl, token, {
        autoSubscribe: true
      });

      debugLog('✅ Successfully connected to room:', roomName);
      
      // Auto-activate voice agent after successful connection
      // Your backend voice agent will automatically start
      setIsActive(true);
      
      // Auto-enable microphone (your backend handles the rest)
      try {
        await room.localParticipant.setMicrophoneEnabled(true);
        debugLog('🎤 Microphone enabled automatically');
      } catch (micError) {
        debugWarn('⚠️ Could not auto-enable microphone:', micError);
        // Continue anyway - your backend voice agent will handle this
      }
      
      debugLog(`🚀 ${agentType} voice agent activated automatically - ready for conversation!`);
      
    } catch (error) {
      console.error('❌ Connection failed:', error);
      setError(error instanceof Error ? error.message : 'Connection failed');
      setIsConnecting(false);
      setCurrentAgent(null);
      
      // Handle connection failure
      if (connectionAttempts < maxConnectionAttempts) {
        setConnectionAttempts(prev => prev + 1);
        debugLog(`🔄 Retrying connection (${connectionAttempts + 1}/${maxConnectionAttempts})`);
        
        setTimeout(() => {
          connect(token, roomName, serverUrl);
        }, 1000 * (connectionAttempts + 1));
      } else {
        console.error('❌ Max connection attempts reached');
        setError('Max connection attempts reached');
      }
    }
  }, [room, isConnecting, isConnected, connectionAttempts, maxConnectionAttempts]);

  const disconnect = useCallback(async () => {
    try {
      if (room && isConnected) {
        debugLog('🔌 Disconnecting from current room...');
        
        // Disable microphone before disconnecting
        try {
          await room.localParticipant.setMicrophoneEnabled(false);
          debugLog('🎤 Microphone disabled');
        } catch (micError) {
          debugWarn('⚠️ Could not disable microphone:', micError);
        }
        
        // Disconnect from room
        await room.disconnect();
        
        // Reset all states after disconnection
        setIsActive(false);
        setIsSpeaking(false);
        setAgentState('unknown');
        setParticipants(new Map());
        setCurrentAgent(null);
        
        debugLog('🔌 Successfully disconnected from room');
      }
    } catch (error) {
      console.error('❌ Error disconnecting:', error);
    }
  }, [room, isConnected]);

  const resetConnectionAttempts = useCallback(() => {
    setConnectionAttempts(0);
  }, []);

  const handleConnectionFailure = useCallback(() => {
    setConnectionAttempts(prev => prev + 1);
  }, []);

  // Microphone control (simplified - no manual listening controls)

  const getMicrophoneTrack = useCallback(() => {
    if (!room.localParticipant) return null;
    
    // Use the correct LiveKit method to get microphone track
    try {
      // Fixed: Use getTrackPublication instead of getTrack
      const audioTrackPublication = room.localParticipant.getTrackPublication(Track.Source.Microphone);
      return audioTrackPublication?.track || null;
    } catch (error) {
      console.error('Error getting microphone track:', error);
      return null;
    }
  }, [room]);

  // Room information
  const getParticipants = useCallback(() => {
    return Array.from(participants.values());
  }, [participants]);

  const isAgentAvailable = useCallback(() => {
    return agentState === 'available' || agentState === 'speaking';
  }, [agentState]);

  const getAgentType = useCallback(() => {
    if (agentState === 'available' || agentState === 'speaking') {
      return 'phi_agent';
    }
    return 'none';
  }, [agentState]);

  const connectWithAgentDetection = useCallback(async (token: string, roomName: string, serverUrl: string) => {
    await connect(token, roomName, serverUrl);
    
    // Wait for agent to be available
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds
    
    const waitForAgent = () => {
      if (isAgentAvailable()) {
        return;
      }
      
      if (attempts < maxAttempts) {
        attempts++;
        setTimeout(waitForAgent, 100);
      }
    };
    
    waitForAgent();
  }, [connect, isAgentAvailable]);

  const checkAgentResponse = useCallback(() => {
    return {
      agentState,
      isSpeaking,
      participants: getParticipants(),
      roomState: isConnected ? 'connected' : 'disconnected'
    };
  }, [agentState, isSpeaking, getParticipants, isConnected]);

  // Token server utilities
  const checkTokenServerHealth = useCallback(async (mode: 'phi' | 'company' = 'phi') => {
    try {
      const tokenServerUrl = getTokenServerUrl(mode);
      const response = await fetch(`${tokenServerUrl}/health`);
      
      if (response.ok) {
        const data = await response.json();
        debugLog(`✅ ${mode} token server healthy:`, data);
        return { healthy: true, data };
      } else {
        console.error(`❌ ${mode} token server unhealthy:`, response.status);
        return { healthy: false, status: response.status };
      }
    } catch (error) {
      console.error(`❌ ${mode} token server error:`, error);
      return { healthy: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  const testTokenServerConnection = useCallback(async (mode: 'phi' | 'company' = 'phi') => {
    try {
      const tokenServerUrl = getTokenServerUrl(mode);
      debugLog(`🧪 Testing ${mode} token server connection to:`, tokenServerUrl);
      
      const healthCheck = await checkTokenServerHealth(mode);
      
      if (healthCheck.healthy) {
        debugLog(`✅ ${mode} token server connection successful`);
        return { success: true, message: 'Token server connection successful' };
      } else {
        console.error(`❌ ${mode} token server connection failed:`, healthCheck);
        return { success: false, message: 'Token server connection failed', details: healthCheck };
      }
    } catch (error) {
      console.error(`❌ ${mode} token server test error:`, error);
      return { success: false, message: 'Token server test failed', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [checkTokenServerHealth]);

  // Context value
  const contextValue = useMemo(() => ({
    // Room state
    room,
    isConnected,
    isConnecting,
    isSpeaking,
    transcript,
    response,
    error,
    isActive,
    connectionAttempts,
    maxConnectionAttempts,
    mediaDevicesSupported,
    agentState,
    currentAgent,
    agentSwitchTrigger,
    participants: getParticipants(),
    
    // Token server utilities
    checkTokenServerHealth,
    testTokenServerConnection,
    
    // Connection management
    connect,
    disconnect,
    resetConnectionAttempts,
    handleConnectionFailure,
    
    // Microphone control (simplified)
    getMicrophoneTrack,
    
    // Room information
    getParticipants,
    isAgentAvailable,
    getAgentType,
    connectWithAgentDetection,
    checkAgentResponse,
    
    // LiveKit React integration
    livekitRoom: room,
  }), [
    room,
    isConnected,
    isConnecting,
    isSpeaking,
    transcript,
    response,
    error,
    isActive,
    connectionAttempts,
    maxConnectionAttempts,
    mediaDevicesSupported,
    agentState,
    currentAgent,
    agentSwitchTrigger,
    getParticipants,
    checkTokenServerHealth,
    testTokenServerConnection,
    connect,
    disconnect,
    resetConnectionAttempts,
    handleConnectionFailure,
    getMicrophoneTrack,
    isAgentAvailable,
    getAgentType,
    connectWithAgentDetection,
    checkAgentResponse,
  ]);

  return (
    <LiveKitVoiceContext.Provider value={contextValue}>
      <RoomContext.Provider value={room}>
        {children}
        <RoomAudioRenderer />
        <StartAudio label="Click to enable audio" />
      </RoomContext.Provider>
    </LiveKitVoiceContext.Provider>
  );
};
