export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  data?: any;
  isError?: boolean;
}

export interface ChatResponse {
  type: 'success' | 'error' | 'help';
  command?: string;
  parameters?: Record<string, any>;
  data?: any;
  error?: string;
  content?: string;
}

export interface WPEngineApiResponse {
  results?: any[];
  [key: string]: any;
}