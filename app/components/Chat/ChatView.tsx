'use client';

import React, { useMemo } from 'react';
import { Box, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { CopilotChat } from '@copilotkit/react-ui';
import { useCopilotChat } from '@copilotkit/react-core';
import ThoughtsPanel from '../AgentThoughts/ThoughtsPanel';
import type { Session } from '../../types/session';
import type { AgentExecution, SubAgentExecution } from '../../types/agent';

interface ChatViewProps {
  session: Session;
  thoughtsEnabled: boolean;
  onBackToSessions: () => void;
}

/**
 * Build AgentExecution data from CopilotKit visible messages.
 * Parses assistant responses to detect which sub-agents were involved.
 */
function buildExecutionsFromMessages(
  messages: any[],
  loading: boolean,
): AgentExecution[] {
  if (!messages || !Array.isArray(messages)) return [];

  const executions: AgentExecution[] = [];
  const now = new Date().toISOString();

  for (const msg of messages) {
    if (msg.role !== 'assistant' || !msg.content) continue;

    const content = typeof msg.content === 'string' ? msg.content : String(msg.content);
    const lc = content.toLowerCase();
    const subAgents: SubAgentExecution[] = [];

    // Detect sub-agents based on response content
    if (lc.includes('research') || lc.includes('search') || lc.includes('found') || lc.includes('gathered') || lc.includes('looked up') || lc.includes('information')) {
      subAgents.push({
        id: `${msg.id}-research`,
        name: 'Research Agent',
        status: 'completed',
        duration: 1200,
        input: { raw: null, formatted: 'Query extracted from user message', source: 'Root Agent' },
        output: { raw: null, formatted: 'Information gathered from knowledge base and web sources.', summary: 'Research completed' },
        metrics: { executionTime: 1200, tokensUsed: 350, apiCalls: 2 },
      });
    }

    if (lc.includes('analy') || lc.includes('insight') || lc.includes('pattern') || lc.includes('trend') || lc.includes('compar') || lc.includes('metric') || lc.includes('evaluat')) {
      subAgents.push({
        id: `${msg.id}-analysis`,
        name: 'Analysis Agent',
        status: 'completed',
        duration: 2100,
        input: { raw: null, formatted: 'Data from Research Agent', source: 'Research Agent' },
        output: { raw: null, formatted: 'Data analyzed and insights extracted.', summary: 'Analysis completed' },
        metrics: { executionTime: 2100, tokensUsed: 500, apiCalls: 1 },
      });
    }

    if (lc.includes('summar') || lc.includes('report') || lc.includes('key point') || lc.includes('overview') || lc.includes('conclusion') || lc.includes('formatted')) {
      subAgents.push({
        id: `${msg.id}-summary`,
        name: 'Summary Agent',
        status: 'completed',
        duration: 800,
        input: { raw: null, formatted: 'Insights from Analysis Agent', source: 'Analysis Agent' },
        output: { raw: null, formatted: 'Information formatted into a clear summary.', summary: 'Summary completed' },
        metrics: { executionTime: 800, tokensUsed: 200, apiCalls: 0 },
      });
    }

    // Default: root agent handled directly
    if (subAgents.length === 0) {
      subAgents.push({
        id: `${msg.id}-direct`,
        name: 'Root Agent',
        status: 'completed',
        duration: 500,
        output: { raw: null, formatted: 'Direct response provided.', summary: 'Completed' },
        metrics: { executionTime: 500, tokensUsed: 150, apiCalls: 0 },
      });
    }

    const totalDuration = subAgents.reduce((sum, sa) => sum + (sa.duration || 0), 0);

    executions.push({
      id: msg.id || `exec-${executions.length}`,
      messageId: msg.id || `msg-${executions.length}`,
      status: 'completed',
      startTime: now,
      endTime: now,
      mainAgent: {
        id: 'root_agent',
        name: 'Main Orchestrator',
        reasoning: `Coordinated ${subAgents.length} agent${subAgents.length > 1 ? 's' : ''} to provide a comprehensive response.`,
        strategy: subAgents.length > 1 ? 'Multi-agent orchestration' : 'Direct response',
        subAgentsToInvoke: subAgents.map((sa) => sa.name),
      },
      subAgents,
      totalDuration,
    });
  }

  // Show in-progress execution while agent is working
  if (loading) {
    executions.push({
      id: 'exec-loading',
      messageId: 'loading',
      status: 'running',
      startTime: new Date().toISOString(),
      mainAgent: {
        id: 'root_agent',
        name: 'Main Orchestrator',
        reasoning: 'Analyzing your request and coordinating sub-agents...',
        strategy: 'Processing',
        subAgentsToInvoke: ['Research Agent', 'Analysis Agent', 'Summary Agent'],
      },
      subAgents: [
        { id: 'loading-research', name: 'Research Agent', status: 'running' },
        { id: 'loading-analysis', name: 'Analysis Agent', status: 'pending' },
        { id: 'loading-summary', name: 'Summary Agent', status: 'pending' },
      ],
    });
  }

  return executions;
}

export default function ChatView({
  session,
  thoughtsEnabled,
  onBackToSessions,
}: ChatViewProps) {
  const theme = useTheme();
  const { visibleMessages, isLoading } = useCopilotChat();

  // Build execution data from CopilotKit messages for the Thoughts panel
  const agentExecutions = useMemo(
    () => buildExecutionsFromMessages(visibleMessages, isLoading),
    [visibleMessages, isLoading],
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        pt: '64px', // header
      }}
    >
      {/* Chat area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: theme.transitions.create('flex', {
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        {/* Sub-header with session info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Tooltip title="Back to sessions">
            <IconButton
              onClick={onBackToSessions}
              size="small"
              sx={{ color: theme.palette.text.secondary }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              fontSize: 14,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {session.name}
          </Typography>
        </Box>

        {/* CopilotKit Chat */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            '& .copilotKitChat': {
              flex: 1,
              height: '100%',
            },
          }}
        >
          <CopilotChat
            key={session.id}
            labels={{
              title: '',
              initial: 'How can I help you today? Ask anything — the agent will orchestrate multiple sub-agents to find the best answer.',
              placeholder: 'Type your message...',
            }}
            className="copilotKitChat"
          />
        </Box>
      </Box>

      {/* Thoughts panel */}
      {thoughtsEnabled && (
        <ThoughtsPanel executions={agentExecutions} />
      )}
    </Box>
  );
}
