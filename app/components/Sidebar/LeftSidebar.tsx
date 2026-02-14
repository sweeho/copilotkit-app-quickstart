'use client';

import React from 'react';
import { Box, Divider, Typography, useTheme, IconButton, Tooltip } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import NewChatButton from './NewChatButton';
import RecentsSection from './RecentsSection';
import type { Session } from '../../types/session';

interface LeftSidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onRenameSession: (id: string, newName: string) => void;
  onDeleteSession: (id: string) => void;
  onAdminPanel?: () => void;
}

export default function LeftSidebar({
  sessions,
  activeSessionId,
  isLoading,
  isAdmin,
  onNewChat,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
  onAdminPanel,
}: LeftSidebarProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: 280,
        minWidth: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor:
          theme.palette.mode === 'dark'
            ? 'rgba(28,28,30,1)'
            : '#F5F5F7',
        borderRight: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
      }}
    >
      {/* New Chat button */}
      <Box sx={{ p: 2, pb: 1 }}>
        <NewChatButton onClick={onNewChat} />
      </Box>

      <Divider sx={{ mx: 2, mb: 1 }} />

      {/* Recents section */}
      <Box sx={{ flex: 1, overflow: 'hidden', px: 1 }}>
        <RecentsSection
          sessions={sessions}
          activeSessionId={activeSessionId}
          isLoading={isLoading}
          onSelectSession={onSelectSession}
          onRenameSession={onRenameSession}
          onDeleteSession={onDeleteSession}
        />
      </Box>

      {/* Bottom section */}
      <Divider sx={{ mx: 2 }} />
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {isAdmin && onAdminPanel && (
          <Tooltip title="Admin Panel">
            <IconButton
              onClick={onAdminPanel}
              size="small"
              sx={{ color: theme.palette.text.secondary }}
            >
              <AdminPanelSettingsOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}
