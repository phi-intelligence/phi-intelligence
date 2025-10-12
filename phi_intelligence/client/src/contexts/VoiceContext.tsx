import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant } from 'livekit-client';
import { getRoomConfig, generateRoomName, getTokenServerUrl, LIVEKIT_CONFIG } from '@/config/livekit';

// Voice state types
export interface VoiceState {
  isConnected: boolean;
  isConnecting: boolean;
  room: Room | null;
  participants: Map<string, RemoteParticipant>;
  localParticipant: LocalParticipant | null;
  isMuted: boolean;
  isSpeaking: boolean;
  error: string | null;
  isVoiceBotActive: boolean;
  voiceBotStatus: 'idle' | 'listening' | 'processing' | 'speaking';
}

// Voice action types
export type VoiceAction =
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_ROOM'; payload: Room | null }
  | { type: 'SET_PARTICIPANTS'; payload: Map<string, RemoteParticipant> }
  | { type: 'SET_LOCAL_PARTICIPANT'; payload: LocalParticipant | null }
  | { type: 'SET_MUTED'; payload: boolean }
  | { type: 'SET_SPEAKING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VOICE_BOT_ACTIVE'; payload: boolean }
  | { type: 'SET_VOICE_BOT_STATUS'; payload: VoiceState['voiceBotStatus'] }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: VoiceState = {
  isConnected: false,
  isConnecting: false,
  room: null,
  participants: new Map(),
  localParticipant: null,
  isMuted: true,
  isSpeaking: false,
  error: null,
  isVoiceBotActive: false,
  voiceBotStatus: 'idle'
};

// Voice reducer
function voiceReducer(state: VoiceState, action: VoiceAction): VoiceState {
  switch (action.type) {
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_ROOM':
      return { ...state, room: action.payload };
    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload };
    case 'SET_LOCAL_PARTICIPANT':
      return { ...state, localParticipant: action.payload };
    case 'SET_MUTED':
      return { ...state, isMuted: action.payload };
    case 'SET_SPEAKING':
      return { ...state, isSpeaking: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_VOICE_BOT_ACTIVE':
      return { ...state, isVoiceBotActive: action.payload };
    case 'SET_VOICE_BOT_STATUS':
      return { ...state, voiceBotStatus: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Voice context interface
interface VoiceContextType {
  state: VoiceState;
  dispatch: React.Dispatch<VoiceAction>;
  connectToRoom: (roomName: string, token: string) => Promise<void>;
  disconnectFromRoom: () => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleVoiceBot: () => Promise<void>;
}

// Create context
const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

// Voice provider props
interface VoiceProviderProps {
  children: ReactNode;
}

// Voice provider component
export function VoiceProvider({ children }: VoiceProviderProps) {
  const [state, dispatch] = useReducer(voiceReducer, initialState);

  // Connect to room
  const connectToRoom = async (roomName: string, token: string) => {
    try {
      dispatch({ type: 'SET_CONNECTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Determine mode based on room name
      const mode = roomName.startsWith('company_') ? 'company' : 'phi';
      const config = getRoomConfig(mode);
      
      // Debug mode - set to false to reduce console noise
      const DEBUG_MODE = false;
      if (DEBUG_MODE) {
        console.log(`🔗 Connecting in ${mode} mode using:`, {
          roomName,
          serverUrl: config.url,
          tokenServerUrl: config.tokenServerUrl
        });
      }

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: true,
        },
      });

      // Set up room event listeners
      room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        const newParticipants = new Map(state.participants);
        newParticipants.set(participant.sid, participant);
        dispatch({ type: 'SET_PARTICIPANTS', payload: newParticipants });
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
        const newParticipants = new Map(state.participants);
        newParticipants.delete(participant.sid);
        dispatch({ type: 'SET_PARTICIPANTS', payload: newParticipants });
      });

      room.on(RoomEvent.Connected, () => {
        dispatch({ type: 'SET_CONNECTED', payload: true });
        dispatch({ type: 'SET_CONNECTING', payload: false });
        dispatch({ type: 'SET_ROOM', payload: room });
        dispatch({ type: 'SET_LOCAL_PARTICIPANT', payload: room.localParticipant });
        if (DEBUG_MODE) {
          console.log('✅ Connected to LiveKit room successfully');
        }
      });

      room.on(RoomEvent.Disconnected, () => {
        dispatch({ type: 'SET_CONNECTED', payload: false });
        dispatch({ type: 'SET_ROOM', payload: null });
        dispatch({ type: 'SET_LOCAL_PARTICIPANT', payload: null });
        dispatch({ type: 'SET_PARTICIPANTS', payload: new Map() });
        if (DEBUG_MODE) {
          console.log('🔌 Disconnected from LiveKit room');
        }
      });

      // Connect to the room with server URL and token
      await room.connect(config.url, token, {
        autoSubscribe: true
      });

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to connect to room' });
      dispatch({ type: 'SET_CONNECTING', payload: false });
    }
  };

  // Disconnect from room
  const disconnectFromRoom = async () => {
    try {
      if (state.room) {
        await state.room.disconnect();
        dispatch({ type: 'RESET_STATE' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to disconnect from room' });
    }
  };

  // Toggle mute
  const toggleMute = async () => {
    try {
      if (state.localParticipant) {
        const newMutedState = !state.isMuted;
        await state.localParticipant.setMicrophoneEnabled(!newMutedState);
        dispatch({ type: 'SET_MUTED', payload: newMutedState });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to toggle mute' });
    }
  };

  // Toggle voice bot
  const toggleVoiceBot = async () => {
    try {
      const newState = !state.isVoiceBotActive;
      dispatch({ type: 'SET_VOICE_BOT_ACTIVE', payload: newState });
      
      if (newState) {
        dispatch({ type: 'SET_VOICE_BOT_STATUS', payload: 'listening' });
        // Voice bot activation logic will be implemented in Phase 1C
      } else {
        dispatch({ type: 'SET_VOICE_BOT_STATUS', payload: 'idle' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to toggle voice bot' });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.room) {
        state.room.disconnect();
      }
    };
  }, [state.room]);

  const value: VoiceContextType = {
    state,
    dispatch,
    connectToRoom,
    disconnectFromRoom,
    toggleMute,
    toggleVoiceBot,
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
}

// Custom hook to use voice context
export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}

export default VoiceProvider;
