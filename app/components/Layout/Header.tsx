'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Box, useTheme, IconButton, Tooltip } from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ThemeToggle from './ThemeToggle';
import ThoughtsToggle from './ThoughtsToggle';

interface HeaderProps {
  username?: string;
  thoughtsEnabled: boolean;
  onThoughtsToggle: () => void;
  onLogout?: () => void;
  showThoughtsToggle?: boolean;
}

export default function Header({
  username,
  thoughtsEnabled,
  onThoughtsToggle,
  onLogout,
  showThoughtsToggle = false,
}: HeaderProps) {
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(28,28,30,0.85)'
          : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: `0.5px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: '64px !important',
          px: { xs: 2, sm: 3 },
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Logo + Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SmartToyOutlinedIcon
            sx={{ color: theme.palette.primary.main, fontSize: 28 }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 600,
              fontSize: 18,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Agent Studio
          </Typography>
        </Box>

        {/* Right: Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {showThoughtsToggle && (
            <>
              <ThoughtsToggle enabled={thoughtsEnabled} onToggle={onThoughtsToggle} />
              <Box
                sx={{
                  width: '1px',
                  height: 24,
                  backgroundColor: theme.palette.divider,
                  mx: 0.5,
                }}
              />
            </>
          )}
          <ThemeToggle />
          {username && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                ml: 0.5,
                pl: 1,
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  sx={{
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {username.charAt(0).toUpperCase()}
                </Typography>
              </Box>
              {onLogout && (
                <Tooltip title="Logout">
                  <IconButton
                    onClick={onLogout}
                    size="small"
                    sx={{
                      color: theme.palette.text.secondary,
                      '&:hover': { color: theme.palette.error.main },
                    }}
                  >
                    <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
