'use client';

import React, { useState } from 'react';
import { Box, Typography, useTheme, Fade } from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import type { AgentExecution } from '../../types/agent';
import SubAgentCard from './SubAgentCard';
import MainAgentReasoning from './MainAgentReasoning';

interface ThoughtsPanelProps {
  executions: AgentExecution[];
}

export default function ThoughtsPanel({ executions }: ThoughtsPanelProps) {
  const theme = useTheme();
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  const toggleAgent = (id: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const latestExecution = executions.length > 0 ? executions[executions.length - 1] : null;

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
        </Box>

        {/* Panel content */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
          {!latestExecution ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                color: theme.palette.text.secondary,
              }}
            >
              <PsychologyOutlinedIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1.5 }} />
              <Typography variant="body2" sx={{ opacity: 0.6 }}>
                Agent orchestration details will appear here when you send a message.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Main agent reasoning */}
              <MainAgentReasoning execution={latestExecution} />

              {/* Sub-agent cards */}
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: theme.palette.text.secondary,
                    mb: 0.5,
                  }}
                >
                  Sub-Agent Executions
                </Typography>
                {latestExecution.subAgents.map((sub) => (
                  <SubAgentCard
                    key={sub.id}
                    subAgent={sub}
                    isExpanded={expandedAgents.has(sub.id)}
                    onToggle={() => toggleAgent(sub.id)}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Fade>
  );
}
