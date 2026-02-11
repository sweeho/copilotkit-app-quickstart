'use client';

import React, { useRef, useEffect } from 'react';
import { Box, Typography, useTheme, Fade, Chip } from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useAgentThoughts } from '../../hooks/useAgentThoughts';
import type { ThoughtStep } from '../../types/agent';

/** Maps backend agent_name values to display labels and colors */
const agentMeta: Record<string, { label: string; color: string }> = {
  root_agent: { label: 'Orchestrator', color: '#007AFF' },
  research_agent: { label: 'Research Agent', color: '#5856D6' },
  analysis_agent: { label: 'Analysis Agent', color: '#FF9500' },
  summary_agent: { label: 'Summary Agent', color: '#34C759' },
};

function ThoughtItem({ step }: { step: ThoughtStep }) {
  const theme = useTheme();
  const meta = agentMeta[step.agent_name] || { label: step.agent_name, color: '#9E9E9E' };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-start',
        py: 1,
        px: 1,
        borderRadius: 1.5,
        backgroundColor:
          step.status === 'running'
            ? theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(0,0,0,0.02)'
            : 'transparent',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Status icon */}
      <Box sx={{ pt: 0.25, flexShrink: 0 }}>
        {step.status === 'running' && (
          <AutorenewIcon
            sx={{
              fontSize: 18,
              color: meta.color,
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
        )}
        {step.status === 'completed' && (
          <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#34C759' }} />
        )}
        {step.status === 'error' && (
          <ErrorOutlineIcon sx={{ fontSize: 18, color: '#FF3B30' }} />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
          <Chip
            label={meta.label}
            size="small"
            sx={{
              height: 20,
              fontSize: 11,
              fontWeight: 600,
              backgroundColor: `${meta.color}18`,
              color: meta.color,
              border: `1px solid ${meta.color}30`,
            }}
          />
          {step.status === 'running' && (
            <Typography
              variant="caption"
              sx={{
                fontSize: 10,
                color: meta.color,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              In Progress
            </Typography>
          )}
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontSize: 13,
            color: theme.palette.text.secondary,
            lineHeight: 1.5,
          }}
        >
          {step.message}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ThoughtsPanel() {
  const theme = useTheme();
  const { thoughtStream, hasThoughts, activeThoughts } = useAgentThoughts();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new thoughts arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thoughtStream.length]);

  return (
    <Fade in>
      <Box
        sx={{
          width: { xs: '100%', md: 420 },
          maxWidth: { md: '40vw' },
          borderLeft: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Panel header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <PsychologyOutlinedIcon
            sx={{ color: theme.palette.primary.main, fontSize: 22 }}
          />
          <Typography variant="h3" sx={{ fontWeight: 600, fontSize: 16 }}>
            Agent Thoughts
          </Typography>
          {activeThoughts.length > 0 && (
            <Chip
              label={`${activeThoughts.length} active`}
              size="small"
              sx={{
                ml: 'auto',
                height: 20,
                fontSize: 11,
                fontWeight: 500,
                backgroundColor: 'rgba(255,149,0,0.15)',
                color: '#FF9500',
                border: '1px solid rgba(255,149,0,0.3)',
              }}
            />
          )}
        </Box>

        {/* Panel content */}
        <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1.5 }}>
          {!hasThoughts ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                color: theme.palette.text.secondary,
              }}
            >
              <PsychologyOutlinedIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1.5 }} />
              <Typography variant="body2" sx={{ opacity: 0.6 }}>
                Agent reasoning steps will stream here in real-time when you send a message.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {thoughtStream.map((step) => (
                <ThoughtItem key={step.id} step={step} />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Fade>
  );
}
