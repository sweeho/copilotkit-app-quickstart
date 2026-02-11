'use client';

import React from 'react';
import { Box, Button, useTheme, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface NewChatButtonProps {
  onClick: () => void;
}

export default function NewChatButton({ onClick }: NewChatButtonProps) {
  const theme = useTheme();

  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={<AddIcon />}
      onClick={onClick}
      sx={{
        height: 44,
        borderRadius: 2,
        borderColor: theme.palette.divider,
        color: theme.palette.text.primary,
        fontWeight: 500,
        fontSize: 15,
        textTransform: 'none',
        justifyContent: 'flex-start',
        px: 2,
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(0,0,0,0.04)',
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <Typography sx={{ fontSize: 15, fontWeight: 500 }}>New Chat</Typography>
    </Button>
  );
}
