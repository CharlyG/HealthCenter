/**
 * Design System - Foundation Tokens
 * 
 * Raw design values that form the foundation of the design system.
 * These tokens should NOT be used directly in components.
 * Use semantic tokens instead.
 * 
 * Layers:
 * 1. Foundations (this file) - Raw values
 * 2. Semantic tokens - Usage-based tokens
 * 3. Component tokens - Component-specific tokens
 * 4. Components - Actual components
 */

// ==================== COLOR TOKENS ====================

/**
 * Neutral Color Scale
 * Used for: surfaces, borders, text, muted content
 */
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
  950: '#0A0A0A'
} as const;

/**
 * Primary Brand Color
 * Healthcare-focused blue that conveys trust and professionalism
 */
export const primary = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',  // Primary
  600: '#2563EB',  // Primary dark
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
  950: '#172554'
} as const;

/**
 * Semantic Colors
 * Status colors must NEVER be the only visual indicator (WCAG requirement)
 */
export const semantic = {
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',  // Success
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D'
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',  // Warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F'
  },
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',  // Danger
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D'
  },
  info: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',  // Info
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E'
  }
} as const;

// ==================== TYPOGRAPHY TOKENS ====================

/**
 * Font Families
 */
export const fontFamily = {
  sans: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace'
} as const;

/**
 * Font Sizes
 * Designed for high information density while maintaining readability
 */
export const fontSize = {
  // Micro text (use sparingly)
  xs: '0.6875rem',    // 11px - Micro labels, dense table metadata
  
  // Standard text sizes
  sm: '0.8125rem',    // 13px - Compact table text, helper text
  base: '0.875rem',   // 14px - Body text, form inputs
  md: '0.9375rem',    // 15px - Secondary text
  
  // Headings
  lg: '1rem',         // 16px - Card titles
  xl: '1.125rem',     // 18px - Section titles
  '2xl': '1.25rem',   // 20px - Page titles
  '3xl': '1.5rem',    // 24px - Main dashboard titles
} as const;

/**
 * Font Weights
 */
export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700
} as const;

/**
 * Line Heights
 * Optimized for readability and information density
 */
export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625
} as const;

/**
 * Letter Spacing
 */
export const letterSpacing = {
  tighter: '-0.02em',
  tight: '-0.01em',
  normal: '0em',
  wide: '0.01em',
  wider: '0.02em'
} as const;

// ==================== SPACING TOKENS ====================

/**
 * Spacing Scale
 * Strict 4px-based scale for consistent spacing
 */
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem'      // 96px
} as const;

// ==================== RADIUS TOKENS ====================

/**
 * Border Radius
 * Calm, professional aesthetic
 */
export const radius = {
  none: '0',
  sm: '0.25rem',    // 4px - Small elements
  base: '0.375rem', // 6px - Default buttons, inputs
  md: '0.5rem',     // 8px - Cards, panels
  lg: '0.75rem',    // 12px - Large cards, modals
  xl: '1rem',       // 16px - Feature cards
  full: '9999px'    // Pills, avatars
} as const;

// ==================== BORDER TOKENS ====================

/**
 * Border Widths
 */
export const borderWidth = {
  0: '0',
  1: '1px',
  2: '2px',
  4: '4px'
} as const;

// ==================== SHADOW TOKENS ====================

/**
 * Box Shadows
 * Subtle shadows for calm hierarchy
 */
export const shadow = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  focus: '0 0 0 3px rgba(59, 130, 246, 0.5)'  // Primary blue with alpha
} as const;

// ==================== ELEVATION TOKENS ====================

/**
 * Elevation System
 * Maps logical elevation levels to shadow values
 */
export const elevation = {
  0: shadow.none,      // Flat surface
  1: shadow.sm,        // Subtle lift (cards)
  2: shadow.base,      // Standard lift (hover cards)
  3: shadow.md,        // Elevated panels
  4: shadow.lg,        // Drawers, dropdowns
  5: shadow.xl         // Modals, popovers
} as const;

// ==================== Z-INDEX TOKENS ====================

/**
 * Z-Index Scale
 * Ensures consistent stacking across the application
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  drawer: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700
} as const;

// ==================== MOTION TOKENS ====================

/**
 * Animation Durations
 * Calm, professional motion
 */
export const duration = {
  instant: '0ms',
  fast: '150ms',
  base: '200ms',
  moderate: '300ms',
  slow: '500ms'
} as const;

/**
 * Animation Timing Functions
 */
export const easing = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
} as const;

/**
 * Transition Presets
 */
export const transition = {
  fast: `all ${duration.fast} ${easing.out}`,
  base: `all ${duration.base} ${easing.out}`,
  moderate: `all ${duration.moderate} ${easing.inOut}`,
  colors: `background-color ${duration.base} ${easing.out}, border-color ${duration.base} ${easing.out}, color ${duration.base} ${easing.out}`,
  transform: `transform ${duration.base} ${easing.out}`,
  shadow: `box-shadow ${duration.base} ${easing.out}`
} as const;

// ==================== BREAKPOINTS ====================

/**
 * Responsive Breakpoints
 */
export const breakpoint = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// ==================== CONTAINER WIDTHS ====================

/**
 * Maximum Container Widths
 */
export const maxWidth = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%'
} as const;

// ==================== TYPE EXPORTS ====================

export type Neutral = keyof typeof neutral;
export type Primary = keyof typeof primary;
export type Semantic = keyof typeof semantic;
export type FontSize = keyof typeof fontSize;
export type FontWeight = keyof typeof fontWeight;
export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
export type Shadow = keyof typeof shadow;
export type Elevation = keyof typeof elevation;
export type ZIndex = keyof typeof zIndex;
export type Duration = keyof typeof duration;
export type Easing = keyof typeof easing;
export type Breakpoint = keyof typeof breakpoint;
