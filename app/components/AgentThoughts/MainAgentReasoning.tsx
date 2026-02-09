'use client';

import React from 'react';
import { Box, Typography, useTheme, Chip } from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import type { AgentExecution } from '../../types/agent';

interface MainAgentReasoningProps {
  execution: AgentExecution;
}

const statusLabel: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#9E9E9E' },
  running: { label: 'Running', color: '#FF9500' },
  completed: { label: 'Completed', color: '#34C759' },
  failed: { label: 'Failed', color: '#FF3B30' },
};

export default function MainAgentReasoning({ execution }: MainAgentReasoningProps) {
  const theme = useTheme();
  const status = statusLabel[execution.status] || statusLabel.pending;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(10,132,255,0.08)'
          : 'rgba(0,122,255,0.04)',
        border: `1px solid ${theme.palette.mode === 'dark'
          ? 'rgba(10,132,255,0.2)'
          : 'rgba(0,122,255,0.12)'}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <AccountTreeOutlinedIcon
          sx={{ fontSize: 18, color: theme.palette.primary.main }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
          {execution.mainAgent.name || 'Main Orchestrator'}
        </Typography>
        <Chip
          label={status.label}
          size="small"
          sx={{
            ml: 'auto',
            height: 22,
            fontSize: 11,
            fontWeight: 500,
            backgroundColor: `${status.color}20`,
            color: status.color,
            border: `1px solid ${status.color}40`,
          }}
        />
      </Box>

      {execution.mainAgent.reasoning && (
        <Typography
          variant="body2"
          sx={{
            fontSize: 13,
            lineHeight: 1.5,
            color: theme.palette.text.secondary,
            mb: 1,
          }}
        >
          {execution.mainAgent.reasoning}
        </Typography>
      )}

      {execution.mainAgent.strategy && (
        <Typography
          variant="body2"
          sx={{
            fontSize: 12,
            color: theme.palette.text.secondary,
            opacity: 0.8,
          }}
        >
          Strategy: {execution.mainAgent.strategy}
        </Typography>
      )}

      {execution.mainAgent.subAgentsToInvoke && execution.mainAgent.subAgentsToInvoke.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
          {execution.mainAgent.subAgentsToInvoke.map((name) => (
            <Chip
              key={name}
              label={name}
              size="small"
              variant="outlined"
              sx={{ fontSize: 11, height: 22 }}
            />
          ))}
        </Box>
      )}

      {execution.totalDuration && (
        <Typography
          variant="body2"
          sx={{
            fontSize: 11,
            color: theme.palette.text.secondary,
            mt: 1,
            opacity: 0.7,
          }}
        >
          Total: {(execution.totalDuration / 1000).toFixed(1)}s
        </Typography>
      )}
    </Box>
  );
}
