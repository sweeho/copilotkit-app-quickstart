'use client';

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import { useThemeMode, type ThemeMode } from '../../contexts/ThemeContext';

const modeConfig: Record<ThemeMode, { icon: React.ReactNode; next: ThemeMode; label: string }> = {
  light: {
    icon: <LightModeOutlinedIcon fontSize="small" />,
    next: 'dark',
    label: 'Light mode',
  },
  dark: {
    icon: <DarkModeOutlinedIcon fontSize="small" />,
    next: 'system',
    label: 'Dark mode',
  },
  system: {
    icon: <SettingsBrightnessOutlinedIcon fontSize="small" />,
    next: 'light',
    label: 'System mode',
  },
};

export default function ThemeToggle() {
  const { mode, setMode } = useThemeMode();
  const config = modeConfig[mode];

  return (
    <Tooltip title={config.label} arrow>
      <IconButton
        onClick={() => setMode(config.next)}
        size="small"
        sx={{
          color: 'text.secondary',
          '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
        }}
      >
        {config.icon}
      </IconButton>
    </Tooltip>
  );
}
