/**
 * Foundation Shadows
 * 
 * Shadow system for elevation and depth in the healthcare platform.
 * Calm, subtle shadows that don't distract from content.
 * 
 * @module Foundations/Shadows
 */

// ==================== SHADOW SCALE ====================

export const shadows = {
  none: 'none',
  
  // Subtle shadow for slight elevation
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  
  // Default shadow for cards, buttons
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  
  // Medium shadow for elevated cards, dropdowns
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  
  // Large shadow for modals, popovers
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  
  // Extra large shadow for major UI elements
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  
  // 2XL shadow for maximum elevation
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Inner shadow for inset/pressed states
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  
  // Focus ring shadow (combined with border)
  focus: '0 0 0 3px rgba(59, 130, 246, 0.2)'
} as const;

// ==================== SEMANTIC SHADOWS ====================

export const semanticShadows = {
  // Cards
  cardDefault: shadows.sm,
  cardHover: shadows.md,
  cardElevated: shadows.lg,
  
  // Buttons
  button: shadows.xs,
  buttonHover: shadows.sm,
  buttonActive: shadows.inner,
  
  // Dropdowns and popovers
  dropdown: shadows.lg,
  popover: shadows.lg,
  tooltip: shadows.md,
  
  // Modals and dialogs
  modal: shadows.xl,
  drawer: shadows['2xl'],
  
  // Inputs
  input: shadows.none,
  inputFocus: shadows.focus,
  
  // Tables
  tableHeader: shadows.xs,  // Sticky header shadow
  tableRow: shadows.none,
  tableRowHover: shadows.xs,
  
  // Navigation
  topNav: shadows.sm,
  sideNav: shadows.md,
  
  // Overlays
  overlay: shadows.xl,
  
  // Toast notifications
  toast: shadows.lg,
  
  // None
  none: shadows.none
} as const;

// ==================== GLOW EFFECTS ====================
// Used sparingly for states requiring attention

export const glows = {
  // Success glow
  success: '0 0 0 3px rgba(34, 197, 94, 0.2)',
  
  // Warning glow
  warning: '0 0 0 3px rgba(245, 158, 11, 0.2)',
  
  // Danger glow
  danger: '0 0 0 3px rgba(239, 68, 68, 0.2)',
  
  // Info/Primary glow
  info: '0 0 0 3px rgba(59, 130, 246, 0.2)',
  
  // Focus glow (keyboard navigation)
  focus: '0 0 0 3px rgba(59, 130, 246, 0.3), 0 0 0 5px rgba(59, 130, 246, 0.1)'
} as const;

// ==================== EXPORTS ====================

export const shadowSystem = {
  shadows,
  semanticShadows,
  glows
} as const;

export type ShadowKey = keyof typeof shadows;
export type SemanticShadowKey = keyof typeof semanticShadows;
export type GlowKey = keyof typeof glows;
