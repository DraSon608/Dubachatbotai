export type ModelMode = 'auto' | 'cloud' | 'offline';

export interface AutomationMeta {
  executionTimeMs?: number;
  toolUsed?: string;
  codeExecuted?: boolean;
  sandboxOutput?: string;
  isOffline?: boolean;
  tokensEstimated?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelUsed?: 'gemini-3.8-flash' | 'duba-offline-core' | 'system';
  isStreaming?: boolean;
  error?: string;
  automationMeta?: AutomationMeta;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  modelMode: ModelMode;
  systemPrompt?: string;
  isPinned?: boolean;
}

export interface UserSettings {
  modelMode: ModelMode;
  forceOffline: boolean;
  speechEnabled: boolean;
  speechRate: number;
  speechPitch: number;
  selectedVoiceURI: string;
  autoScroll: boolean;
  codeFontSize: 'sm' | 'md' | 'lg';
  systemPrompt: string;
  language: 'en' | 'dz';
  autoInterpretOnline: boolean;
}

export type NetworkConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'unknown' | 'none';

export interface NetworkTelemetry {
  isOnline: boolean;
  connectionType: NetworkConnectionType;
  effectiveType?: string;
  downlinkMbps?: number;
  pingMs: number | null;
  serverReachable: boolean;
  lastChecked: number;
}

export interface ServerHealth {
  status: string;
  online: boolean;
  hasApiKey: boolean;
  model: string;
  timestamp: number;
}
