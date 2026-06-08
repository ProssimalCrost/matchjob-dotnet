// Tokens matching front/ (Next.js + Tailwind) palette.
// front/ uses slate-* for neutrals and purple-600 (#7c3aed) as the brand color.
export const Colors = {
  // Brand — purple-600
  primary: '#7c3aed',
  primaryLight: '#8b5cf6',
  primaryDark: '#6d28d9',
  primary50: '#f5f3ff',
  primary100: '#ede9fe',
  primary700: '#6d28d9',

  // Dark surfaces (used on auth / setup screens — front uses slate-950/900)
  slate950: '#020617',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate700: '#334155',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',

  // App (logged-in) background — front uses bg-slate-100
  appBackground: '#f1f5f9',
  surface: '#ffffff',

  // Text
  text: '#0f172a',          // slate-900
  textOnDark: '#f8fafc',
  textSecondary: '#475569', // slate-600
  textMuted: '#64748b',     // slate-500

  // Semantic
  error: '#ef4444',
  success: '#16a34a',
  successText: '#15803d',
  warning: '#f59e0b',
  star: '#eab308',          // yellow-500/600
  green: '#16a34a',
  red: '#dc2626',

  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.6)',
} as const;
