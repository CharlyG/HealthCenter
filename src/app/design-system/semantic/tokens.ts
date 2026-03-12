/**
 * Design System - Semantic Tokens
 * 
 * Usage-based tokens that describe intent rather than raw values.
 * All components and screens should use these semantic tokens
 * instead of foundation tokens or hardcoded values.
 * 
 * Benefits:
 * - Centralized theme control
 * - Easy dark mode implementation
 * - Consistent color usage
 * - Self-documenting code
 */

import { neutral, primary, semantic, fontSize, fontWeight, spacing, radius, borderWidth, shadow, zIndex } from '../foundations/tokens';

// ==================== TEXT TOKENS ====================

/**
 * Text Color Tokens
 * Describes text hierarchy and purpose
 */
export const textColor = {
  // Primary text - Main content, headings
  primary: neutral[900],
  
  // Secondary text - Supporting content, labels
  secondary: neutral[700],
  
  // Muted text - Metadata, helper text, placeholders
  muted: neutral[500],
  
  // Disabled text
  disabled: neutral[400],
  
  // Inverted text (on dark backgrounds)
  inverted: neutral[0],
  
  // Link text
  link: primary[600],
  linkHover: primary[700],
  
  // Status text colors
  success: semantic.success[700],
  warning: semantic.warning[700],
  danger: semantic.danger[700],
  info: semantic.info[700]
} as const;

// ==================== SURFACE TOKENS ====================

/**
 * Surface/Background Color Tokens
 * Describes surface hierarchy and purpose
 */
export const surface = {
  // Default surface (main background)
  default: neutral[0],
  
  // Subtle surface (slightly darker for grouping)
  subtle: neutral[50],
  
  // Elevated surface (cards, panels)
  elevated: neutral[0],
  
  // Sunken surface (wells, inputs)
  sunken: neutral[100],
  
  // Overlay surface (modals, drawers)
  overlay: neutral[0],
  
  // Disabled surface
  disabled: neutral[100],
  
  // Hover states
  hover: neutral[100],
  hoverSubtle: neutral[50],
  
  // Selected/Active states
  selected: primary[50],
  selectedStrong: primary[100],
  
  // Status surfaces (always paired with text/icon indicators)
  successSubtle: semantic.success[50],
  warningSubtle: semantic.warning[50],
  dangerSubtle: semantic.danger[50],
  infoSubtle: semantic.info[50]
} as const;

// ==================== BORDER TOKENS ====================

/**
 * Border Color Tokens
 * Describes border hierarchy and purpose
 */
export const borderColor = {
  // Default border
  default: neutral[200],
  
  // Strong border (emphasis)
  strong: neutral[300],
  
  // Subtle border (light separation)
  subtle: neutral[100],
  
  // Disabled border
  disabled: neutral[200],
  
  // Focus border
  focus: primary[500],
  
  // Status borders
  success: semantic.success[300],
  warning: semantic.warning[300],
  danger: semantic.danger[300],
  info: semantic.info[300]
} as const;

/**
 * Border Radius Tokens
 * Semantic names for border radius usage
 */
export const borderRadius = {
  none: radius.none,
  small: radius.sm,      // Small UI elements
  default: radius.base,  // Default for most elements
  medium: radius.md,     // Cards, panels
  large: radius.lg,      // Large panels, modals
  full: radius.full      // Pills, avatars
} as const;

/**
 * Border Width Tokens
 * Semantic names for border widths
 */
export const border = {
  none: borderWidth[0],
  default: borderWidth[1],
  thick: borderWidth[2],
  focus: borderWidth[2]
} as const;

// ==================== BACKGROUND STATE TOKENS ====================

/**
 * Interactive Background States
 * For buttons, links, and interactive elements
 */
export const bgState = {
  // Primary action states
  primaryDefault: primary[600],
  primaryHover: primary[700],
  primaryActive: primary[800],
  primaryDisabled: neutral[300],
  
  // Secondary action states
  secondaryDefault: neutral[100],
  secondaryHover: neutral[200],
  secondaryActive: neutral[300],
  secondaryDisabled: neutral[100],
  
  // Danger action states
  dangerDefault: semantic.danger[600],
  dangerHover: semantic.danger[700],
  dangerActive: semantic.danger[800],
  dangerDisabled: neutral[300],
  
  // Success action states
  successDefault: semantic.success[600],
  successHover: semantic.success[700],
  successActive: semantic.success[800],
  
  // Ghost/transparent states
  ghostDefault: 'transparent',
  ghostHover: neutral[100],
  ghostActive: neutral[200]
} as const;

// ==================== FOCUS RING TOKENS ====================

/**
 * Focus Ring Styles
 * Consistent focus indicators for accessibility
 */
export const focusRing = {
  default: `0 0 0 3px ${primary[500]}20`,  // Primary with 20% opacity
  danger: `0 0 0 3px ${semantic.danger[500]}20`,
  success: `0 0 0 3px ${semantic.success[500]}20`
} as const;

// ==================== STATUS TOKENS ====================

/**
 * Status Color Tokens
 * Full status color palettes for backgrounds, borders, text, icons
 */
export const status = {
  success: {
    bg: semantic.success[50],
    bgStrong: semantic.success[100],
    border: semantic.success[300],
    text: semantic.success[700],
    icon: semantic.success[600]
  },
  warning: {
    bg: semantic.warning[50],
    bgStrong: semantic.warning[100],
    border: semantic.warning[300],
    text: semantic.warning[700],
    icon: semantic.warning[600]
  },
  danger: {
    bg: semantic.danger[50],
    bgStrong: semantic.danger[100],
    border: semantic.danger[300],
    text: semantic.danger[700],
    icon: semantic.danger[600]
  },
  info: {
    bg: semantic.info[50],
    bgStrong: semantic.info[100],
    border: semantic.info[300],
    text: semantic.info[700],
    icon: semantic.info[600]
  }
} as const;

// ==================== DISABLED STATE TOKENS ====================

/**
 * Disabled State Styles
 */
export const disabled = {
  bg: neutral[100],
  border: neutral[200],
  text: neutral[400],
  opacity: '0.6'
} as const;

// ==================== TYPOGRAPHY SEMANTIC TOKENS ====================

/**
 * Typography Semantic Tokens
 * Describes typographic purpose and hierarchy
 */
export const typography = {
  // Page title (main heading)
  pageTitle: {
    size: fontSize['2xl'],
    weight: fontWeight.bold,
    lineHeight: '1.25',
    letterSpacing: '-0.01em'
  },
  
  // Section title
  sectionTitle: {
    size: fontSize.xl,
    weight: fontWeight.semibold,
    lineHeight: '1.375',
    letterSpacing: '-0.01em'
  },
  
  // Card title
  cardTitle: {
    size: fontSize.lg,
    weight: fontWeight.semibold,
    lineHeight: '1.5',
    letterSpacing: '0'
  },
  
  // Body text (default)
  body: {
    size: fontSize.base,
    weight: fontWeight.normal,
    lineHeight: '1.5',
    letterSpacing: '0'
  },
  
  // Secondary text
  secondary: {
    size: fontSize.md,
    weight: fontWeight.normal,
    lineHeight: '1.5',
    letterSpacing: '0'
  },
  
  // Compact table text
  compactTable: {
    size: fontSize.sm,
    weight: fontWeight.normal,
    lineHeight: '1.375',
    letterSpacing: '0'
  },
  
  // Helper text
  helper: {
    size: fontSize.sm,
    weight: fontWeight.normal,
    lineHeight: '1.5',
    letterSpacing: '0'
  },
  
  // Micro label
  microLabel: {
    size: fontSize.xs,
    weight: fontWeight.medium,
    lineHeight: '1.25',
    letterSpacing: '0.02em'
  },
  
  // Button text
  button: {
    size: fontSize.base,
    weight: fontWeight.medium,
    lineHeight: '1',
    letterSpacing: '0'
  },
  
  // Label text
  label: {
    size: fontSize.sm,
    weight: fontWeight.medium,
    lineHeight: '1.5',
    letterSpacing: '0'
  }
} as const;

// ==================== SPACING SEMANTIC TOKENS ====================

/**
 * Spacing Semantic Tokens
 * Describes spacing purpose
 */
export const space = {
  // Component internal spacing
  xs: spacing[1],      // 4px - Tight internal padding
  sm: spacing[2],      // 8px - Small internal padding
  md: spacing[3],      // 12px - Default internal padding
  lg: spacing[4],      // 16px - Comfortable internal padding
  xl: spacing[6],      // 24px - Spacious internal padding
  
  // Component external spacing (margins, gaps)
  gapXs: spacing[2],   // 8px - Tight gap
  gapSm: spacing[3],   // 12px - Small gap
  gapMd: spacing[4],   // 16px - Default gap
  gapLg: spacing[6],   // 24px - Large gap
  gapXl: spacing[8],   // 32px - Extra large gap
  
  // Section spacing
  sectionSm: spacing[6],  // 24px - Small section spacing
  sectionMd: spacing[8],  // 32px - Default section spacing
  sectionLg: spacing[12], // 48px - Large section spacing
  
  // Page padding
  pagePadding: spacing[6], // 24px - Default page padding
  pagePaddingLg: spacing[8] // 32px - Large page padding
} as const;

// ==================== SHADOW SEMANTIC TOKENS ====================

/**
 * Shadow Semantic Tokens
 * Describes shadow purpose and elevation
 */
export const shadows = {
  none: shadow.none,
  card: shadow.sm,
  cardHover: shadow.base,
  panel: shadow.md,
  drawer: shadow.lg,
  modal: shadow.xl,
  dropdown: shadow.lg,
  focus: shadow.focus,
  inner: shadow.inner
} as const;

// ==================== Z-INDEX SEMANTIC TOKENS ====================

/**
 * Z-Index Semantic Tokens
 * Describes stacking purpose
 */
export const layer = {
  base: zIndex.base,
  dropdown: zIndex.dropdown,
  sticky: zIndex.sticky,
  drawer: zIndex.drawer,
  modal: zIndex.modal,
  popover: zIndex.popover,
  tooltip: zIndex.tooltip,
  toast: zIndex.toast
} as const;

// ==================== ICON SIZE TOKENS ====================

/**
 * Icon Size Tokens
 * Standard icon sizes for consistency
 */
export const iconSize = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px'
} as const;

// ==================== AVATAR SIZE TOKENS ====================

/**
 * Avatar Size Tokens
 */
export const avatarSize = {
  xs: '24px',
  sm: '32px',
  base: '40px',
  lg: '48px',
  xl: '64px'
} as const;

// ==================== BADGE SIZE TOKENS ====================

/**
 * Badge Size Tokens
 */
export const badgeSize = {
  sm: {
    padding: `${spacing[1]} ${spacing[2]}`,
    fontSize: fontSize.xs,
    height: '20px'
  },
  base: {
    padding: `${spacing[1]} ${spacing[2]}`,
    fontSize: fontSize.sm,
    height: '24px'
  }
} as const;

// ==================== INPUT SIZE TOKENS ====================

/**
 * Input Size Tokens
 */
export const inputSize = {
  sm: {
    height: '32px',
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: fontSize.sm
  },
  base: {
    height: '40px',
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: fontSize.base
  },
  lg: {
    height: '48px',
    padding: `${spacing[3]} ${spacing[4]}`,
    fontSize: fontSize.md
  }
} as const;

// ==================== BUTTON SIZE TOKENS ====================

/**
 * Button Size Tokens
 */
export const buttonSize = {
  sm: {
    height: '32px',
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: fontSize.sm
  },
  base: {
    height: '40px',
    padding: `${spacing[2]} ${spacing[4]}`,
    fontSize: fontSize.base
  },
  lg: {
    height: '48px',
    padding: `${spacing[3]} ${spacing[6]}`,
    fontSize: fontSize.md
  }
} as const;

// ==================== TYPE EXPORTS ====================

export type TextColor = keyof typeof textColor;
export type Surface = keyof typeof surface;
export type BorderColor = keyof typeof borderColor;
export type Typography = keyof typeof typography;
export type Space = keyof typeof space;
export type Shadow = keyof typeof shadows;
export type Layer = keyof typeof layer;
export type IconSize = keyof typeof iconSize;
