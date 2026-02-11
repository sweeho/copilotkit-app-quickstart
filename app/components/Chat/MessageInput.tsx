'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  TextField,
  useTheme,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';

interface MessageInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  onStop?: () => void;
}

export default function MessageInput({ onSend, isLoading, onStop }: MessageInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const theme = useTheme();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue('');
  }, [value, isLoading, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <Box
      sx={{
        borderTop: `1px solid ${theme.palette.divider}`,
        px: 3,
        py: 2,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          maxWidth: 800,
          mx: 'auto',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          px: 2,
          py: 0.5,
          transition: theme.transitions.create('border-color'),
          '&:focus-within': {
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        <TextField
          inputRef={inputRef}
          multiline
          maxRows={6}
          fullWidth
          placeholder="Type your message..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: 15,
              py: 1,
            },
          }}
        />
        {isLoading ? (
          <Tooltip title="Stop generation">
            <IconButton
              onClick={onStop}
              size="small"
              sx={{
                color: theme.palette.error.main,
                mb: 0.5,
              }}
            >
              <StopCircleOutlinedIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Send message (Enter)">
            <span>
              <IconButton
                onClick={handleSend}
                disabled={!value.trim()}
                size="small"
                sx={{
                  color: value.trim()
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                  mb: 0.5,
                  transition: theme.transitions.create('color'),
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
      <Box
        sx={{
          textAlign: 'center',
          mt: 1,
          color: theme.palette.text.secondary,
          fontSize: 11,
          opacity: 0.6,
        }}
      >
        Press Enter to send · Shift+Enter for new line
      </Box>
    </Box>
  );
}
