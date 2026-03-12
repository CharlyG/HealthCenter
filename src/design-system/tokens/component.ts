/**
 * Component Tokens
 * 
 * Component-specific design tokens built on semantic tokens.
 * Provides consistent styling for all reusable components.
 * 
 * @module Tokens/Component
 */

import { spacing, semanticSpacing } from '../foundations/spacing';
import { radius, semanticRadius } from '../foundations/radius';
import { fontSize, fontWeight, lineHeight } from '../foundations/typography';
import { semanticShadows } from '../foundations/shadows';
import { semanticTransitions } from '../foundations/motion';
import { text, surface, border, background, state, focusRing } from './semantic';

// ==================== BUTTON TOKENS ====================

export const buttonTokens = {
  // Sizes
  size: {
    sm: {
      height: '32px',
      paddingX: spacing[3],
      paddingY: spacing[1],
      fontSize: fontSize.sm,
      gap: spacing[1]
    },
    md: {
      height: '36px',
      paddingX: spacing[4],
      paddingY: spacing[2],
      fontSize: fontSize.md,
      gap: spacing[2]
    },
    lg: {
      height: '40px',
      paddingX: spacing[5],
      paddingY: spacing[2],
      fontSize: fontSize.md,
      gap: spacing[2]
    }
  },
  
  // Variants
  variant: {
    primary: {
      bg: background.button.primary,
      bgHover: background.button.primaryHover,
      bgActive: background.button.primaryActive,
      text: text.inverted,
      border: 'transparent'
    },
    secondary: {
      bg: background.button.secondary,
      bgHover: background.button.secondaryHover,
      bgActive: background.button.secondaryActive,
      text: text.primary,
      border: border.default
    },
    danger: {
      bg: background.button.danger,
      bgHover: background.button.dangerHover,
      bgActive: background.button.dangerActive,
      text: text.inverted,
      border: 'transparent'
    },
    ghost: {
      bg: background.button.ghost,
      bgHover: background.button.ghostHover,
      bgActive: background.button.ghostActive,
      text: text.primary,
      border: 'transparent'
    }
  },
  
  // Common properties
  radius: semanticRadius.button,
  fontWeight: fontWeight.medium,
  transition: semanticTransitions.button,
  shadow: semanticShadows.button,
  shadowHover: semanticShadows.buttonHover,
  focusRing: focusRing.default
} as const;

// ==================== INPUT TOKENS ====================

export const inputTokens = {
  // Sizes
  size: {
    sm: {
      height: '32px',
      paddingX: spacing[3],
      paddingY: spacing[1],
      fontSize: fontSize.sm
    },
    md: {
      height: '36px',
      paddingX: spacing[3],
      paddingY: spacing[2],
      fontSize: fontSize.md
    },
    lg: {
      height: '40px',
      paddingX: spacing[4],
      paddingY: spacing[2],
      fontSize: fontSize.md
    }
  },
  
  // States
  state: {
    default: {
      bg: background.input.default,
      border: border.default,
      text: text.primary
    },
    hover: {
      bg: background.input.hover,
      border: border.hover,
      text: text.primary
    },
    focus: {
      bg: background.input.focus,
      border: border.focus,
      text: text.primary,
      shadow: focusRing.default
    },
    disabled: {
      bg: background.input.disabled,
      border: border.disabled,
      text: text.disabled
    },
    error: {
      bg: background.input.default,
      border: state.danger.border,
      text: text.primary,
      shadow: focusRing.danger
    }
  },
  
  // Common properties
  radius: semanticRadius.input,
  fontWeight: fontWeight.normal,
  transition: semanticTransitions.input,
  placeholder: text.muted
} as const;

// ==================== CARD TOKENS ====================

export const cardTokens = {
  // Variants
  variant: {
    default: {
      bg: surface.elevated,
      border: border.default,
      shadow: semanticShadows.cardDefault
    },
    elevated: {
      bg: surface.elevated,
      border: 'transparent',
      shadow: semanticShadows.cardElevated
    },
    outlined: {
      bg: surface.default,
      border: border.default,
      shadow: 'none'
    },
    subtle: {
      bg: surface.subtle,
      border: 'transparent',
      shadow: 'none'
    }
  },
  
  // Common properties
  padding: semanticSpacing.cardPadding,
  paddingLg: semanticSpacing.cardPaddingLg,
  radius: semanticRadius.card,
  transition: semanticTransitions.card,
  hoverShadow: semanticShadows.cardHover
} as const;

// ==================== TABLE TOKENS ====================

export const tableTokens = {
  // Cell padding
  cellPadding: semanticSpacing.tableCellPadding,
  cellPaddingCompact: semanticSpacing.tableCellPaddingCompact,
  
  // Row states
  row: {
    bg: surface.default,
    bgHover: surface.hover,
    bgSelected: surface.selected,
    bgStriped: surface.subtle,
    border: border.subtle
  },
  
  // Header
  header: {
    bg: surface.subtle,
    text: text.secondary,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.base,
    shadow: semanticShadows.tableHeader
  },
  
  // Cell
  cell: {
    text: text.primary,
    fontSize: fontSize.base,
    lineHeight: lineHeight.tight
  },
  
  // Borders
  border: border.default,
  borderStrong: border.strong,
  
  // Common properties
  radius: semanticRadius.table,
  transition: semanticTransitions.fast
} as const;

// ==================== BADGE TOKENS ====================

export const badgeTokens = {
  // Sizes
  size: {
    sm: {
      paddingX: spacing[2],
      paddingY: spacing[1],
      fontSize: fontSize.xs,
      height: '20px'
    },
    md: {
      paddingX: spacing[2],
      paddingY: spacing[1],
      fontSize: fontSize.sm,
      height: '24px'
    }
  },
  
  // Variants
  variant: {
    neutral: {
      bg: background.badge.neutral,
      text: text.secondary
    },
    primary: {
      bg: background.badge.primary,
      text: text.brand
    },
    success: {
      bg: background.badge.success,
      text: state.success.text
    },
    warning: {
      bg: background.badge.warning,
      text: state.warning.text
    },
    danger: {
      bg: background.badge.danger,
      text: state.danger.text
    },
    info: {
      bg: background.badge.info,
      text: state.info.text
    }
  },
  
  // Common properties
  radius: semanticRadius.badge,
  fontWeight: fontWeight.medium,
  gap: spacing[1]
} as const;

// ==================== MODAL TOKENS ====================

export const modalTokens = {
  // Sizes
  size: {
    sm: {
      width: '400px',
      padding: spacing[6]
    },
    md: {
      width: '600px',
      padding: spacing[6]
    },
    lg: {
      width: '800px',
      padding: spacing[6]
    },
    xl: {
      width: '1000px',
      padding: spacing[8]
    },
    full: {
      width: '100%',
      padding: spacing[8]
    }
  },
  
  // Common properties
  bg: surface.elevated,
  radius: semanticRadius.modal,
  shadow: semanticShadows.modal,
  backdropBg: surface.overlay,
  
  // Header
  header: {
    padding: spacing[6],
    borderBottom: border.default,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold
  },
  
  // Footer
  footer: {
    padding: spacing[6],
    borderTop: border.default,
    gap: spacing[3]
  },
  
  // Transitions
  transition: semanticTransitions.modalEnter,
  transitionExit: semanticTransitions.modalExit
} as const;

// ==================== DRAWER TOKENS ====================

export const drawerTokens = {
  // Sizes
  size: {
    sm: { width: '360px' },
    md: { width: '480px' },
    lg: { width: '640px' },
    xl: { width: '800px' }
  },
  
  // Common properties
  bg: surface.elevated,
  shadow: semanticShadows.drawer,
  backdropBg: surface.overlay,
  padding: semanticSpacing.drawerPadding,
  
  // Header
  header: {
    padding: spacing[6],
    borderBottom: border.default,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold
  },
  
  // Transitions
  transition: semanticTransitions.drawerEnter,
  transitionExit: semanticTransitions.drawerExit
} as const;

// ==================== TOOLTIP TOKENS ====================

export const tooltipTokens = {
  bg: surface.inverted,
  text: text.inverted,
  padding: spacing[2],
  fontSize: fontSize.sm,
  radius: semanticRadius.tooltip,
  shadow: semanticShadows.tooltip,
  maxWidth: '240px',
  transition: semanticTransitions.tooltip
} as const;

// ==================== TOAST TOKENS ====================

export const toastTokens = {
  // Variants
  variant: {
    success: {
      bg: state.success.bg,
      border: state.success.border,
      text: state.success.text,
      icon: state.success.icon
    },
    warning: {
      bg: state.warning.bg,
      border: state.warning.border,
      text: state.warning.text,
      icon: state.warning.icon
    },
    danger: {
      bg: state.danger.bg,
      border: state.danger.border,
      text: state.danger.text,
      icon: state.danger.icon
    },
    info: {
      bg: state.info.bg,
      border: state.info.border,
      text: state.info.text,
      icon: state.info.icon
    }
  },
  
  // Common properties
  padding: spacing[4],
  radius: semanticRadius.toast,
  shadow: semanticShadows.toast,
  minWidth: '320px',
  maxWidth: '480px',
  
  // Transitions
  transition: semanticTransitions.toastEnter,
  transitionExit: semanticTransitions.toastExit
} as const;

// ==================== FORM TOKENS ====================

export const formTokens = {
  // Label
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: text.primary,
    marginBottom: spacing[2]
  },
  
  // Helper text
  helper: {
    fontSize: fontSize.sm,
    color: text.muted,
    marginTop: spacing[1]
  },
  
  // Error text
  error: {
    fontSize: fontSize.sm,
    color: state.danger.text,
    marginTop: spacing[1]
  },
  
  // Field spacing
  fieldGap: semanticSpacing.formFieldGap,
  sectionGap: semanticSpacing.formSectionGap,
  labelGap: semanticSpacing.formLabelGap
} as const;

// ==================== EXPORTS ====================

export const componentTokens = {
  button: buttonTokens,
  input: inputTokens,
  card: cardTokens,
  table: tableTokens,
  badge: badgeTokens,
  modal: modalTokens,
  drawer: drawerTokens,
  tooltip: tooltipTokens,
  toast: toastTokens,
  form: formTokens
} as const;

// Export individual component tokens for convenience
export {
  buttonTokens as button,
  inputTokens as input,
  cardTokens as card,
  tableTokens as table,
  badgeTokens as badge,
  modalTokens as modal,
  drawerTokens as drawer,
  tooltipTokens as tooltip,
  toastTokens as toast,
  formTokens as form
};
