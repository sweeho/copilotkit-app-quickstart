'use client';

import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import type { SubAgentExecution, AgentStatus } from '../../types/agent';

interface SubAgentCardProps {
  subAgent: SubAgentExecution;
  isExpanded: boolean;
  onToggle: () => void;
}

const statusConfig: Record<AgentStatus, { icon: React.ReactNode; color: string }> = {
  pending: {
    icon: <HourglassEmptyIcon sx={{ fontSize: 16 }} />,
    color: '#9E9E9E',
  },
  running: {
    icon: (
      <AutorenewIcon
        sx={{
          fontSize: 16,
          animation: 'spin 1s linear infinite',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}
      />
    ),
    color: '#FF9500',
  },
  completed: {
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />,
    color: '#34C759',
  },
  failed: {
    icon: <ErrorOutlineIcon sx={{ fontSize: 16 }} />,
    color: '#FF3B30',
  },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Tooltip title={copied ? 'Copied!' : 'Copy'}>
      <IconButton size="small" onClick={handleCopy} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
        <ContentCopyIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Tooltip>
  );
}

function DataSection({
  label,
  emoji,
  bgKey,
  children,
}: {
  label: string;
  emoji: string;
  bgKey: 'input' | 'processing' | 'output' | 'metrics';
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const colors: Record<string, { bg: string; border: string }> = {
    input: {
      bg: theme.palette.mode === 'dark' ? '#0D2137' : '#E3F2FD',
      border: theme.palette.mode === 'dark' ? '#1565C0' : '#90CAF9',
    },
    processing: {
      bg: theme.palette.mode === 'dark' ? '#1A0A2E' : '#F3E5F5',
      border: theme.palette.mode === 'dark' ? '#7B1FA2' : '#CE93D8',
    },
    output: {
      bg: theme.palette.mode === 'dark' ? '#0A2410' : '#E8F5E9',
      border: theme.palette.mode === 'dark' ? '#2E7D32' : '#A5D6A7',
    },
    metrics: {
      bg: theme.palette.mode === 'dark' ? '#1A1A1A' : '#FAFAFA',
      border: theme.palette.mode === 'dark' ? '#424242' : '#E0E0E0',
    },
  };
  const c = colors[bgKey];

  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        variant="body2"
        sx={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          mb: 0.5,
          color: theme.palette.text.secondary,
        }}
      >
        {emoji} {label}
      </Typography>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1.5,
          backgroundColor: c.bg,
          border: `1px solid ${c.border}`,
          fontSize: 13,
          fontFamily: 'Monaco, Consolas, monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: 200,
          overflowY: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default function SubAgentCard({ subAgent, isExpanded, onToggle }: SubAgentCardProps) {
  const theme = useTheme();
  const config = statusConfig[subAgent.status];

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        transition: theme.transitions.create('border-color'),
        '&:hover': {
          borderColor: theme.palette.mode === 'dark'
            ? theme.palette.grey[600]
            : theme.palette.grey[400],
        },
      }}
    >
      {/* Collapsed header */}
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          backgroundColor: theme.palette.background.paper,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        {isExpanded ? (
          <ExpandLessIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
        )}

        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 14, flex: 1 }}>
          {subAgent.name}
        </Typography>

        {subAgent.duration && (
          <Typography
            variant="body2"
            sx={{ fontSize: 11, color: theme.palette.text.secondary, mr: 1 }}
          >
            {(subAgent.duration / 1000).toFixed(1)}s
          </Typography>
        )}

        <Box sx={{ color: config.color, display: 'flex', alignItems: 'center' }}>
          {config.icon}
        </Box>
      </Box>

      {/* Expanded content */}
      <Collapse in={isExpanded}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default,
          }}
        >
          {/* Input */}
          {subAgent.input && (
            <DataSection label="Input" emoji="📥" bgKey="input">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="body2" sx={{ fontSize: 13, fontFamily: 'inherit' }}>
                  {subAgent.input.formatted || JSON.stringify(subAgent.input.raw, null, 2)}
                </Typography>
                <CopyButton text={subAgent.input.formatted || JSON.stringify(subAgent.input.raw, null, 2)} />
              </Box>
            </DataSection>
          )}

          {/* Processing steps */}
          {subAgent.processing && subAgent.processing.steps.length > 0 && (
            <DataSection label="Processing" emoji="🔄" bgKey="processing">
              {subAgent.processing.steps.map((step, i) => (
                <Box key={step.id} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: 12, opacity: 0.6, fontFamily: 'inherit' }}>
                    {i + 1}.
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 12, fontFamily: 'inherit' }}>
                    {step.description}
                  </Typography>
                </Box>
              ))}
            </DataSection>
          )}

          {/* Output */}
          {subAgent.output && (
            <DataSection label="Output" emoji="📤" bgKey="output">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="body2" sx={{ fontSize: 13, fontFamily: 'inherit' }}>
                  {subAgent.output.summary || subAgent.output.formatted || JSON.stringify(subAgent.output.raw, null, 2)}
                </Typography>
                <CopyButton text={subAgent.output.formatted || JSON.stringify(subAgent.output.raw, null, 2)} />
              </Box>
            </DataSection>
          )}

          {/* Metrics */}
          {subAgent.metrics && (
            <DataSection label="Metrics" emoji="📊" bgKey="metrics">
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontSize: 12, fontFamily: 'inherit' }}>
                  ⏱ {(subAgent.metrics.executionTime / 1000).toFixed(1)}s
                </Typography>
                {subAgent.metrics.tokensUsed && (
                  <Typography variant="body2" sx={{ fontSize: 12, fontFamily: 'inherit' }}>
                    🔤 {subAgent.metrics.tokensUsed} tokens
                  </Typography>
                )}
                {subAgent.metrics.apiCalls && (
                  <Typography variant="body2" sx={{ fontSize: 12, fontFamily: 'inherit' }}>
                    🌐 {subAgent.metrics.apiCalls} API calls
                  </Typography>
                )}
                {subAgent.metrics.confidence && (
                  <Typography variant="body2" sx={{ fontSize: 12, fontFamily: 'inherit' }}>
                    ✓ {(subAgent.metrics.confidence * 100).toFixed(0)}% confidence
                  </Typography>
                )}
              </Box>
            </DataSection>
          )}

          {/* Error */}
          {subAgent.error && (
            <DataSection label="Error" emoji="❌" bgKey="metrics">
              <Typography variant="body2" sx={{ fontSize: 12, color: 'error.main', fontFamily: 'inherit' }}>
                {subAgent.error.message}
              </Typography>
            </DataSection>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
