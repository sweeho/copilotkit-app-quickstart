'use client';

import { useCoAgent } from '@copilotkit/react-core';
import type { CoAgentState, ThoughtStep } from '../types/agent';

/**
 * Hook that subscribes to the real-time agent thought stream
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
    thoughtStream,
    hasThoughts: thoughtStream.length > 0,
    activeThoughts: thoughtStream.filter((t) => t.status === 'running'),
    completedThoughts: thoughtStream.filter((t) => t.status === 'completed'),
    errorThoughts: thoughtStream.filter((t) => t.status === 'error'),
  };
}
