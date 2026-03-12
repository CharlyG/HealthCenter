/**
 * Foundation Spacing
 * 
 * Strict spacing scale for the healthcare platform design system.
 * All spacing must use values from this scale for consistency.
 * 
 * @module Foundations/Spacing
 */

// ==================== SPACING SCALE ====================
// Based on 4px grid system

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  7: '1.75rem',   // 28px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  14: '3.5rem',   // 56px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem'     // 256px
} as const;

// ==================== SEMANTIC SPACING ====================
// Named spacing for specific use cases

export const semanticSpacing = {
  // Component internal spacing
  componentXs: spacing[1],    // 4px - Minimal internal padding
  componentSm: spacing[2],    // 8px - Compact components
  componentMd: spacing[3],    // 12px - Standard components
  componentLg: spacing[4],    // 16px - Comfortable components
  
  // Section spacing
  sectionXs: spacing[4],      // 16px - Minimal section gap
  sectionSm: spacing[6],      // 24px - Compact sections
  sectionMd: spacing[8],      // 32px - Standard sections
  sectionLg: spacing[12],     // 48px - Large sections
  
  // Page layout spacing
  pageGutter: spacing[6],     // 24px - Page side padding
  pageSection: spacing[8],    // 32px - Between major page sections
  
  // Card spacing
  cardPadding: spacing[4],    // 16px - Standard card padding
  cardPaddingLg: spacing[6],  // 24px - Large card padding
  cardGap: spacing[4],        // 16px - Gap between cards
  
  // Form spacing
  formFieldGap: spacing[4],   // 16px - Gap between form fields
  formSectionGap: spacing[6], // 24px - Gap between form sections
  formLabelGap: spacing[2],   // 8px - Gap between label and input
  
  // Table spacing
  tableCellPadding: spacing[3],    // 12px - Table cell padding
  tableCellPaddingCompact: spacing[2], // 8px - Compact table padding
  tableRowGap: spacing[0],         // 0 - No gap between rows
  
  // List spacing
  listItemGap: spacing[2],    // 8px - Gap between list items
  listItemPadding: spacing[3],// 12px - List item padding
  
  // Button spacing
  buttonPaddingX: spacing[4], // 16px - Horizontal button padding
  buttonPaddingY: spacing[2], // 8px - Vertical button padding
  buttonGap: spacing[2],      // 8px - Gap between buttons
  
  // Header spacing
  headerHeight: spacing[16],  // 64px - Standard header height
  headerPadding: spacing[4],  // 16px - Header padding
  
  // Sidebar spacing
  sidebarWidth: spacing[64],  // 256px - Standard sidebar width
  sidebarPadding: spacing[4], // 16px - Sidebar padding
  
  // Modal/Drawer spacing
  modalPadding: spacing[6],   // 24px - Modal content padding
  drawerPadding: spacing[6],  // 24px - Drawer content padding
  
  // Icon spacing
  iconGap: spacing[2],        // 8px - Gap between icon and text
  
  // Badge spacing
  badgePaddingX: spacing[2],  // 8px - Badge horizontal padding
  badgePaddingY: spacing[1],  // 4px - Badge vertical padding
  badgeGap: spacing[1]        // 4px - Gap between badges
} as const;

// ==================== LAYOUT SIZES ====================
// Common layout dimensions

export const layoutSizes = {
  // Container max widths
  containerSm: '640px',
  containerMd: '768px',
  containerLg: '1024px',
  containerXl: '1280px',
  container2xl: '1536px',
  containerFull: '100%',
  
  // Common component widths
  inputSm: '120px',
  inputMd: '240px',
  inputLg: '360px',
  inputFull: '100%',
  
  // Common component heights
  inputHeight: '36px',
  inputHeightSm: '32px',
  inputHeightLg: '40px',
  
  buttonHeight: '36px',
  buttonHeightSm: '32px',
  buttonHeightLg: '40px',
  
  // Navigation
  topNavHeight: '56px',
  sideNavWidth: '240px',
  sideNavWidthCollapsed: '64px',
  
  // Panels and drawers
  drawerWidthSm: '360px',
  drawerWidthMd: '480px',
  drawerWidthLg: '640px',
  drawerWidthXl: '800px',
  
  modalWidthSm: '400px',
  modalWidthMd: '600px',
  modalWidthLg: '800px',
  modalWidthXl: '1000px',
  
  // Tables
  tableMinWidth: '800px',
  tableColumnMinWidth: '100px',
  tableColumnMaxWidth: '400px'
} as const;

// ==================== EXPORTS ====================

export const spacingSystem = {
  spacing,
  semanticSpacing,
  layoutSizes
} as const;

export type SpacingKey = keyof typeof spacing;
export type SemanticSpacingKey = keyof typeof semanticSpacing;
export type LayoutSizeKey = keyof typeof layoutSizes;
