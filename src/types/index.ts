export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface Settings {
  openaiKey: string;
  typecastKey: string;
  actorId: string;
  tempo: number;
  volume: number;
  pitch: number;
  emotionTone: string;
  scenario: string;
}

export interface ConversationHistory {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AppState {
  messages: Message[];
  settings: Settings;
  isSpeaking: boolean;
  status: string;
  isStatusSpeaking: boolean;
  conversationHistory: ConversationHistory[];
}