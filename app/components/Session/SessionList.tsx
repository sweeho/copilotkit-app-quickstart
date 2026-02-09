'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  useTheme,
  Fade,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SessionCard from './SessionCard';
import type { Session } from '../../types/session';

interface SessionListProps {
  sessions: Session[];
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onCreateSession: () => void;
}

export default function SessionList({
  sessions,
  onSelectSession,
  onDeleteSession,
  onCreateSession,
}: SessionListProps) {
  const theme = useTheme();

  return (
    <Fade in timeout={400}>
      <Box
        sx={{
          minHeight: '100vh',
          pt: '88px', // header + spacing
          px: 3,
          pb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 640 }}>
          {/* Header area */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h2" sx={{ fontWeight: 600, fontSize: 22 }}>
              Sessions
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateSession}
              sx={{ borderRadius: 2, px: 2.5 }}
            >
              New Session
            </Button>
          </Box>

          {/* Session list */}
          {sessions.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                color: theme.palette.text.secondary,
              }}
            >
              <ForumOutlinedIcon sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
              <Typography variant="body1" sx={{ mb: 1 }}>
                No sessions yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a new session to start chatting with the AI agent.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onSelect={onSelectSession}
                  onDelete={onDeleteSession}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Fade>
  );
}
