// Voice Service for phi_intelligence
// Adapted from phi-intelligence project

import { Room, RoomEvent, LocalParticipant, RemoteParticipant } from 'livekit-client';
import { getRoomConfig, generateRoomName, getTokenServerUrl, LIVEKIT_CONFIG, ROOM_CONFIG, VOICE_BOT_CONFIG, ERROR_CONFIG } from '@/config/livekit';

export interface VoiceServiceConfig {
  roomName: string;
  participantName: string;
  autoSubscribe: boolean;
  adaptiveStream: boolean;
  dynacast: boolean;
}

export interface VoiceBotResponse {
  success: boolean;
  message: string;
  audioUrl?: string;
  error?: string;
}

export class VoiceService {
  private room: Room | null = null;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private error: string | null = null;
  private reconnectAttempts: number = 0;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  // Event system
  private setupEventListeners() {
    this.eventListeners.set('connected', []);
    this.eventListeners.set('disconnected', []);
    this.eventListeners.set('participantJoined', []);
    this.eventListeners.set('participantLeft', []);
    this.eventListeners.set('error', []);
  }

  public on(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(callback);
    this.eventListeners.set(event, listeners);
  }

  public off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  // Connection management
  public async connect(config: VoiceServiceConfig): Promise<boolean> {
    try {
      if (this.isConnecting || this.isConnected) {
        return false;
      }

      this.isConnecting = true;
      this.error = null;

      // Get LiveKit configuration
      const livekitConfig = getRoomConfig();
      
      // Create room instance
      this.room = new Room({
        adaptiveStream: config.adaptiveStream,
        dynacast: config.dynacast,
        publishDefaults: {
          simulcast: true
        }
      });

      // Set up room event listeners
      this.setupRoomEventListeners();

      // Get token from server
      const token = await this.getToken(config.roomName, config.participantName);
      
      // Connect to room
      await this.room.connect(livekitConfig.url, token, {
        autoSubscribe: config.autoSubscribe
      });

      this.isConnecting = false;
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      this.emit('connected', { room: this.room });
      return true;

    } catch (error) {
      this.isConnecting = false;
      this.error = error instanceof Error ? error.message : 'Failed to connect';
      this.emit('error', { error: this.error });
      
      // Attempt reconnection
      if (this.reconnectAttempts < ERROR_CONFIG.reconnectionAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          this.connect(config);
        }, ERROR_CONFIG.retryDelay * this.reconnectAttempts);
      }
      
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.room && this.isConnected) {
        await this.room.disconnect();
        this.room = null;
        this.isConnected = false;
        this.emit('disconnected');
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to disconnect';
      this.emit('error', { error: this.error });
    }
  }

  // Room event listeners
  private setupRoomEventListeners() {
    if (!this.room) return;

    this.room.on(RoomEvent.Connected, () => {
      this.isConnected = true;
      this.emit('connected', { room: this.room });
    });

    this.room.on(RoomEvent.Disconnected, () => {
      this.isConnected = false;
      this.emit('disconnected');
    });

    this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      this.emit('participantJoined', { participant });
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      this.emit('participantLeft', { participant });
    });

    this.room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
      // Handle connection quality changes
    });

    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      // Handle track subscriptions
    });
  }

  // Token management
  private async getToken(roomName: string, participantName: string): Promise<string> {
    try {
      const tokenEndpoint = getTokenServerUrl();
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName,
          participantName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.token;

    } catch (error) {
      throw new Error(`Token request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Audio management
  public async enableMicrophone(): Promise<boolean> {
    try {
      if (!this.room || !this.isConnected) {
        return false;
      }

      await this.room.localParticipant.setMicrophoneEnabled(true);
      return true;

    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to enable microphone';
      this.emit('error', { error: this.error });
      return false;
    }
  }

  public async disableMicrophone(): Promise<boolean> {
    try {
      if (!this.room || !this.isConnected) {
        return false;
      }

      await this.room.localParticipant.setMicrophoneEnabled(false);
      return true;

    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to disable microphone';
      this.emit('error', { error: this.error });
      return false;
    }
    }

  public async toggleMicrophone(): Promise<boolean> {
    if (!this.room || !this.isConnected) {
      return false;
    }

    const isEnabled = this.room.localParticipant.isMicrophoneEnabled;
    return isEnabled ? await this.disableMicrophone() : await this.enableMicrophone();
  }

  // Voice bot functionality
  public async activateVoiceBot(): Promise<VoiceBotResponse> {
    try {
      if (!this.isConnected) {
        return {
          success: false,
          message: 'Not connected to room',
          error: 'NOT_CONNECTED'
        };
      }

      // Voice bot activation logic will be implemented in Phase 1C
      return {
        success: true,
        message: 'Voice bot activated',
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to activate voice bot',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async deactivateVoiceBot(): Promise<VoiceBotResponse> {
    try {
      // Voice bot deactivation logic will be implemented in Phase 1C
      return {
        success: true,
        message: 'Voice bot deactivated',
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to deactivate voice bot',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Room information
  public getRoomInfo() {
    if (!this.room) return null;

    return {
      name: this.room.name,
      sid: this.room.name || '',
      participants: this.room.numParticipants,
      localParticipant: this.room.localParticipant,
      isConnected: this.isConnected,
      error: this.error,
    };
  }

  public getParticipants() {
    if (!this.room) return [];
    return Array.from(this.room.remoteParticipants.values());
  }

  public getLocalParticipant() {
    if (!this.room) return null;
    return this.room.localParticipant;
  }

  // Utility methods
  public isRoomConnected(): boolean {
    return this.isConnected && this.room !== null;
  }

  public getError(): string | null {
    return this.error;
  }

  public clearError(): void {
    this.error = null;
  }

  // Cleanup
  public destroy() {
    this.disconnect();
    this.eventListeners.clear();
  }
}

// Create singleton instance
export const voiceService = new VoiceService();

export default voiceService;
