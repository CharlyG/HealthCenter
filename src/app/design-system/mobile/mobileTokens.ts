/**
 * Mobile Design System Tokens
 * Optimized for mobile/tablet experiences
 */

import { foundations } from '../foundations/tokens';

// Mobile-optimized spacing (touch-friendly)
export const mobileSpace = {
  xs: '6px',    // Increased from 4px
  sm: '12px',   // Increased from 8px
  md: '20px',   // Increased from 16px
  lg: '28px',   // Increased from 24px
  xl: '40px',   // Increased from 32px
  xxl: '56px',  // Increased from 48px
};

// Mobile-optimized typography (larger for readability)
export const mobileTypography = {
  pageTitle: {
    size: '32px',      // Increased from 28px
    weight: 700,
    lineHeight: 1.2,
  },
  sectionTitle: {
    size: '24px',      // Increased from 20px
    weight: 600,
    lineHeight: 1.3,
  },
  cardTitle: {
    size: '20px',      // Increased from 18px
    weight: 600,
    lineHeight: 1.4,
  },
  body: {
    size: '16px',      // Increased from 14px
    weight: 400,
    lineHeight: 1.6,   // More breathing room
  },
  helper: {
    size: '14px',      // Increased from 12px
    weight: 400,
    lineHeight: 1.5,
  },
};

// Touch target sizes (minimum 44x44px per iOS HIG)
export const mobileTouchTarget = {
  minimum: '44px',     // iOS minimum
  comfortable: '48px', // Android recommended
  large: '56px',       // Large buttons
};

// Mobile-specific breakpoints
export const mobileBreakpoints = {
  small: '320px',      // Small phones
  medium: '375px',     // Standard phones
  large: '428px',      // Large phones
  tablet: '768px',     // Tablets
  desktop: '1024px',   // Desktop
};

// Mobile component tokens
export const mobileComponents = {
  // Bottom Navigation
  bottomNav: {
    height: '64px',
    iconSize: '24px',
    labelSize: '12px',
    activeColor: foundations.colors.blue[600],
    inactiveColor: foundations.colors.neutral[500],
  },
  
  // Mobile Cards
  card: {
    borderRadius: '12px',    // Larger radius
    padding: mobileSpace.md,
    shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  
  // Mobile Buttons
  button: {
    height: mobileTouchTarget.comfortable,
    borderRadius: '10px',
    fontSize: mobileTypography.body.size,
    padding: `${mobileSpace.sm} ${mobileSpace.lg}`,
  },
  
  // Mobile Input Fields
  input: {
    height: mobileTouchTarget.comfortable,
    borderRadius: '8px',
    fontSize: mobileTypography.body.size,
    padding: mobileSpace.sm,
  },
  
  // Mobile List Items
  listItem: {
    minHeight: mobileTouchTarget.comfortable,
    padding: mobileSpace.md,
    borderRadius: '8px',
  },
  
  // Swipe Actions
  swipeAction: {
    width: '80px',
    iconSize: '20px',
  },
};

// Gesture thresholds
export const mobileGestures = {
  swipeThreshold: 50,      // px to trigger swipe
  longPressDelay: 500,     // ms for long press
  doubleTapDelay: 300,     // ms between taps
  scrollThreshold: 10,     // px to trigger scroll
};

// Mobile-specific patterns
export const mobilePatterns = {
  // Safe areas (for notched devices)
  safeArea: {
    top: 'env(safe-area-inset-top)',
    bottom: 'env(safe-area-inset-bottom)',
    left: 'env(safe-area-inset-left)',
    right: 'env(safe-area-inset-right)',
  },
  
  // Pull to refresh
  pullToRefresh: {
    threshold: 80,         // px to trigger
    maxPull: 120,          // max pull distance
    spinnerSize: '24px',
  },
  
  // Bottom sheet
  bottomSheet: {
    headerHeight: '56px',
    borderRadius: '16px 16px 0 0',
    dragHandleHeight: '4px',
    dragHandleWidth: '32px',
  },
};

// Accessibility - larger minimum sizes
export const mobileAccessibility = {
  minFontSize: '16px',           // Prevent zoom on iOS
  minTouchTarget: '44px',        // WCAG AAA
  minContrast: 4.5,              // WCAG AA
  reducedMotion: 'prefers-reduced-motion',
};

// Export complete mobile theme
export const mobileTheme = {
  space: mobileSpace,
  typography: mobileTypography,
  touchTarget: mobileTouchTarget,
  breakpoints: mobileBreakpoints,
  components: mobileComponents,
  gestures: mobileGestures,
  patterns: mobilePatterns,
  accessibility: mobileAccessibility,
};
