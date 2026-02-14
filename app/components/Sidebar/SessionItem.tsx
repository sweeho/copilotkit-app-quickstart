'use client';

import React, { useState } from 'react';
import { Box, Typography, useTheme, Chip, Tooltip } from '@mui/material';
import type { Session } from '../../types/session';
import SessionContextMenu from './SessionContextMenu';

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

function formatRelativeTime(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function SessionItem({
  session,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: SessionItemProps) {
  const theme = useTheme();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <Box
        onClick={() => onSelect(session.id)}
        onContextMenu={handleContextMenu}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
          px: 1.5,
          py: 1,
          borderRadius: 2,
          cursor: 'pointer',
          backgroundColor: isActive
            ? theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(0,0,0,0.06)'
            : 'transparent',
          '&:hover': {
            backgroundColor: isActive
              ? theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.06)'
              : theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(0,0,0,0.03)',
          },
          transition: 'background-color 150ms ease',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tooltip title={session.name} enterDelay={600}>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: theme.palette.text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                mr: 1,
              }}
            >
              {session.name}
            </Typography>
          </Tooltip>
          {session.messageCount > 0 && (
            <Chip
              label={session.messageCount}
              size="small"
              sx={{
                height: 18,
                fontSize: 10,
                fontWeight: 600,
                minWidth: 18,
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            sx={{
              fontSize: 11,
              color: theme.palette.text.secondary,
            }}
          >
            {formatRelativeTime(session.updatedAt)}
          </Typography>
          {session.lastMessagePreview && (
            <Typography
              sx={{
                fontSize: 11,
                color: theme.palette.text.secondary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {session.lastMessagePreview}
            </Typography>
          )}
        </Box>
      </Box>

      <SessionContextMenu
        anchorPosition={contextMenu}
        onClose={() => setContextMenu(null)}
        onRename={(newName) => onRename(session.id, newName)}
        onDelete={() => onDelete(session.id)}
        sessionName={session.name}
      />
    </>
  );
}
