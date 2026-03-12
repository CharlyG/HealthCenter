/**
 * Dark Theme Semantic Tokens
 * Complete dark mode color system
 */

import { foundations } from '../foundations/tokens';

// Dark mode surfaces
export const darkSurface = {
  default: foundations.colors.neutral[900],      // #1a1a1a - Main background
  elevated: foundations.colors.neutral[800],     // #262626 - Cards, panels
  subtle: foundations.colors.neutral[850],       // #1f1f1f - Sections
  hover: foundations.colors.neutral[750],        // #2d2d2d - Hover states
  active: foundations.colors.neutral[700],       // #333333 - Active states
  overlay: 'rgba(0, 0, 0, 0.7)',                // Modal overlay
};

// Dark mode text colors
export const darkTextColor = {
  primary: foundations.colors.neutral[50],       // #fafafa - Main text
  secondary: foundations.colors.neutral[300],    // #d4d4d4 - Supporting text
  muted: foundations.colors.neutral[500],        // #737373 - Least emphasis
  inverse: foundations.colors.neutral[900],      // #1a1a1a - Text on light
  link: foundations.colors.blue[400],            // #60a5fa - Links
  linkHover: foundations.colors.blue[300],       // #93c5fd - Link hover
};

// Dark mode borders
export const darkBorderColor = {
  default: foundations.colors.neutral[700],      // #404040 - Standard borders
  subtle: foundations.colors.neutral[800],       // #262626 - Subtle dividers
  strong: foundations.colors.neutral[600],       // #525252 - Emphasis borders
  focus: foundations.colors.blue[500],           // #3b82f6 - Focus rings
};

// Dark mode status colors (adjusted for dark backgrounds)
export const darkStatus = {
  success: {
    text: foundations.colors.green[400],         // #4ade80
    bg: 'rgba(74, 222, 128, 0.1)',              // 10% opacity
    border: foundations.colors.green[700],       // #15803d
  },
  danger: {
    text: foundations.colors.red[400],           // #f87171
    bg: 'rgba(248, 113, 113, 0.1)',             // 10% opacity
    border: foundations.colors.red[700],         // #b91c1c
  },
  warning: {
    text: foundations.colors.amber[400],         // #fbbf24
    bg: 'rgba(251, 191, 36, 0.1)',              // 10% opacity
    border: foundations.colors.amber[700],       // #b45309
  },
  info: {
    text: foundations.colors.blue[400],          // #60a5fa
    bg: 'rgba(96, 165, 250, 0.1)',              // 10% opacity
    border: foundations.colors.blue[700],        // #1d4ed8
  },
};

// Dark mode interactive states
export const darkInteractive = {
  primary: {
    default: foundations.colors.blue[500],       // #3b82f6
    hover: foundations.colors.blue[400],         // #60a5fa
    active: foundations.colors.blue[600],        // #2563eb
    disabled: foundations.colors.neutral[700],   // #404040
  },
  secondary: {
    default: foundations.colors.neutral[700],    // #404040
    hover: foundations.colors.neutral[600],      // #525252
    active: foundations.colors.neutral[800],     // #262626
    disabled: foundations.colors.neutral[800],   // #262626
  },
  danger: {
    default: foundations.colors.red[600],        // #dc2626
    hover: foundations.colors.red[500],          // #ef4444
    active: foundations.colors.red[700],         // #b91c1c
    disabled: foundations.colors.neutral[700],   // #404040
  },
};

// Export complete dark theme
export const darkTheme = {
  surface: darkSurface,
  textColor: darkTextColor,
  borderColor: darkBorderColor,
  status: darkStatus,
  interactive: darkInteractive,
  // Keep spacing, typography same as light
};
