'use client';

import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { CopilotChat } from '@copilotkit/react-ui';
import ThoughtsPanel from '../AgentThoughts/ThoughtsPanel';
import type { Session } from '../../types/session';
import type { AgentExecution } from '../../types/agent';

interface ChatViewProps {
  session: Session;
  thoughtsEnabled: boolean;
  onBackToSessions: () => void;
}

export default function ChatView({
  session,
  thoughtsEnabled,
  onBackToSessions,
}: ChatViewProps) {
  const theme = useTheme();
  const [agentExecutions] = useState<AgentExecution[]>([]);

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
