/**
 * Semantic Design Tokens
 * 
 * Usage-based tokens that describe intent rather than raw values.
 * ALL components and screens must use these semantic tokens instead of foundation tokens.
 * 
 * @module Tokens/Semantic
 */

import { colors, alpha } from '../foundations/colors';

// ==================== TEXT COLORS ====================

export const textColors = {
  // Primary text - body copy, main content
  primary: colors.neutral[900],
  
  // Secondary text - less emphasized content
  secondary: colors.neutral[600],
  
  // Muted text - helper text, placeholders
  muted: colors.neutral[500],
  
  // Disabled text
  disabled: colors.neutral[400],
  
  // Inverted text (on dark backgrounds)
  inverted: colors.neutral[0],
  
  // Link text
  link: colors.primary[600],
  linkHover: colors.primary[700],
  
  // Semantic text colors
  success: colors.success[700],
  warning: colors.warning[700],
  danger: colors.danger[700],
  info: colors.info[700],
  
  // Brand text
  brand: colors.primary[600]
} as const;

// ==================== SURFACE COLORS ====================

export const surfaceColors = {
  // Default page background
  default: colors.neutral[0],
  
  // Subtle surface (slight contrast)
  subtle: colors.neutral[50],
  
  // Elevated surface (cards, panels)
  elevated: colors.neutral[0],
  
  // Sunken surface (wells, insets)
  sunken: colors.neutral[100],
  
  // Overlay background (modal backdrops)
  overlay: alpha.black[50],
  
  // Inverted surface (dark mode - future)
  inverted: colors.neutral[900],
  
  // Hover states
  hover: colors.neutral[50],
  hoverSubtle: colors.neutral[100],
  
  // Selected states
  selected: colors.primary[50],
  selectedStrong: colors.primary[100],
  
  // Active states
  active: colors.primary[100],
  
  // Disabled states
  disabled: colors.neutral[100],
  
  // Semantic surfaces
  successSubtle: colors.success[50],
  warningSubtle: colors.warning[50],
  dangerSubtle: colors.danger[50],
  infoSubtle: colors.info[50]
} as const;

// ==================== BORDER COLORS ====================

export const borderColors = {
  // Default border
  default: colors.neutral[200],
  
  // Strong border (emphasized)
  strong: colors.neutral[300],
  
  // Subtle border (de-emphasized)
  subtle: colors.neutral[100],
  
  // Interactive borders
  hover: colors.neutral[300],
  focus: colors.primary[500],
  active: colors.primary[600],
  
  // Disabled border
  disabled: colors.neutral[200],
  
  // Selected border
  selected: colors.primary[500],
  
  // Semantic borders
  success: colors.success[500],
  warning: colors.warning[500],
  danger: colors.danger[500],
  info: colors.info[500],
  
  // Divider
  divider: colors.neutral[200],
  dividerStrong: colors.neutral[300]
} as const;

// ==================== BACKGROUND COLORS ====================

export const backgroundColors = {
  // Interactive elements
  button: {
    primary: colors.primary[600],
    primaryHover: colors.primary[700],
    primaryActive: colors.primary[800],
    
    secondary: colors.neutral[100],
    secondaryHover: colors.neutral[200],
    secondaryActive: colors.neutral[300],
    
    danger: colors.danger[600],
    dangerHover: colors.danger[700],
    dangerActive: colors.danger[800],
    
    ghost: 'transparent',
    ghostHover: colors.neutral[100],
    ghostActive: colors.neutral[200]
  },
  
  // Input backgrounds
  input: {
    default: colors.neutral[0],
    hover: colors.neutral[0],
    focus: colors.neutral[0],
    disabled: colors.neutral[50],
    readonly: colors.neutral[50]
  },
  
  // Badge backgrounds
  badge: {
    neutral: colors.neutral[100],
    primary: colors.primary[100],
    success: colors.success[100],
    warning: colors.warning[100],
    danger: colors.danger[100],
    info: colors.info[100],
    purple: colors.purple[100],
    teal: colors.teal[100],
    orange: colors.orange[100]
  },
  
  // Status backgrounds
  status: {
    success: colors.success[600],
    warning: colors.warning[600],
    danger: colors.danger[600],
    info: colors.info[600],
    neutral: colors.neutral[600]
  }
} as const;

// ==================== STATE COLORS ====================

export const stateColors = {
  // Success states
  success: {
    bg: colors.success[50],
    bgStrong: colors.success[100],
    border: colors.success[300],
    text: colors.success[800],
    icon: colors.success[600],
    solid: colors.success[600]
  },
  
  // Warning states
  warning: {
    bg: colors.warning[50],
    bgStrong: colors.warning[100],
    border: colors.warning[300],
    text: colors.warning[800],
    icon: colors.warning[600],
    solid: colors.warning[600]
  },
  
  // Danger/Error states
  danger: {
    bg: colors.danger[50],
    bgStrong: colors.danger[100],
    border: colors.danger[300],
    text: colors.danger[800],
    icon: colors.danger[600],
    solid: colors.danger[600]
  },
  
  // Info states
  info: {
    bg: colors.info[50],
    bgStrong: colors.info[100],
    border: colors.info[300],
    text: colors.info[800],
    icon: colors.info[600],
    solid: colors.info[600]
  },
  
  // Disabled states
  disabled: {
    bg: colors.neutral[100],
    border: colors.neutral[200],
    text: colors.neutral[400],
    icon: colors.neutral[400]
  }
} as const;

// ==================== FOCUS RING ====================

export const focusRing = {
  // Default focus ring
  default: `0 0 0 3px ${colors.primary[200]}`,
  
  // Focus ring colors
  primary: `0 0 0 3px ${colors.primary[200]}`,
  danger: `0 0 0 3px ${colors.danger[200]}`,
  success: `0 0 0 3px ${colors.success[200]}`,
  
  // Focus ring for dark backgrounds
  inverted: `0 0 0 3px ${alpha.white[30]}`
} as const;

// ==================== HEALTHCARE-SPECIFIC COLORS ====================

export const healthcareColors = {
  // Clinical severity
  critical: colors.danger[600],
  high: colors.orange[600],
  moderate: colors.warning[600],
  low: colors.teal[600],
  
  // Patient status
  admitted: colors.primary[600],
  discharged: colors.neutral[600],
  readmitted: colors.purple[600],
  
  // Visit status
  scheduled: colors.teal[600],
  inProgress: colors.primary[600],
  completed: colors.success[600],
  missed: colors.danger[600],
  cancelled: colors.neutral[600],
  
  // Documentation status
  draft: colors.neutral[600],
  pendingReview: colors.warning[600],
  approved: colors.success[600],
  rejected: colors.danger[600],
  
  // Billing status
  unbilled: colors.warning[600],
  billed: colors.teal[600],
  paid: colors.success[600],
  denied: colors.danger[600],
  
  // Priority levels
  urgent: colors.danger[600],
  highPriority: colors.orange[600],
  normalPriority: colors.neutral[600],
  lowPriority: colors.teal[600],
  
  // Compliance
  compliant: colors.success[600],
  nonCompliant: colors.danger[600],
  expiring: colors.warning[600]
} as const;

// ==================== CHART COLORS ====================
// For data visualization

export const chartColors = {
  primary: [
    colors.primary[600],
    colors.primary[500],
    colors.primary[400],
    colors.primary[300],
    colors.primary[200]
  ],
  
  categorical: [
    colors.primary[600],
    colors.teal[600],
    colors.purple[600],
    colors.orange[600],
    colors.success[600],
    colors.warning[600],
    colors.danger[600],
    colors.info[600]
  ],
  
  sequential: [
    colors.primary[100],
    colors.primary[200],
    colors.primary[300],
    colors.primary[400],
    colors.primary[500],
    colors.primary[600],
    colors.primary[700],
    colors.primary[800]
  ],
  
  diverging: {
    positive: colors.success[600],
    neutral: colors.neutral[300],
    negative: colors.danger[600]
  }
} as const;

// ==================== EXPORTS ====================

export const semanticTokens = {
  text: textColors,
  surface: surfaceColors,
  border: borderColors,
  background: backgroundColors,
  state: stateColors,
  focusRing,
  healthcare: healthcareColors,
  chart: chartColors
} as const;

// Export individual token groups for convenience
export {
  textColors as text,
  surfaceColors as surface,
  borderColors as border,
  backgroundColors as background,
  stateColors as state,
  healthcareColors as healthcare,
  chartColors as chart
};
