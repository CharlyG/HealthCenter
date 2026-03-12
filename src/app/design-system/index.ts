/**
 * Design System - Main Entry Point
 * 
 * Central export file for the healthcare platform design system.
 * Import tokens, components, and utilities from here.
 */

// Foundation Tokens
export * from './foundations/tokens';

// Semantic Tokens
export * from './semantic/tokens';

// Components
export * from './components/Button';

// Re-export types
export type {
  Neutral,
  Primary,
  Semantic,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
  Shadow,
  Elevation,
  ZIndex,
  Duration,
  Easing,
  Breakpoint
} from './foundations/tokens';

export type {
  TextColor,
  Surface,
  BorderColor,
  Typography,
  Space,
  Shadow as SemanticShadow,
  Layer,
  IconSize
} from './semantic/tokens';

export type { ButtonProps } from './components/Button';
