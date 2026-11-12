import { Platform } from 'react-native';

export const colors = {
  primary: '#4f46e5',
  primaryDark: '#4338ca',
  primarySoft: '#eef2ff',
  bg: '#f3f4f6',
  card: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  danger: '#ef4444',
  dangerSoft: '#fee2e2',
  warning: '#f59e0b',
  warningSoft: '#fef3c7',
  success: '#10b981',
  successSoft: '#d1fae5',
};

export const shadow = Platform.select({
  web: { boxShadow: '0 4px 14px rgba(0,0,0,0.08)' },
  default: { elevation: 3 },
});

export const shadowHover = Platform.select({
  web: { boxShadow: '0 10px 24px rgba(79,70,229,0.18)' },
  default: { elevation: 6 },
});