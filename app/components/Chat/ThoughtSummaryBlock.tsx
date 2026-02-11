'use client';

import React, { useState } from 'react';
import { Box, Typography, IconButton, Collapse, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import { agentColors } from '../../theme/agentColors';
import AgentDelegationBadge from './AgentDelegationBadge';

interface ThoughtSummaryBlockProps {
  /** The Gemini thought summary text */
  summary: string;
  /** Which agent produced this summary */
  agentName?: string;
  /** Start expanded (true for latest message, false for older) */
  defaultExpanded?: boolean;
  /** Delegation chain, e.g. ["root_agent", "research_agent"] */
  delegationChain?: string[];
  /** Currently active agent */
  delegatedAgent?: string | null;
}

/**
 * Collapsible block that displays a Gemini thought summary.
 * Displayed before the assistant response text when Thoughts toggle is ON.
 */
export default function ThoughtSummaryBlock({
  summary,
  agentName,
  defaultExpanded = true,
  delegationChain,
  delegatedAgent,
}: ThoughtSummaryBlockProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const colors = theme.palette.mode === 'dark' ? agentColors.dark : agentColors.light;

  return (
    <Box
      sx={{
        borderRadius: 2,
        backgroundColor: colors.thoughtSummary,
        borderLeft: `3px solid ${colors.thoughtSummaryBorder}`,
        my: 1,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header — always visible */}
      <Box
        onClick={() => setExpanded((prev) => !prev)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.5,
          py: 1,
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.03)'
                : 'rgba(0,0,0,0.02)',
          },
        }}
      >
        <PsychologyOutlinedIcon
          sx={{ fontSize: 18, color: colors.thoughtSummaryBorder }}
        />
        <Typography
          variant="caption"
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: colors.thoughtSummaryText,
            letterSpacing: '0.02em',
          }}
        >
          Model Thinking
        </Typography>
        {agentName && (
          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              color: colors.thoughtSummaryText,
              opacity: 0.7,
              ml: 0.5,
            }}
          >
            ({agentName})
          </Typography>
        )}
        <Box sx={{ flex: 1 }} />
        <IconButton size="small" sx={{ p: 0.25 }}>
          {expanded ? (
            <ExpandLessIcon sx={{ fontSize: 16, color: colors.thoughtSummaryText }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 16, color: colors.thoughtSummaryText }} />
          )}
        </IconButton>
      </Box>

      {/* Content — collapsible */}
      <Collapse in={expanded}>
        <Box sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: 13,
              lineHeight: 1.6,
              fontStyle: 'italic',
              color: colors.thoughtSummaryText,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {summary}
          </Typography>

          {/* Delegation badge — inside the thought bubble */}
          {delegationChain && delegationChain.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <AgentDelegationBadge
                delegationChain={delegationChain}
                delegatedAgent={delegatedAgent}
              />
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
