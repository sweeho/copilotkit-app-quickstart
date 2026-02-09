export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ProcessingStep {
  id: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'skipped';
  details?: string;
}

export interface AgentMetrics {
  executionTime: number;
  tokensUsed?: number;
  apiCalls?: number;
  confidence?: number;
}

export interface SubAgentExecution {
  id: string;
  name: string;
  status: AgentStatus;
  startTime?: string;
  endTime?: string;
  duration?: number;
  input?: {
    raw: unknown;
    formatted: string;
    source?: string;
  };
  processing?: {
    steps: ProcessingStep[];
    toolsUsed: string[];
  };
  output?: {
    raw: unknown;
    formatted: string;
    summary: string;
  };
  metrics?: AgentMetrics;
  error?: {
    message: string;
    code?: string;
    recoverable: boolean;
  };
  parentAgent?: string;
}

export interface AgentExecution {
  id: string;
  messageId: string;
  status: AgentStatus;
  startTime: string;
  endTime?: string;
  mainAgent: {
    id: string;
    name: string;
    reasoning?: string;
    strategy?: string;
    subAgentsToInvoke?: string[];
  };
  subAgents: SubAgentExecution[];
  totalDuration?: number;
}
