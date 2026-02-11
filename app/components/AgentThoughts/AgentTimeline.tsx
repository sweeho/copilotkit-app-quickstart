'use client';

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import type { AgentExecution, AgentStatus } from '../../types/agent';

interface AgentTimelineProps {
  execution: AgentExecution;
}

const statusIcon: Record<AgentStatus, React.ReactNode> = {
  pending: <HourglassEmptyIcon sx={{ fontSize: 18, color: '#9E9E9E' }} />,
  running: (
    <AutorenewIcon
      sx={{
        fontSize: 18,
        color: '#FF9500',
        animation: 'spin 1s linear infinite',
        '@keyframes spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      }}
    />
  ),
  completed: <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#34C759' }} />,
  failed: <ErrorOutlineIcon sx={{ fontSize: 18, color: '#FF3B30' }} />,
};

const statusColor: Record<AgentStatus, string> = {
  pending: '#9E9E9E',
  running: '#FF9500',
  completed: '#34C759',
  failed: '#FF3B30',
};

export default function AgentTimeline({ execution }: AgentTimelineProps) {
  const theme = useTheme();

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: theme.palette.text.secondary,
          mb: 1.5,
        }}
      >
        Execution Timeline
      </Typography>

      <Box sx={{ position: 'relative', pl: 3 }}>
        {/* Main agent node */}
        <TimelineNode
          name={execution.mainAgent.name || 'Orchestrator'}
          status={execution.status}
          isMain
        />

        {/* Vertical line */}
        <Box
          sx={{
            position: 'absolute',
            left: 9,
            top: 24,
            bottom: execution.subAgents.length > 0 ? 12 : 0,
            width: 2,
            backgroundColor: theme.palette.divider,
          }}
        />

        {/* Sub-agent nodes */}
        {execution.subAgents.map((sub, index) => (
          <Box key={sub.id} sx={{ position: 'relative', ml: 2 }}>
            {/* Horizontal connector */}
            <Box
              sx={{
                position: 'absolute',
                left: -16,
                top: 11,
                width: 14,
                height: 2,
                backgroundColor: theme.palette.divider,
              }}
            />
            <TimelineNode
              name={sub.name}
              status={sub.status}
              duration={sub.duration}
              output={sub.output?.summary}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function TimelineNode({
  name,
  status,
  isMain = false,
  duration,
  output,
}: {
  name: string;
  status: AgentStatus;
  isMain?: boolean;
  duration?: number;
  output?: string;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        py: 0.75,
        position: 'relative',
      }}
    >
      {/* Node dot */}
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          left: isMain ? -12 : 0,
        }}
      >
        {statusIcon[status]}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, ml: isMain ? -0.5 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: isMain ? 600 : 500,
              fontSize: isMain ? 13 : 12,
              color: theme.palette.text.primary,
            }}
          >
            {name}
          </Typography>
          {duration && (
            <Typography
              variant="body2"
              sx={{ fontSize: 11, color: theme.palette.text.secondary }}
            >
              ({(duration / 1000).toFixed(1)}s)
            </Typography>
          )}
        </Box>
        {output && (
          <Typography
            variant="body2"
            sx={{
              fontSize: 11,
              color: theme.palette.text.secondary,
              mt: 0.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            → {output}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
