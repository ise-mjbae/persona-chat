export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  emotionTone?: string;
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

// 페르소나 관련 타입들
export type Gender = '남성' | '여성';
export type AgeGroup = '20대 초반' | '20대 후반' | '30대 초반' | '30대 후반' | '40대 초반' | '40대 후반' | '50대 초반' | '50대 후반' | '60대 초반' | '60대 후반';
export type PersonalityType = '신중한 고객' | '급한 고객' | '가격 민감형 고객';

export interface VoiceActor {
  id: string;
  name: string;
  gender: Gender;
  supportedEmotionTones: string[];
}

export interface Persona {
  id: string;
  name: string;
  gender: Gender;
  ageGroup: AgeGroup;
  personalityType: PersonalityType;
  additionalTraits: string;
  voiceActorId: string;
  tempo: number;
  volume: number;
  pitch: number;
  createdAt: Date;
  updatedAt: Date;
}

// 학습 관련 타입들
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  order: number;
}

export interface PersonaCondition {
  personaId: string;
  satisfactionCondition: string;
}

export interface Learning {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  connectedPersonas: PersonaCondition[];
  purpose: string;
  generatedChats: { [personaId: string]: ChatMessage[] };
  createdAt: Date;
  updatedAt: Date;
}

// 상수들
export const VOICE_ACTORS: VoiceActor[] = [
  { 
    id: '6596849ea3ecaa12a8b13989', 
    name: '봉규', 
    gender: '남성',
    supportedEmotionTones: ['normal-1', 'angry-1']
  },
  { 
    id: '6335062fd260d463f7d7abb9', 
    name: '현주', 
    gender: '여성',
    supportedEmotionTones: ['normal-1', 'angry-1', 'happy-1', 'sad-1']
  },
  { 
    id: '618b1849ef7827cfea34ea1e', 
    name: '한준', 
    gender: '남성',
    supportedEmotionTones: ['normal-1', 'angry-1', 'happy-1', 'sad-1']
  },
  { 
    id: '61e748d0fd9fb2d2cacbb04d', 
    name: '예나', 
    gender: '여성',
    supportedEmotionTones: ['normal-1', 'angry-1', 'happy-1', 'sad-1']
  },
  { 
    id: '6059dad0b83880769a50502f', 
    name: '박창수(사투리)', 
    gender: '남성',
    supportedEmotionTones: ['normal-1', 'angry-1', 'happy-1', 'sad-1']
  },
  { 
    id: '60ad08c829e878c3c7d73965', 
    name: '창배 (60대)', 
    gender: '남성',
    supportedEmotionTones: ['normal-1', 'angry-1', 'happy-1', 'sad-1']
  }
];

export const AGE_GROUPS: AgeGroup[] = [
  '20대 초반', '20대 후반', '30대 초반', '30대 후반',
  '40대 초반', '40대 후반', '50대 초반', '50대 후반',
  '60대 초반', '60대 후반'
];

export const PERSONALITY_TYPES: PersonalityType[] = [
  '신중한 고객', '급한 고객', '가격 민감형 고객'
];