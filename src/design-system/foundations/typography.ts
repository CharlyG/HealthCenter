/**
 * Foundation Typography
 * 
 * Typography scale for the healthcare platform design system.
 * Optimized for high information density and readability.
 * 
 * @module Foundations/Typography
 */

// ==================== FONT FAMILIES ====================

export const fontFamily = {
  sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  display: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
} as const;

// ==================== FONT SIZES ====================

export const fontSize = {
  // Micro labels, table metadata
  xs: '0.6875rem',   // 11px
  
  // Helper text, compact tables
  sm: '0.75rem',     // 12px
  
  // Secondary text, table cells
  base: '0.8125rem', // 13px
  
  // Body text, form labels
  md: '0.875rem',    // 14px
  
  // Card titles, section headers
  lg: '0.9375rem',   // 15px
  
  // Section titles
  xl: '1rem',        // 16px
  
  // Page titles
  '2xl': '1.125rem', // 18px
  
  // Large headings
  '3xl': '1.25rem',  // 20px
  
  // Display headings (rarely used)
  '4xl': '1.5rem'    // 24px
} as const;

// ==================== FONT WEIGHTS ====================

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700
} as const;

// ==================== LINE HEIGHTS ====================

export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2
} as const;

// ==================== LETTER SPACING ====================

export const letterSpacing = {
  tighter: '-0.025em',
  tight: '-0.0125em',
  normal: '0em',
  wide: '0.0125em',
  wider: '0.025em',
  widest: '0.05em'
} as const;

// ==================== TEXT STYLES ====================
// Pre-composed text styles for common use cases

export const textStyles = {
  // Page-level title
  pageTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
    fontFamily: fontFamily.sans
  },
  
  // Section title
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.tight,
    fontFamily: fontFamily.sans
  },
  
  // Card title
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamily.sans
  },
  
  // Subsection title
  subsectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamily.sans
  },
  
  // Body text
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamily.sans
  },
  
  // Secondary text
  secondary: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamily.sans
  },
  
  // Table cell text
  tableCell: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamily.sans
  },
  
  // Compact table text
  tableCompact: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamily.sans
  },
  
  // Helper text
  helper: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamily.sans
  },
  
  // Micro label
  micro: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.wide,
    fontFamily: fontFamily.sans,
    textTransform: 'uppercase' as const
  },
  
  // Form label
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamily.sans
  },
  
  // Button text
  button: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.none,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamily.sans
  },
  
  // Code/monospace
  code: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamily.mono
  },
  
  // Badge text
  badge: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.none,
    letterSpacing: letterSpacing.wide,
    fontFamily: fontFamily.sans
  },
  
  // Link text
  link: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamily.sans,
    textDecoration: 'underline' as const
  }
} as const;

// ==================== EXPORTS ====================

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles
} as const;

export type TextStyle = keyof typeof textStyles;
