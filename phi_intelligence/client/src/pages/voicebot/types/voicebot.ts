// Voice Bot Types

export interface Voice {
  id: number;
  name: string;
  type: string;
  audio: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
  tone: 'professional' | 'casual' | 'energetic' | 'calm';
}

export interface Template {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  characteristics: string[];
  useCases: string[];
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'empathetic';
}

export interface VoiceBotConfiguration {
  id?: string;
  name: string;
  selectedVoice: Voice;
  selectedTemplate: Template;
  uploadedFiles: File[];
  status: 'draft' | 'building' | 'ready' | 'active' | 'error';
  createdAt?: Date;
  updatedAt?: Date;
  settings?: VoiceBotSettings;
}

export interface VoiceBotSettings {
  responseDelay: number; // milliseconds
  maxResponseLength: number; // characters
  enableInterruptions: boolean;
  enableEmotions: boolean;
  language: string;
  accent: string;
  speakingRate: number; // 0.5 to 2.0
  pitch: number; // 0.5 to 2.0
  volume: number; // 0.0 to 1.0
}

export interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  uploadedAt: Date;
  content?: string; // Extracted text content
}

export interface VoiceBotSession {
  id: string;
  configurationId: string;
  startTime: Date;
  endTime?: Date;
  messages: VoiceBotMessage[];
  status: 'active' | 'paused' | 'ended';
}

export interface VoiceBotMessage {
  id: string;
  sessionId: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  duration?: number; // milliseconds
}

export interface VoiceBotAnalytics {
  sessionId: string;
  totalMessages: number;
  averageResponseTime: number;
  userSatisfaction?: number;
  mostUsedFeatures: string[];
  errorRate: number;
  uptime: number; // percentage
}

// API Response Types
export interface VoiceBotResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface VoiceBotListResponse extends VoiceBotResponse {
  data: VoiceBotConfiguration[];
}

export interface VoiceBotCreateResponse extends VoiceBotResponse {
  data: VoiceBotConfiguration;
}

export interface VoiceBotUpdateResponse extends VoiceBotResponse {
  data: VoiceBotConfiguration;
}

export interface VoiceBotDeleteResponse extends VoiceBotResponse {
  data: { id: string; deleted: boolean };
}

// Voice Bot Builder State
export interface VoiceBotBuilderState {
  currentStep: number;
  selectedVoice: Voice | null;
  selectedTemplate: Template | null;
  uploadedFiles: DocumentFile[];
  botStatus: 'ready' | 'building' | 'testing' | 'active';
  isListening: boolean;
  isSpeaking: boolean;
  currentMessage: string;
  error?: string;
}

// Voice Bot API Endpoints
export const VOICEBOT_ENDPOINTS = {
  CREATE: '/api/voicebot/create',
  UPDATE: '/api/voicebot/update',
  DELETE: '/api/voicebot/delete',
  LIST: '/api/voicebot/list',
  GET: '/api/voicebot/get',
  TEST: '/api/voicebot/test',
  DEPLOY: '/api/voicebot/deploy',
  ANALYTICS: '/api/voicebot/analytics'
} as const;

// Voice Bot Configuration Defaults
export const DEFAULT_VOICEBOT_SETTINGS: VoiceBotSettings = {
  responseDelay: 1000,
  maxResponseLength: 500,
  enableInterruptions: true,
  enableEmotions: true,
  language: 'en-US',
  accent: 'american',
  speakingRate: 1.0,
  pitch: 1.0,
  volume: 0.8
};

// Supported File Types
export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown'
] as const;

export const SUPPORTED_FILE_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'] as const;

// Voice Bot Status Types
export type VoiceBotStatus = 'draft' | 'building' | 'ready' | 'active' | 'error';
export type VoiceBotBuilderStatus = 'ready' | 'building' | 'testing' | 'active';
export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'error';
export type SessionStatus = 'active' | 'paused' | 'ended';
