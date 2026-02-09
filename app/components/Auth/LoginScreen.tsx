'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  useTheme,
  Fade,
} from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = username.trim();
      if (!trimmed) {
        setError('Please enter a username');
        return;
      }
      if (trimmed.length < 2) {
        setError('Username must be at least 2 characters');
        return;
      }
      onLogin(trimmed);
    },
    [username, onLogin]
  );

  return (
    <Fade in timeout={600}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.background.default,
          p: 3,
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 400,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 5 }}>
            {/* Branding */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <SmartToyOutlinedIcon
                sx={{
                  fontSize: 48,
                  color: theme.palette.primary.main,
                  mb: 2,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: 28,
                  fontWeight: 600,
                  mb: 1,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Agent Studio
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.5 }}
              >
                Multi-agent AI assistant with transparent orchestration
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                error={!!error}
                helperText={error || ' '}
                autoFocus
                autoComplete="username"
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: 1.5,
                  fontSize: 15,
                  fontWeight: 500,
                  borderRadius: 2,
                }}
              >
                Continue
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 4, fontSize: 12 }}
        >
          Powered by Google ADK & CopilotKit
        </Typography>
      </Box>
    </Fade>
  );
}
