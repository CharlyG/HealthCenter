/**
 * Button Component
 * 
 * Primary action component with multiple variants and sizes.
 * 
 * Features:
 * - Multiple variants (primary, secondary, danger, ghost, link)
 * - Three sizes (sm, base, lg)
 * - Loading state
 * - Disabled state
 * - Icon support (leading/trailing)
 * - Full width option
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="base">Save Patient</Button>
 * <Button variant="danger" loading>Deleting...</Button>
 * <Button variant="ghost" icon={<PlusIcon />}>Add Item</Button>
 * ```
 */

import React, { forwardRef } from 'react';
import { textColor, bgState, borderColor, borderRadius, buttonSize } from '../../semantic/tokens';
import { duration, easing } from '../../foundations/tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'link';
  
  /** Size preset */
  size?: 'sm' | 'base' | 'lg';
  
  /** Loading state - shows spinner and disables button */
  loading?: boolean;
  
  /** Icon element (leading) */
  icon?: React.ReactNode;
  
  /** Icon element (trailing) */
  iconRight?: React.ReactNode;
  
  /** Full width button */
  fullWidth?: boolean;
  
  /** Button children */
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'base',
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Variant styles
    const variantStyles = {
      primary: {
        bg: bgState.primaryDefault,
        bgHover: bgState.primaryHover,
        bgActive: bgState.primaryActive,
        bgDisabled: bgState.primaryDisabled,
        text: textColor.inverted,
        border: 'transparent'
      },
      secondary: {
        bg: bgState.secondaryDefault,
        bgHover: bgState.secondaryHover,
        bgActive: bgState.secondaryActive,
        bgDisabled: bgState.secondaryDisabled,
        text: textColor.primary,
        border: borderColor.default
      },
      danger: {
        bg: bgState.dangerDefault,
        bgHover: bgState.dangerHover,
        bgActive: bgState.dangerActive,
        bgDisabled: bgState.primaryDisabled,
        text: textColor.inverted,
        border: 'transparent'
      },
      success: {
        bg: bgState.successDefault,
        bgHover: bgState.successHover,
        bgActive: bgState.successActive,
        bgDisabled: bgState.primaryDisabled,
        text: textColor.inverted,
        border: 'transparent'
      },
      ghost: {
        bg: bgState.ghostDefault,
        bgHover: bgState.ghostHover,
        bgActive: bgState.ghostActive,
        bgDisabled: 'transparent',
        text: textColor.primary,
        border: 'transparent'
      },
      link: {
        bg: 'transparent',
        bgHover: 'transparent',
        bgActive: 'transparent',
        bgDisabled: 'transparent',
        text: textColor.link,
        border: 'transparent'
      }
    };

    const styles = variantStyles[variant];

    // Size styles
    const sizeConfig = {
      sm: buttonSize.sm,
      base: buttonSize.base,
      lg: buttonSize.lg
    };

    const sizeStyle = sizeConfig[size];

    // Base styles
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontWeight: 500,
      borderRadius: borderRadius.default,
      transition: `background-color ${duration.base} ${easing.out}, border-color ${duration.base} ${easing.out}`,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      userSelect: 'none' as const,
      outline: 'none',
      border: variant === 'secondary' ? `1px solid ${styles.border}` : 'none',
      width: fullWidth ? '100%' : 'auto'
    };

    // State-dependent styles
    const stateStyles = isDisabled
      ? {
          backgroundColor: styles.bgDisabled,
          color: textColor.disabled,
          opacity: 0.6
        }
      : {
          backgroundColor: styles.bg,
          color: styles.text
        };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={className}
        style={{
          ...baseStyles,
          ...stateStyles,
          height: sizeStyle.height,
          padding: sizeStyle.padding,
          fontSize: sizeStyle.fontSize
        }}
        onMouseEnter={(e) => {
          if (!isDisabled && variant !== 'link') {
            e.currentTarget.style.backgroundColor = styles.bgHover;
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = styles.bg;
          }
        }}
        onMouseDown={(e) => {
          if (!isDisabled && variant !== 'link') {
            e.currentTarget.style.backgroundColor = styles.bgActive;
          }
        }}
        onMouseUp={(e) => {
          if (!isDisabled && variant !== 'link') {
            e.currentTarget.style.backgroundColor = styles.bgHover;
          }
        }}
        {...props}
      >
        {loading && <Spinner size={size} />}
        {!loading && icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
        {children}
        {!loading && iconRight && <span style={{ display: 'flex', alignItems: 'center' }}>{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Loading spinner component
const Spinner: React.FC<{ size: 'sm' | 'base' | 'lg' }> = ({ size }) => {
  const sizeMap = {
    sm: '14px',
    base: '16px',
    lg: '18px'
  };

  return (
    <svg
      width={sizeMap[size]}
      height={sizeMap[size]}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{
        animation: 'spin 1s linear infinite'
      }}
    >
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
    </svg>
  );
};

export default Button;
