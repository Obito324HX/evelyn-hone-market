// Shared design tokens for Evelyn Hone Market.
// Import these into any page's `styles` object instead of hardcoding
// hex values, so the whole app stays visually consistent and easy to
// re-theme later.

export const colors = {
  ink: '#1C1626',          // deep violet-black — text and high-contrast accents only
  accent: '#7C3AED',       // vivid violet — primary brand color
  accentDark: '#6425C7',
  accentGlow: 'rgba(124,58,237,0.18)',
  accentPale: '#F1EAFE',   // light violet tint for chips/badges on white
  bg: '#FBFAF8',           // warm off-white canvas
  surface: '#FFFFFF',
  border: '#ECE8E2',
  borderStrong: '#DCD6CC',
  text: '#1C1626',
  textMuted: '#6B6475',
  textFaint: '#A39CB0',
  success: '#22C55E',
  successBg: 'rgba(34,197,94,0.12)',
}

export const fontDisplay = "'Fraunces', Georgia, serif"

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '18px',
  pill: '100px',
}

export const shadow = {
  sm: '0 2px 8px rgba(20,21,43,0.06)',
  md: '0 8px 24px rgba(20,21,43,0.08)',
  lg: '0 16px 40px rgba(20,21,43,0.12)',
  navDark: '0 2px 12px rgba(0,0,0,0.25)',
}

export const font = {
  family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
}
