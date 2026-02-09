'use client';

import React, { useRef, useEffect } from 'react';
import { Box, Typography, useTheme, Avatar } from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import type { ChatMessage } from '../../types/session';

interface MessageProps {
  message: ChatMessage;
}

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function Message({ message }: MessageProps) {
  const theme = useTheme();
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        px: 3,
        py: 2,
        maxWidth: '100%',
        backgroundColor: isUser ? 'transparent' : theme.palette.background.paper,
        transition: theme.transitions.create('background-color'),
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 32,
          height: 32,
          mt: 0.25,
          backgroundColor: isUser
            ? theme.palette.primary.main
            : theme.palette.mode === 'dark'
              ? theme.palette.grey[800]
              : theme.palette.grey[200],
          flexShrink: 0,
        }}
      >
        {isUser ? (
          <PersonOutlineIcon sx={{ fontSize: 18, color: '#fff' }} />
        ) : (
          <SmartToyOutlinedIcon
            sx={{
              fontSize: 18,
              color: theme.palette.mode === 'dark'
                ? theme.palette.primary.light
                : theme.palette.primary.main,
            }}
          />
        )}
      </Avatar>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, fontSize: 13 }}
          >
            {isUser ? 'You' : 'Agent'}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 11 }}
          >
            {formatTimestamp(message.timestamp)}
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.6,
            '& code': {
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: 13,
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.05)',
              padding: '2px 6px',
              borderRadius: '4px',
            },
          }}
        >
          {message.content}
        </Typography>
      </Box>
    </Box>
  );
}

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const theme = useTheme();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.palette.text.secondary,
          gap: 1.5,
        }}
      >
        <SmartToyOutlinedIcon sx={{ fontSize: 48, opacity: 0.3 }} />
        <Typography variant="body1" sx={{ fontWeight: 500, opacity: 0.6 }}>
          How can I help you today?
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.4, maxWidth: 300, textAlign: 'center' }}>
          Ask anything — the agent will orchestrate multiple sub-agents to find the best answer.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}

      {/* Typing indicator */}
      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            px: 3,
            py: 2,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: theme.palette.mode === 'dark'
                ? theme.palette.grey[800]
                : theme.palette.grey[200],
            }}
          >
            <SmartToyOutlinedIcon
              sx={{
                fontSize: 18,
                color: theme.palette.primary.main,
              }}
            />
          </Avatar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 1 }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.text.secondary,
                  opacity: 0.4,
                  animation: 'pulse 1.4s infinite',
                  animationDelay: `${i * 0.2}s`,
                  '@keyframes pulse': {
                    '0%, 80%, 100%': { opacity: 0.4, transform: 'scale(1)' },
                    '40%': { opacity: 1, transform: 'scale(1.2)' },
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      <div ref={bottomRef} />
    </Box>
  );
}
