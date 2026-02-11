'use client';

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { CopilotChat } from '@copilotkit/react-ui';
import { useCoAgentStateRender } from '@copilotkit/react-core';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ThoughtsPanel from '../AgentThoughts/ThoughtsPanel';
import type { Session } from '../../types/session';
import type { CoAgentState } from '../../types/agent';

interface ChatViewProps {
  session: Session;
  thoughtsEnabled: boolean;
}

export default function ChatView({
  session,
  thoughtsEnabled,
}: ChatViewProps) {
  const theme = useTheme();

  // Optional: show a small in-chat progress indicator for active thoughts
  useCoAgentStateRender<CoAgentState>({
    name: 'my_agent',
    render: ({ state }) => {
      const running = (state.thought_stream ?? []).filter(
        (t) => t.status === 'running',
      );
      if (!running.length) return null;
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(0,0,0,0.03)',
            my: 1,
          }}
        >
          <AutorenewIcon
            sx={{
              fontSize: 16,
              color: theme.palette.primary.main,
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography
            variant="body2"
            sx={{ fontSize: 12, color: theme.palette.text.secondary }}
          >
            {running[running.length - 1].message}
          </Typography>
        </Box>
      );
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
        overflow: 'hidden',
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
        {/* Sub-header with session name */}
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
        <ThoughtsPanel />
      )}
    </Box>
  );
}
