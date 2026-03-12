/**
 * Healthcare Platform Design System
 * 
 * Production-grade design system optimized for high-density healthcare applications.
 * 
 * Usage:
 * - Import semantic tokens (NOT foundation tokens)
 * - Build small, reusable components
 * - Follow standard patterns
 * - Optimize for performance
 * 
 * @module DesignSystem
 */

// ==================== FOUNDATIONS ====================
// Note: Import foundations for reference, but USE SEMANTIC TOKENS in components

export * from './foundations';

// ==================== TOKENS ====================
// Primary exports - USE THESE in components

export * from './tokens';

// ==================== CONVENIENCE EXPORTS ====================

// Semantic tokens (most commonly used)
export {
  text,
  surface,
  border,
  background,
  state,
  focusRing,
  healthcare,
  chart,
  semanticTokens
} from './tokens/semantic';

// Component tokens
export {
  button,
  input,
  card,
  table,
  badge,
  modal,
  drawer,
  tooltip,
  toast,
  form,
  componentTokens
} from './tokens/component';

// Foundation exports (for reference, not direct use)
export {
  colors,
  neutral,
  primary,
  success,
  warning,
  danger,
  info,
  alpha
} from './foundations/colors';

export {
  spacing,
  semanticSpacing,
  layoutSizes
} from './foundations/spacing';

export {
  fontSize,
  fontWeight,
  lineHeight,
  textStyles
} from './foundations/typography';

export {
  radius,
  semanticRadius
} from './foundations/radius';

export {
  shadows,
  semanticShadows,
  glows
} from './foundations/shadows';

export {
  zIndex,
  elevation,
  semanticElevation
} from './foundations/elevation';

export {
  duration,
  easing,
  transitions,
  semanticTransitions,
  animations
} from './foundations/motion';

export {
  borderWidth,
  borderStyle,
  semanticBorders
} from './foundations/borders';
