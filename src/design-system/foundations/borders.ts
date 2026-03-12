/**
 * Foundation Borders
 * 
 * Border widths and styles for the healthcare platform design system.
 * 
 * @module Foundations/Borders
 */

// ==================== BORDER WIDTHS ====================

export const borderWidth = {
  0: '0',
  1: '1px',
  2: '2px',
  4: '4px',
  8: '8px'
} as const;

// ==================== BORDER STYLES ====================

export const borderStyle = {
  solid: 'solid',
  dashed: 'dashed',
  dotted: 'dotted',
  none: 'none'
} as const;

// ==================== SEMANTIC BORDERS ====================

export const semanticBorders = {
  // Default borders
  default: {
    width: borderWidth[1],
    style: borderStyle.solid
  },
  
  // Strong borders (emphasized)
  strong: {
    width: borderWidth[2],
    style: borderStyle.solid
  },
  
  // Subtle borders (de-emphasized)
  subtle: {
    width: borderWidth[1],
    style: borderStyle.solid
  },
  
  // Dashed borders
  dashed: {
    width: borderWidth[1],
    style: borderStyle.dashed
  },
  
  // Focus rings
  focusRing: {
    width: borderWidth[2],
    style: borderStyle.solid
  },
  
  // Dividers
  divider: {
    width: borderWidth[1],
    style: borderStyle.solid
  },
  
  // Table borders
  tableCell: {
    width: borderWidth[1],
    style: borderStyle.solid
  },
  
  // Card borders
  card: {
    width: borderWidth[1],
    style: borderStyle.solid
  },
  
  // Input borders
  input: {
    width: borderWidth[1],
    style: borderStyle.solid
  },
  
  // None
  none: {
    width: borderWidth[0],
    style: borderStyle.none
  }
} as const;

// ==================== EXPORTS ====================

export const borderSystem = {
  borderWidth,
  borderStyle,
  semanticBorders
} as const;

export type BorderWidthKey = keyof typeof borderWidth;
export type BorderStyleKey = keyof typeof borderStyle;
export type SemanticBorderKey = keyof typeof semanticBorders;
