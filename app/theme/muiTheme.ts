import { createTheme, type ThemeOptions } from '@mui/material/styles';
import { appleColors } from './appleColors';

const commonThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' },
    h2: { fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontSize: 18, fontWeight: 500 },
    h4: { fontSize: 16, fontWeight: 500 },
    body1: { fontSize: 15, lineHeight: 1.5 },
    body2: { fontSize: 13, lineHeight: 1.4 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: 12,
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'light',
    primary: { main: appleColors.light.primary },
    background: {
      default: appleColors.light.background,
      paper: appleColors.light.surface,
    },
    text: {
      primary: appleColors.light.text,
      secondary: appleColors.light.textSecondary,
    },
    divider: appleColors.light.divider,
    success: { main: appleColors.light.success },
    warning: { main: appleColors.light.warning },
    error: { main: appleColors.light.error },
    info: { main: appleColors.light.info },
  },
});

export const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'dark',
    primary: { main: appleColors.dark.primary },
    background: {
      default: appleColors.dark.background,
      paper: appleColors.dark.surface,
    },
    text: {
      primary: appleColors.dark.text,
      secondary: appleColors.dark.textSecondary,
    },
    divider: appleColors.dark.divider,
    success: { main: appleColors.dark.success },
    warning: { main: appleColors.dark.warning },
    error: { main: appleColors.dark.error },
    info: { main: appleColors.dark.info },
  },
  components: {
    ...commonThemeOptions.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        },
      },
    },
  },
});
