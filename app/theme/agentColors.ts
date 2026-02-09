// Colors for agent execution visualization

export const agentColors = {
  light: {
    input: '#E3F2FD',        // Light blue
    inputBorder: '#90CAF9',
    processing: '#F3E5F5',   // Light purple
    processingBorder: '#CE93D8',
    output: '#E8F5E9',       // Light green
    outputBorder: '#A5D6A7',
    metrics: '#FAFAFA',      // Light gray
    metricsBorder: '#E0E0E0',
    error: '#FFEBEE',        // Light red
    errorBorder: '#EF9A9A',
    pending: '#9E9E9E',
    running: '#FF9500',
    completed: '#34C759',
    failed: '#FF3B30',
  },
  dark: {
    input: '#0D2137',
    inputBorder: '#1565C0',
    processing: '#1A0A2E',
    processingBorder: '#7B1FA2',
    output: '#0A2410',
    outputBorder: '#2E7D32',
    metrics: '#1A1A1A',
    metricsBorder: '#424242',
    error: '#2C0B0B',
    errorBorder: '#C62828',
    pending: '#757575',
    running: '#FF9F0A',
    completed: '#30D158',
    failed: '#FF453A',
  },
} as const;
