/**
 * Foundation Motion
 * 
 * Animation and transition system for the healthcare platform.
 * Subtle, purposeful motion that doesn't distract from clinical workflows.
 * 
 * @module Foundations/Motion
 */

// ==================== DURATION ====================

export const duration = {
  instant: '0ms',
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
  slower: '500ms'
} as const;

// ==================== EASING ====================

export const easing = {
  // Standard easing for most transitions
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  
  // Emphasized easing for important state changes
  emphasized: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  
  // Decelerated easing for entering elements
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  
  // Accelerated easing for exiting elements
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  
  // Linear easing for continuous motion
  linear: 'linear',
  
  // Bounce easing (use sparingly)
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
} as const;

// ==================== TRANSITIONS ====================

export const transitions = {
  // Default transition for interactive elements
  default: `all ${duration.normal} ${easing.standard}`,
  
  // Fast transition for hover states
  fast: `all ${duration.fast} ${easing.standard}`,
  
  // Color transitions
  color: `color ${duration.fast} ${easing.standard}`,
  backgroundColor: `background-color ${duration.fast} ${easing.standard}`,
  borderColor: `border-color ${duration.fast} ${easing.standard}`,
  
  // Transform transitions
  transform: `transform ${duration.normal} ${easing.emphasized}`,
  transformFast: `transform ${duration.fast} ${easing.standard}`,
  
  // Opacity transitions
  opacity: `opacity ${duration.normal} ${easing.standard}`,
  opacityFast: `opacity ${duration.fast} ${easing.standard}`,
  
  // Shadow transitions
  shadow: `box-shadow ${duration.normal} ${easing.standard}`,
  
  // Height/width transitions (use sparingly)
  height: `height ${duration.normal} ${easing.emphasized}`,
  width: `width ${duration.normal} ${easing.emphasized}`,
  
  // All properties
  all: `all ${duration.normal} ${easing.standard}`,
  allFast: `all ${duration.fast} ${easing.standard}`
} as const;

// ==================== SEMANTIC TRANSITIONS ====================

export const semanticTransitions = {
  // Buttons
  button: transitions.fast,
  buttonHover: `background-color ${duration.fast} ${easing.standard}, box-shadow ${duration.fast} ${easing.standard}`,
  
  // Cards
  card: transitions.shadow,
  cardHover: `box-shadow ${duration.normal} ${easing.standard}, transform ${duration.normal} ${easing.standard}`,
  
  // Inputs
  input: transitions.borderColor,
  inputFocus: `border-color ${duration.fast} ${easing.standard}, box-shadow ${duration.fast} ${easing.standard}`,
  
  // Links
  link: transitions.color,
  
  // Modals and drawers
  modalEnter: `opacity ${duration.normal} ${easing.decelerate}, transform ${duration.normal} ${easing.decelerate}`,
  modalExit: `opacity ${duration.fast} ${easing.accelerate}, transform ${duration.fast} ${easing.accelerate}`,
  
  drawerEnter: `transform ${duration.normal} ${easing.emphasized}`,
  drawerExit: `transform ${duration.fast} ${easing.accelerate}`,
  
  // Dropdowns and popovers
  dropdown: `opacity ${duration.fast} ${easing.standard}, transform ${duration.fast} ${easing.standard}`,
  
  // Toasts
  toastEnter: `opacity ${duration.normal} ${easing.decelerate}, transform ${duration.normal} ${easing.decelerate}`,
  toastExit: `opacity ${duration.fast} ${easing.accelerate}, transform ${duration.fast} ${easing.accelerate}`,
  
  // Tooltips
  tooltip: `opacity ${duration.fast} ${easing.standard}`,
  
  // Tabs
  tabIndicator: `transform ${duration.normal} ${easing.emphasized}, width ${duration.normal} ${easing.emphasized}`,
  
  // Collapse/Expand
  collapse: `height ${duration.normal} ${easing.emphasized}, opacity ${duration.normal} ${easing.standard}`,
  
  // Fade
  fade: transitions.opacity,
  fadefast: transitions.opacityFast
} as const;

// ==================== ANIMATIONS ====================

export const animations = {
  // Spin animation for loaders
  spin: {
    animation: 'spin 1s linear infinite',
    keyframes: `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `
  },
  
  // Pulse animation for loading states
  pulse: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    keyframes: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `
  },
  
  // Bounce animation (use sparingly)
  bounce: {
    animation: 'bounce 1s infinite',
    keyframes: `
      @keyframes bounce {
        0%, 100% {
          transform: translateY(-25%);
          animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
        }
        50% {
          transform: translateY(0);
          animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
        }
      }
    `
  },
  
  // Fade in animation
  fadeIn: {
    animation: `fadeIn ${duration.normal} ${easing.decelerate}`,
    keyframes: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `
  },
  
  // Slide in from right (for drawers)
  slideInRight: {
    animation: `slideInRight ${duration.normal} ${easing.emphasized}`,
    keyframes: `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `
  },
  
  // Slide in from bottom (for modals)
  slideInBottom: {
    animation: `slideInBottom ${duration.normal} ${easing.emphasized}`,
    keyframes: `
      @keyframes slideInBottom {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `
  },
  
  // Scale in (for popups)
  scaleIn: {
    animation: `scaleIn ${duration.fast} ${easing.emphasized}`,
    keyframes: `
      @keyframes scaleIn {
        from {
          transform: scale(0.95);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
    `
  },
  
  // Shimmer (for skeleton loaders)
  shimmer: {
    animation: 'shimmer 2s infinite',
    keyframes: `
      @keyframes shimmer {
        0% {
          background-position: -1000px 0;
        }
        100% {
          background-position: 1000px 0;
        }
      }
    `
  }
} as const;

// ==================== MOTION PREFERENCES ====================

/**
 * Respect user's motion preferences
 * Use prefers-reduced-motion media query to disable animations
 */
export const motionPreferences = {
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  noPreference: '@media (prefers-reduced-motion: no-preference)'
} as const;

// ==================== MOTION RULES ====================

/**
 * Motion Guidelines:
 * 
 * 1. Keep animations subtle and purposeful
 * 2. Don't animate during critical clinical workflows
 * 3. Respect prefers-reduced-motion
 * 4. Use fast durations for hover states
 * 5. Use normal durations for state changes
 * 6. Avoid distracting bounce or elastic effects
 * 7. Only animate properties that don't trigger layout recalculation
 * 8. Prefer transform and opacity over other properties
 */

// ==================== EXPORTS ====================

export const motionSystem = {
  duration,
  easing,
  transitions,
  semanticTransitions,
  animations,
  motionPreferences
} as const;

export type DurationKey = keyof typeof duration;
export type EasingKey = keyof typeof easing;
export type TransitionKey = keyof typeof transitions;
export type SemanticTransitionKey = keyof typeof semanticTransitions;
export type AnimationKey = keyof typeof animations;
