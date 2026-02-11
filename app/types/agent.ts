export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';

// Real-time thought stream from the ADK backend via AG-UI protocol
export interface ThoughtStep {
  id: string;
  agent_name: string;
  message: string;
  status: 'running' | 'completed' | 'error';
  timestamp: string;
  duration_ms?: number;
}

// State shape exposed by the ADK agent via useCoAgent
export interface CoAgentState {
  thought_stream: ThoughtStep[];
}

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
