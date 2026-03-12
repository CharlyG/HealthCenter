/**
 * Foundation Radius
 * 
 * Border radius scale for the healthcare platform design system.
 * Consistent rounding for all UI elements.
 * 
 * @module Foundations/Radius
 */

// ==================== RADIUS SCALE ====================

export const radius = {
  none: '0',
  sm: '0.25rem',   // 4px - Small elements, badges
  md: '0.375rem',  // 6px - Buttons, inputs, cards
  lg: '0.5rem',    // 8px - Large cards, modals
  xl: '0.75rem',   // 12px - Feature cards
  '2xl': '1rem',   // 16px - Hero elements
  full: '9999px'   // Pills, avatars, circular elements
} as const;

// ==================== SEMANTIC RADIUS ====================
// Named radius for specific component types

export const semanticRadius = {
  // Interactive elements
  button: radius.md,
  input: radius.md,
  checkbox: radius.sm,
  
  // Containers
  card: radius.lg,
  modal: radius.lg,
  drawer: radius.none,  // Drawers typically edge-to-edge
  popover: radius.md,
  tooltip: radius.sm,
  
  // Feedback elements
  badge: radius.full,
  pill: radius.full,
  tag: radius.sm,
  alert: radius.md,
  toast: radius.lg,
  
  // Data display
  table: radius.lg,
  tableCell: radius.none,
  avatar: radius.full,
  
  // Layout
  panel: radius.lg,
  section: radius.lg
} as const;

// ==================== EXPORTS ====================

export const radiusSystem = {
  radius,
  semanticRadius
} as const;

export type RadiusKey = keyof typeof radius;
export type SemanticRadiusKey = keyof typeof semanticRadius;
