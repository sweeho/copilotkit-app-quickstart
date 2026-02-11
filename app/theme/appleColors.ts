// Apple-inspired color palettes

export const appleColors = {
  light: {
    primary: '#007AFF',
    primaryHover: '#0066D6',
    background: '#FFFFFF',
    surface: '#F5F5F7',
    surfaceHover: '#ECECEE',
    text: '#1D1D1F',
    textSecondary: '#86868B',
    border: '#D2D2D7',
    divider: '#E5E5EA',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#5AC8FA',
  },
  dark: {
    primary: '#0A84FF',
    primaryHover: '#409CFF',
    background: '#000000',
    surface: '#1C1C1E',
    surfaceHover: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#98989D',
    border: '#38383A',
    divider: '#38383A',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#64D2FF',
  },
} as const;

export type ColorMode = 'light' | 'dark';
export type AppleColorPalette = typeof appleColors.light;
