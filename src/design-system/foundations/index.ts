/**
 * Design System Foundations
 * 
 * Core design tokens for the healthcare platform.
 * These are the raw building blocks - use semantic tokens in components.
 * 
 * @module Foundations
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radius';
export * from './borders';
export * from './shadows';
export * from './elevation';
export * from './motion';

// Re-export commonly used foundations for convenience
export { colors, neutral, primary, success, warning, danger, info, alpha } from './colors';
export { typography, fontFamily, fontSize, fontWeight, textStyles } from './typography';
export { spacing, semanticSpacing, layoutSizes } from './spacing';
export { radius, semanticRadius } from './radius';
export { borderWidth, borderStyle, semanticBorders } from './borders';
export { shadows, semanticShadows, glows } from './shadows';
export { zIndex, elevation, semanticElevation } from './elevation';
export { duration, easing, transitions, semanticTransitions, animations } from './motion';
