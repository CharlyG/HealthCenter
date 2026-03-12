/**
 * Foundation Colors
 * 
 * Raw color values for the healthcare platform design system.
 * DO NOT use these directly in components - use semantic tokens instead.
 * 
 * @module Foundations/Colors
 */

// ==================== NEUTRAL SCALE ====================
// Used for surfaces, borders, text, and muted content
export const neutral = {
  0: '#FFFFFF',
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0A0A0A',
  1000: '#000000'
} as const;

// ==================== PRIMARY BRAND ====================
// Primary brand color for the healthcare platform
export const primary = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6', // Main brand color
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
  950: '#172554'
} as const;

// ==================== SEMANTIC COLORS ====================

// Success - Green scale for positive states, confirmations
export const success = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E', // Main success color
  600: '#16A34A',
  700: '#15803D',
  800: '#166534',
  900: '#14532D',
  950: '#052E16'
} as const;

// Warning - Amber scale for warnings, caution states
export const warning = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B', // Main warning color
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
  950: '#451A03'
} as const;

// Danger - Red scale for errors, destructive actions
export const danger = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444', // Main danger color
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
  900: '#7F1D1D',
  950: '#450A0A'
} as const;

// Info - Blue scale for informational states
export const info = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6', // Main info color (same as primary)
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
  950: '#172554'
} as const;

// ==================== ADDITIONAL SEMANTIC SCALES ====================

// Purple - Used for clinical/assessment content
export const purple = {
  50: '#FAF5FF',
  100: '#F3E8FF',
  200: '#E9D5FF',
  300: '#D8B4FE',
  400: '#C084FC',
  500: '#A855F7',
  600: '#9333EA',
  700: '#7E22CE',
  800: '#6B21A8',
  900: '#581C87',
  950: '#3B0764'
} as const;

// Teal - Used for tasks, visits, operational items
export const teal = {
  50: '#F0FDFA',
  100: '#CCFBF1',
  200: '#99F6E4',
  300: '#5EEAD4',
  400: '#2DD4BF',
  500: '#14B8A6',
  600: '#0D9488',
  700: '#0F766E',
  800: '#115E59',
  900: '#134E4A',
  950: '#042F2E'
} as const;

// Orange - Used for pending, in-progress states
export const orange = {
  50: '#FFF7ED',
  100: '#FFEDD5',
  200: '#FED7AA',
  300: '#FDBA74',
  400: '#FB923C',
  500: '#F97316',
  600: '#EA580C',
  700: '#C2410C',
  800: '#9A3412',
  900: '#7C2D12',
  950: '#431407'
} as const;

// ==================== ALPHA COLORS ====================
// For overlays, shadows, and transparency
export const alpha = {
  black: {
    5: 'rgba(0, 0, 0, 0.05)',
    10: 'rgba(0, 0, 0, 0.10)',
    20: 'rgba(0, 0, 0, 0.20)',
    30: 'rgba(0, 0, 0, 0.30)',
    40: 'rgba(0, 0, 0, 0.40)',
    50: 'rgba(0, 0, 0, 0.50)',
    60: 'rgba(0, 0, 0, 0.60)',
    70: 'rgba(0, 0, 0, 0.70)',
    80: 'rgba(0, 0, 0, 0.80)',
    90: 'rgba(0, 0, 0, 0.90)'
  },
  white: {
    5: 'rgba(255, 255, 255, 0.05)',
    10: 'rgba(255, 255, 255, 0.10)',
    20: 'rgba(255, 255, 255, 0.20)',
    30: 'rgba(255, 255, 255, 0.30)',
    40: 'rgba(255, 255, 255, 0.40)',
    50: 'rgba(255, 255, 255, 0.50)',
    60: 'rgba(255, 255, 255, 0.60)',
    70: 'rgba(255, 255, 255, 0.70)',
    80: 'rgba(255, 255, 255, 0.80)',
    90: 'rgba(255, 255, 255, 0.90)'
  }
} as const;

// ==================== EXPORTS ====================

export const colors = {
  neutral,
  primary,
  success,
  warning,
  danger,
  info,
  purple,
  teal,
  orange,
  alpha
} as const;

export type ColorScale = typeof neutral;
export type AlphaScale = typeof alpha.black;
