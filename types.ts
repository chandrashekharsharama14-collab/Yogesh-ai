
export type MessageType = 'user' | 'ai' | 'image';

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

export enum ModelNames {
  TEXT = 'gemini-3-flash-preview',
  IMAGE = 'gemini-2.5-flash-image'
}
