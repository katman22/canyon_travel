// constants/palette.ts
import {DefaultTheme} from "@react-navigation/native";

export const DarkPalette = {
  background: '#0b1320',
  card:       '#101a2b',
  text:       '#eef3ff',
  muted:      '#64748b',
  border:     '#cbd5e1',
  primary:    '#2563eb',
  danger:     '#ef4444',
  success:    '#16a34a',
  warning:    '#f59e0b',
};

export const LightPalette = {
  background: '#f4f6f9',  // light grey with a soft tone
  card:       '#ffffff',  // clean card background
  text:       '#1e293b',  // dark slate text
  muted:      '#64748b',  // subtle grey text
  border:     '#e2e8f0',  // light border
  primary:    '#2563eb',  // same primary blue for brand consistency
  danger:     '#dc2626',  // slightly deeper red for contrast
  success:    '#16a34a',  // green works on light
  warning:    '#d97706',  // rich amber for contrast
};

export const LightNavTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    background:   LightPalette.background,
    card:         LightPalette.card,
    text:         LightPalette.text,
    border:       LightPalette.border,
    primary:      LightPalette.primary,
    notification: DefaultTheme.colors.notification,
  },
};
