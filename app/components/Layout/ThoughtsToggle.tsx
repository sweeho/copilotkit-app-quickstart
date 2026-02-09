'use client';

import React from 'react';
import { IconButton, Tooltip, useTheme, Typography, Box } from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import PsychologyIcon from '@mui/icons-material/Psychology';

interface ThoughtsToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function ThoughtsToggle({ enabled, onToggle }: ThoughtsToggleProps) {
  const theme = useTheme();

  return (
    <Tooltip title={enabled ? 'Hide agent thoughts' : 'Show agent thoughts'}>
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          backgroundColor: enabled
            ? theme.palette.mode === 'dark'
              ? 'rgba(10,132,255,0.15)'
              : 'rgba(0,122,255,0.08)'
            : 'transparent',
          border: `1px solid ${enabled ? theme.palette.primary.main : theme.palette.divider}`,
          transition: theme.transitions.create(['background-color', 'border-color'], {
            duration: theme.transitions.duration.short,
          }),
          '&:hover': {
            backgroundColor: enabled
              ? theme.palette.mode === 'dark'
                ? 'rgba(10,132,255,0.25)'
                : 'rgba(0,122,255,0.12)'
              : theme.palette.action.hover,
          },
          userSelect: 'none',
        }}
      >
        {enabled ? (
          <PsychologyIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
        ) : (
          <PsychologyOutlinedIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
        )}
        <Typography
          variant="body2"
          sx={{
            color: enabled ? theme.palette.primary.main : theme.palette.text.secondary,
            fontWeight: 500,
            fontSize: 13,
          }}
        >
          Thoughts
        </Typography>
      </Box>
    </Tooltip>
  );
}
