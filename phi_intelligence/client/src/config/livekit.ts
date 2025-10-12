// LiveKit Configuration for phi_intelligence
// Using Key Vault integration for secure secret management

export const LIVEKIT_CONFIG = {
  // Token server configuration - SEPARATE SERVERS
  PHI_TOKEN_SERVER_URL: import.meta.env.VITE_PHI_TOKEN_SERVER_URL,
  COMPANY_TOKEN_SERVER_URL: import.meta.env.VITE_COMPANY_TOKEN_SERVER_URL,
  
  // LiveKit URLs will be loaded from API
  LIVEKIT_URL: '', // Will be loaded from API
  LIVEKIT_API_KEY: '', // Will be loaded from API
  LIVEKIT_API_SECRET: '', // Will be loaded from API
  
  // Company LiveKit configuration
  LIVEKIT_COMPANY_URL: '', // Will be loaded from API
  LIVEKIT_COMPANY_API_KEY: '', // Will be loaded from API
  LIVEKIT_COMPANY_API_SECRET: '', // Will be loaded from API
  
  // Default room configuration
  DEFAULT_ROOM_TTL_MINUTES: 30,
  PARTICIPANT_NAME_PREFIX: 'phi_user',
  
  // Connection settings
  CONNECTION_TIMEOUT: 10000, // 10 seconds
  RECONNECTION_ATTEMPTS: 3,
  RECONNECTION_DELAY: 1000, // 1 second
};

// Initialize LiveKit configuration from API
export async function initializeLiveKitConfig() {
  try {
    const response = await fetch('/api/livekit/config');
    const config = await response.json();
    
    LIVEKIT_CONFIG.LIVEKIT_URL = config.phi.url;
    LIVEKIT_CONFIG.LIVEKIT_API_KEY = config.phi.apiKey;
    LIVEKIT_CONFIG.LIVEKIT_API_SECRET = config.phi.apiSecret;
    
    LIVEKIT_CONFIG.LIVEKIT_COMPANY_URL = config.company.url;
    LIVEKIT_CONFIG.LIVEKIT_COMPANY_API_KEY = config.company.apiKey;
    LIVEKIT_CONFIG.LIVEKIT_COMPANY_API_SECRET = config.company.apiSecret;
    
    console.log('✅ LiveKit configuration loaded from Key Vault');
  } catch (error) {
    console.error('❌ Failed to load LiveKit configuration:', error);
    // Fallback to environment variables
    LIVEKIT_CONFIG.LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || '';
    LIVEKIT_CONFIG.LIVEKIT_API_KEY = import.meta.env.VITE_LIVEKIT_API_KEY || '';
    LIVEKIT_CONFIG.LIVEKIT_API_SECRET = import.meta.env.VITE_LIVEKIT_API_SECRET || '';
    
    LIVEKIT_CONFIG.LIVEKIT_COMPANY_URL = import.meta.env.VITE_LIVEKIT_COMPANY_URL || '';
    LIVEKIT_CONFIG.LIVEKIT_COMPANY_API_KEY = import.meta.env.VITE_LIVEKIT_COMPANY_API_KEY || '';
    LIVEKIT_CONFIG.LIVEKIT_COMPANY_API_SECRET = import.meta.env.VITE_LIVEKIT_COMPANY_API_SECRET || '';
  }
}

// Helper function to get room configuration by mode
export const getRoomConfig = (mode = 'phi') => {
  if (mode === 'company') {
    return {
      url: LIVEKIT_CONFIG.LIVEKIT_COMPANY_URL,
      apiKey: LIVEKIT_CONFIG.LIVEKIT_COMPANY_API_KEY,
      apiSecret: LIVEKIT_CONFIG.LIVEKIT_COMPANY_API_SECRET,
      tokenServerUrl: LIVEKIT_CONFIG.COMPANY_TOKEN_SERVER_URL
    };
  }
  return {
    url: LIVEKIT_CONFIG.LIVEKIT_URL,
    apiKey: LIVEKIT_CONFIG.LIVEKIT_API_KEY,
    apiSecret: LIVEKIT_CONFIG.LIVEKIT_API_SECRET,
    tokenServerUrl: LIVEKIT_CONFIG.PHI_TOKEN_SERVER_URL
  };
};

// Helper function to generate room name by mode
export const generateRoomName = (mode = 'phi', identifier = null) => {
  const prefix = mode === 'company' ? 'company_room_' : 'phi_room_';
  const id = identifier || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return `${prefix}${id}`;
};

// Helper function to get token server URL by mode
export const getTokenServerUrl = (mode = 'phi') => {
  return mode === 'company' ? LIVEKIT_CONFIG.COMPANY_TOKEN_SERVER_URL : LIVEKIT_CONFIG.PHI_TOKEN_SERVER_URL;
};

// Room configuration
export const ROOM_CONFIG = {
  maxParticipants: 10,
  publishDefaults: {
    simulcast: true,
    videoSimulcastLayers: [
      { width: 320, height: 180, fps: 15 },
      { width: 640, height: 360, fps: 30 },
      { width: 1280, height: 720, fps: 30 }
    ]
  },
  adaptiveStream: true,
  dynacast: true
};

// Voice bot configuration
export const VOICE_BOT_CONFIG = {
  defaultLanguage: 'en-US',
  supportedLanguages: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'],
  voiceSettings: {
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0
  },
  aiModel: {
    provider: 'lm-studio',
    endpoint: import.meta.env.VITE_AI_ENDPOINT,
    model: import.meta.env.VITE_AI_MODEL || 'phi-2'
  }
};

// Error handling configuration
export const ERROR_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  connectionTimeout: 10000,
  reconnectionAttempts: 5
};

export default {
  LIVEKIT_CONFIG,
  getRoomConfig,
  generateRoomName,
  getTokenServerUrl,
  ROOM_CONFIG,
  VOICE_BOT_CONFIG,
  ERROR_CONFIG
};
