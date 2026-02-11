export interface Session {
  id: string;
  name: string;
  userId?: string;
  description?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  messageCount: number;
  lastMessagePreview?: string;
  agentCount?: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentExecutionId?: string;
}
