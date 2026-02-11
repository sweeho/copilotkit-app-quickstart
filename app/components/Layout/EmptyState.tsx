'use client';

import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';

interface EmptyStateProps {
  onNewChat: () => void;
}

export default function EmptyState({ onNewChat }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 4,
      }}
    >
      <SmartToyOutlinedIcon
        sx={{
          fontSize: 64,
          color: theme.palette.text.secondary,
          opacity: 0.3,
        }}
      />
      <Typography
        variant="h2"
        sx={{
          fontSize: 22,
          fontWeight: 600,
          color: theme.palette.text.primary,
        }}
      >
        Welcome back!
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          textAlign: 'center',
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        No conversations yet. Start a new chat to begin exploring with your AI
        assistant.
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddCommentOutlinedIcon />}
        onClick={onNewChat}
        sx={{
          mt: 1,
          px: 3,
          py: 1.25,
          borderRadius: 2,
          fontSize: 15,
          fontWeight: 500,
          textTransform: 'none',
        }}
      >
        Create New Chat
      </Button>
    </Box>
  );
}
