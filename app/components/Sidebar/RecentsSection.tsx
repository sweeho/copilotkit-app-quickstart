'use client';

import React from 'react';
import { Box, Typography, useTheme, CircularProgress } from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SessionItem from './SessionItem';
import type { Session } from '../../types/session';

interface RecentsSectionProps {
  sessions: Session[];
  activeSessionId: string | null;
  isLoading: boolean;
  onSelectSession: (id: string) => void;
  onRenameSession: (id: string, newName: string) => void;
  onDeleteSession: (id: string) => void;
}

export default function RecentsSection({
  sessions,
  activeSessionId,
  isLoading,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
}: RecentsSectionProps) {
  const theme = useTheme();

  return (
    <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: theme.palette.text.secondary,
          px: 1.5,
          mb: 1,
        }}
      >
        Recents
      </Typography>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.divider,
            borderRadius: 2,
          },
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : sessions.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 4,
              px: 2,
              textAlign: 'center',
            }}
          >
            <ForumOutlinedIcon
              sx={{ fontSize: 32, color: theme.palette.text.secondary, mb: 1, opacity: 0.5 }}
            />
            <Typography
              sx={{ fontSize: 13, color: theme.palette.text.secondary, lineHeight: 1.5 }}
            >
              No conversations yet.
              <br />
              Start a new chat!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onSelect={onSelectSession}
                onRename={onRenameSession}
                onDelete={onDeleteSession}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
