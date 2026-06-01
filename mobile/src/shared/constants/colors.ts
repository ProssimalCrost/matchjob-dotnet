// Tokens matching front/ (Next.js + Tailwind) palette
export const Colors = {
  // Primary — violet-600 (same as front/)
  primary: '#7c3aed',
  primaryLight: '#8b5cf6',
  primaryDark: '#6d28d9',

  // Backgrounds — slate scale (dark theme)
  background: '#020617',   // slate-950
  surface: '#0f172a',      // slate-900
  surfaceAlt: '#1e293b',   // slate-800
  surfaceElevated: '#1e293b',

  // Text
  text: '#f8fafc',          // slate-50
  textSecondary: '#cbd5e1', // slate-300
  textMuted: '#64748b',     // slate-500
  textOnPrimary: '#ffffff',

  // Borders
  border: '#334155',        // slate-700
  borderLight: '#1e293b',   // slate-800

  // Semantic
  error: '#ef4444',
  errorLight: '#450a0a',
  success: '#22c55e',
  successLight: '#052e16',
  warning: '#f59e0b',
  warningLight: '#451a03',
  secondary: '#2dd4bf',     // teal-400

  // Misc
  star: '#f59e0b',
  overlay: 'rgba(0,0,0,0.7)',
} as const;
