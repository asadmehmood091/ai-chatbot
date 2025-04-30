/* Shared domain types – import anywhere in the app */

export interface FailedMessage {
    id: string;
    chatId: string;
    userId: string;
    role: 'user' | 'assistant' | string;
    createdAt: string;   // ISO timestamp
    message: string;     // collapsed text-only body
  }
  
  export interface User {
    id: string;
    email: string;
  }
  
  export interface Conversation {
    id: string;
    title: string;
  }
  