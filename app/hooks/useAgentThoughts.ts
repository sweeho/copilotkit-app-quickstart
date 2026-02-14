'use client';

import { useCoAgent } from '@copilotkit/react-core';
import type { CoAgentState, ThoughtStep } from '../types/agent';

/**
 * Hook that subscribes to the real-time agent thought stream,
 * Gemini thought summaries, and agent delegation info
 * via the AG-UI protocol / useCoAgent state.
 */
export function useAgentThoughts() {
  const { state } = useCoAgent<CoAgentState>({
    name: 'my_agent', // must match the agent key in CopilotRuntime (route.ts)
    initialState: {
      thought_stream: [],
    },
  });

  const thoughtStream: ThoughtStep[] = state.thought_stream ?? [];

  return {
    // Existing: tool-emitted thought stream
    thoughtStream,
    hasThoughts: thoughtStream.length > 0,
    activeThoughts: thoughtStream.filter((t) => t.status === 'running'),
    completedThoughts: thoughtStream.filter((t) => t.status === 'completed'),
    errorThoughts: thoughtStream.filter((t) => t.status === 'error'),

    // NEW: Gemini native thought summary
    thoughtSummary: state.thought_summary ?? null,
    thoughtSummaryAgent: state.thought_summary_agent ?? null,
    thoughtSummaries: thoughtStream.filter((t) => t.is_thought_summary),

    // NEW: Agent delegation tracking
    delegatedAgent: state.delegated_agent ?? null,
    delegationChain: state.delegation_chain ?? [],

    // NEW: Thinking tokens
    thinkingTokensTotal: state.thinking_tokens_total ?? 0,
  };
}
