'use client';

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { agentColors } from '../../theme/agentColors';

/** Maps backend agent_name values to display labels */
const agentDisplayNames: Record<string, string> = {
  root_agent: 'Root Agent',
  research_agent: 'Research Agent',
  analysis_agent: 'Analysis Agent',
  summary_agent: 'Summary Agent',
};

interface AgentDelegationBadgeProps {
  /** The current delegation chain, e.g. ["root_agent", "research_agent"] */
  delegationChain: string[];
  /** Which agent is currently active */
  delegatedAgent?: string | null;
}

/**
 * Pill-shaped badge showing the agent delegation chain as a breadcrumb.
 * e.g.  🔀 Root Agent → Research Agent → Summary Agent
 */
export default function AgentDelegationBadge({
  delegationChain,
  delegatedAgent,
}: AgentDelegationBadgeProps) {
  const theme = useTheme();
  const colors = theme.palette.mode === 'dark' ? agentColors.dark : agentColors.light;

  if (!delegationChain.length) return null;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.25,
        py: 0.5,
        borderRadius: 3,
        backgroundColor: colors.delegationBadge,
        border: `1px solid ${colors.delegationBadgeBorder}`,
        my: 0.5,
        flexWrap: 'wrap',
      }}
    >
      <AccountTreeOutlinedIcon
        sx={{ fontSize: 14, color: colors.delegationBadgeText }}
      />
      {delegationChain.map((agent, i) => {
        const isActive = agent === delegatedAgent;
        const displayName = agentDisplayNames[agent] ?? agent;
        const isLast = i === delegationChain.length - 1;

        return (
          <React.Fragment key={`${agent}-${i}`}>
            {i > 0 && (
              <ArrowForwardIosIcon
                sx={{
                  fontSize: 9,
                  color: colors.delegationBadgeText,
                  opacity: 0.6,
                  mx: 0.25,
                }}
              />
            )}
            <Typography
              component="span"
              sx={{
                fontSize: 12,
                fontWeight: isActive || isLast ? 600 : 400,
                color: colors.delegationBadgeText,
                opacity: isActive || isLast ? 1 : 0.75,
              }}
            >
              {displayName}
            </Typography>
          </React.Fragment>
        );
      })}
    </Box>
  );
}
