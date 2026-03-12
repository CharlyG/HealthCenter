/**
 * Foundation Elevation
 * 
 * Elevation system combining z-index and shadows for layering UI elements.
 * Ensures consistent stacking order across the application.
 * 
 * @module Foundations/Elevation
 */

// ==================== Z-INDEX SCALE ====================

export const zIndex = {
  // Base layer - default content
  base: 0,
  
  // Slightly elevated - sticky headers, floating elements
  raised: 10,
  
  // Dropdowns, tooltips, popovers
  dropdown: 50,
  
  // Sticky elements (table headers, page headers)
  sticky: 100,
  
  // Fixed elements (navigation, toolbars)
  fixed: 200,
  
  // Overlays (modal backdrops)
  overlay: 400,
  
  // Modals and dialogs
  modal: 500,
  
  // Drawers and side panels
  drawer: 600,
  
  // Popovers on top of modals
  popover: 700,
  
  // Toasts and notifications
  toast: 800,
  
  // Tooltips (highest - always visible)
  tooltip: 900,
  
  // Maximum elevation (emergency use only)
  max: 9999
} as const;

// ==================== ELEVATION LEVELS ====================
// Combines z-index with appropriate shadows

export const elevation = {
  // Level 0: Base content (no elevation)
  level0: {
    zIndex: zIndex.base,
    shadow: 'none'
  },
  
  // Level 1: Slightly raised elements (cards)
  level1: {
    zIndex: zIndex.base,
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
  },
  
  // Level 2: Elevated elements (elevated cards, sticky headers)
  level2: {
    zIndex: zIndex.raised,
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
  },
  
  // Level 3: Floating elements (dropdowns, tooltips)
  level3: {
    zIndex: zIndex.dropdown,
    shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
  },
  
  // Level 4: Fixed navigation
  level4: {
    zIndex: zIndex.fixed,
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
  },
  
  // Level 5: Modals and dialogs
  level5: {
    zIndex: zIndex.modal,
    shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
  },
  
  // Level 6: Drawers
  level6: {
    zIndex: zIndex.drawer,
    shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  
  // Level 7: Toast notifications
  level7: {
    zIndex: zIndex.toast,
    shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
  }
} as const;

// ==================== SEMANTIC ELEVATION ====================

export const semanticElevation = {
  // Content
  contentDefault: elevation.level0,
  contentRaised: elevation.level1,
  
  // Cards
  cardDefault: elevation.level1,
  cardElevated: elevation.level2,
  
  // Navigation
  topNav: elevation.level4,
  sideNav: elevation.level4,
  
  // Dropdowns and popovers
  dropdown: elevation.level3,
  popover: elevation.level3,
  tooltip: {
    zIndex: zIndex.tooltip,
    shadow: elevation.level3.shadow
  },
  
  // Modals and drawers
  modalBackdrop: {
    zIndex: zIndex.overlay,
    shadow: 'none'
  },
  modal: elevation.level5,
  drawer: elevation.level6,
  
  // Sticky elements
  stickyHeader: {
    zIndex: zIndex.sticky,
    shadow: elevation.level2.shadow
  },
  
  // Notifications
  toast: elevation.level7,
  alert: elevation.level1
} as const;

// ==================== STACKING CONTEXT RULES ====================

/**
 * Stacking Context Rules:
 * 
 * 1. Base content (z-index: 0)
 *    - Page content, cards, tables
 * 
 * 2. Raised elements (z-index: 10)
 *    - Elevated cards, sticky elements
 * 
 * 3. Floating elements (z-index: 50)
 *    - Dropdowns, date pickers, autocomplete
 * 
 * 4. Sticky elements (z-index: 100)
 *    - Sticky table headers, sticky page headers
 * 
 * 5. Fixed navigation (z-index: 200)
 *    - Top navigation, side navigation
 * 
 * 6. Overlays (z-index: 400)
 *    - Modal backdrops, drawer backdrops
 * 
 * 7. Modals (z-index: 500)
 *    - Dialog boxes, confirmation modals
 * 
 * 8. Drawers (z-index: 600)
 *    - Side drawers, inspector panels
 * 
 * 9. Popovers on modals (z-index: 700)
 *    - Dropdowns within modals
 * 
 * 10. Toast notifications (z-index: 800)
 *     - Success/error toasts, system notifications
 * 
 * 11. Tooltips (z-index: 900)
 *     - Always visible, highest priority
 */

// ==================== EXPORTS ====================

export const elevationSystem = {
  zIndex,
  elevation,
  semanticElevation
} as const;

export type ZIndexKey = keyof typeof zIndex;
export type ElevationLevel = keyof typeof elevation;
export type SemanticElevationKey = keyof typeof semanticElevation;
