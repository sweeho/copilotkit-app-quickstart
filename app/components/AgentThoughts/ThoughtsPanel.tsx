'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Fade,
  Chip,
  Collapse,
  IconButton,
  Divider,
} from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAgentThoughts } from '../../hooks/useAgentThoughts';
import { agentColors } from '../../theme/agentColors';
import type { ThoughtStep } from '../../types/agent';

/** Maps backend agent_name values to display labels and colors */
const agentMeta: Record<string, { label: string; color: string }> = {
  root_agent: { label: 'Orchestrator', color: '#007AFF' },
  research_agent: { label: 'Research Agent', color: '#5856D6' },
  analysis_agent: { label: 'Analysis Agent', color: '#FF9500' },
  summary_agent: { label: 'Summary Agent', color: '#34C759' },
};

const agentDisplayNames: Record<string, string> = {
  root_agent: 'Root Agent',
  research_agent: 'Research Agent',
  analysis_agent: 'Analysis Agent',
  summary_agent: 'Summary Agent',
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
  const colors = theme.palette.mode === 'dark' ? agentColors.dark : agentColors.light;
  const {
    thoughtStream,
    hasThoughts,
    activeThoughts,
    thoughtSummary,
    thoughtSummaryAgent,
    delegatedAgent,
    delegationChain,
    thinkingTokensTotal,
  } = useAgentThoughts();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(true);

  // Filter out thought summary entries from the timeline (shown separately)
  const timelineSteps = thoughtStream.filter((t) => !t.is_thought_summary);

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
          {thinkingTokensTotal > 0 && activeThoughts.length === 0 && (
            <Chip
              label={`${thinkingTokensTotal} thinking tokens`}
              size="small"
              sx={{
                ml: 'auto',
                height: 20,
                fontSize: 10,
                fontWeight: 500,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.04)',
                color: theme.palette.text.secondary,
              }}
            />
          )}
        </Box>

        {/* Panel content */}
        <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1.5 }}>
          {!hasThoughts && !thoughtSummary && delegationChain.length === 0 ? (
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* ── Tier 1: Gemini Thought Summary ── */}
              {thoughtSummary && (
                <Box
                  sx={{
                    borderRadius: 2,
                    backgroundColor: colors.thoughtSummary,
                    borderLeft: `3px solid ${colors.thoughtSummaryBorder}`,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    onClick={() => setSummaryExpanded((p) => !p)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.5,
                      py: 1,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <PsychologyOutlinedIcon
                      sx={{ fontSize: 16, color: colors.thoughtSummaryBorder }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.thoughtSummaryText,
                      }}
                    >
                      Model Thinking
                    </Typography>
                    {thoughtSummaryAgent && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: 11,
                          color: colors.thoughtSummaryText,
                          opacity: 0.7,
                        }}
                      >
                        ({agentDisplayNames[thoughtSummaryAgent] ?? thoughtSummaryAgent})
                      </Typography>
                    )}
                    <Box sx={{ flex: 1 }} />
                    <IconButton size="small" sx={{ p: 0.25 }}>
                      {summaryExpanded ? (
                        <ExpandLessIcon sx={{ fontSize: 14, color: colors.thoughtSummaryText }} />
                      ) : (
                        <ExpandMoreIcon sx={{ fontSize: 14, color: colors.thoughtSummaryText }} />
                      )}
                    </IconButton>
                  </Box>
                  <Collapse in={summaryExpanded}>
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
                        {thoughtSummary}
                      </Typography>
                    </Box>
                  </Collapse>
                </Box>
              )}

              {/* ── Tier 2: Agent Delegation Indicator ── */}
              {delegationChain.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 0.75,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: colors.delegationBadge,
                    border: `1px solid ${colors.delegationBadgeBorder}`,
                  }}
                >
                  <AccountTreeOutlinedIcon
                    sx={{ fontSize: 16, color: colors.delegationBadgeText, mt: 0.25 }}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: colors.delegationBadgeText,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Current Delegation
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mt: 0.5,
                        flexWrap: 'wrap',
                      }}
                    >
                      {delegationChain.map((agent, i) => {
                        const isActive = agent === delegatedAgent;
                        const displayName = agentDisplayNames[agent] ?? agent;
                        return (
                          <React.Fragment key={`${agent}-${i}`}>
                            {i > 0 && (
                              <ArrowForwardIosIcon
                                sx={{
                                  fontSize: 8,
                                  color: colors.delegationBadgeText,
                                  opacity: 0.5,
                                }}
                              />
                            )}
                            <Typography
                              component="span"
                              sx={{
                                fontSize: 12,
                                fontWeight: isActive ? 700 : 400,
                                color: colors.delegationBadgeText,
                                opacity: isActive ? 1 : 0.7,
                              }}
                            >
                              {displayName}
                              {isActive && ' ●'}
                            </Typography>
                          </React.Fragment>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* ── Tier 3: Agent Execution Timeline ── */}
              {timelineSteps.length > 0 && (
                <>
                  {(thoughtSummary || delegationChain.length > 0) && (
                    <Divider sx={{ my: 0.5, opacity: 0.5 }} />
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {timelineSteps.map((step) => (
                      <ThoughtItem key={step.id} step={step} />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Fade>
  );
}
