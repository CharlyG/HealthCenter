/**
 * SkeletonLoader Component
 * 
 * Skeleton loading states that mimic final layout.
 * Part of the Loading States Pattern.
 * 
 * @module UXPatterns/Loading
 */

import { memo } from 'react';

export type SkeletonVariant = 
  | 'text' 
  | 'title' 
  | 'rectangle' 
  | 'circle' 
  | 'rounded'
  | 'button';

export interface SkeletonLoaderProps {
  /** Variant of skeleton */
  variant?: SkeletonVariant;
  
  /** Width (CSS value or number for px) */
  width?: string | number;
  
  /** Height (CSS value or number for px) */
  height?: string | number;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Number of skeleton items to repeat */
  count?: number;
}

/**
 * SkeletonLoader - Animated loading placeholder
 */
export const SkeletonLoader = memo<SkeletonLoaderProps>(({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'title':
        return 'h-8 rounded';
      case 'rectangle':
        return 'rounded';
      case 'circle':
        return 'rounded-full aspect-square';
      case 'rounded':
        return 'rounded-lg';
      case 'button':
        return 'h-10 rounded-md';
      default:
        return 'rounded';
    }
  };

  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (width) {
      style.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height) {
      style.height = typeof height === 'number' ? `${height}px` : height;
    }
    return style;
  };

  const baseClasses = `
    bg-neutral-200 dark:bg-neutral-700
    animate-pulse
    ${getVariantClasses()}
    ${className}
  `;

  if (count === 1) {
    return <div className={baseClasses} style={getStyle()} />;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={baseClasses} style={getStyle()} />
      ))}
    </>
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';
