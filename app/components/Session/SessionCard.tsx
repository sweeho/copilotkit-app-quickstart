'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  Chip,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import type { Session } from '../../types/session';

interface SessionCardProps {
  session: Session;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function SessionCard({ session, onSelect, onDelete }: SessionCardProps) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      onClick={() => onSelect(session.id)}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        cursor: 'pointer',
        transition: theme.transitions.create(['border-color', 'box-shadow'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 1px ${theme.palette.primary.main}20`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  fontSize: 15,
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {session.name}
              </Typography>
              {session.lastMessagePreview && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '90%',
                  }}
                >
                  {session.lastMessagePreview}
                </Typography>
              )}
            </Box>
            <Tooltip title="Delete session">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
                sx={{
                  color: theme.palette.text.secondary,
                  opacity: 0.5,
                  '&:hover': { opacity: 1, color: theme.palette.error.main },
                  ml: 1,
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
            <Chip
              icon={<ChatBubbleOutlineIcon sx={{ fontSize: '14px !important' }} />}
              label={`${session.messageCount} messages`}
              size="small"
              variant="outlined"
              sx={{ fontSize: 12, height: 24 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, ml: 'auto' }}>
              {formatRelativeTime(session.updatedAt)}
            </Typography>
          </Box>
        </CardContent>
    </Card>
  );
}
