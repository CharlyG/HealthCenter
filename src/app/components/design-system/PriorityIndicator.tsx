/**
 * Design System - Priority Indicator
 * Visual priority indicators for tasks, alerts, and queue items
 * 
 * COMPLIANT WITH:
 * - SCREEN_GENERATION.md - Use semantic tokens
 * - PATTERNS.md - Standard priority indicators
 * - WCAG 2.1 AA - Color + text for accessibility
 */
import React from 'react';
import { status, typography, textColor } from '../../design-system/semantic/tokens';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

interface PriorityIndicatorProps {
  priority: PriorityLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dot' | 'badge';
}

interface PriorityConfig {
  color: string;
  label: string;
  bg?: string;
  border?: string;
}

const priorityConfig: Record<PriorityLevel, PriorityConfig> = {
  critical: {
    color: status.danger.text,
    label: 'Critical',
    bg: status.danger.bg,
    border: status.danger.border,
  },
  high: {
    color: status.warning.text,
    label: 'High',
    bg: status.warning.bg,
    border: status.warning.border,
  },
  medium: {
    color: status.info.text,
    label: 'Medium',
    bg: status.info.bg,
    border: status.info.border,
  },
  low: {
    color: '#6b7280', // neutral[500]
    label: 'Low',
    bg: '#f3f4f6', // neutral[100]
    border: '#e5e7eb', // neutral[200]
  },
};

const sizeMap = {
  sm: {
    dot: 6,
    fontSize: typography.helper.size,
  },
  md: {
    dot: 8,
    fontSize: typography.compactTable.size,
  },
  lg: {
    dot: 10,
    fontSize: typography.body.size,
  },
};

export const PriorityIndicator = React.memo(({ 
  priority, 
  showLabel = false,
  size = 'md',
  variant = 'dot'
}: PriorityIndicatorProps) => {
  const config = priorityConfig[priority];
  const currentSize = sizeMap[size];
  
  if (variant === 'badge') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          backgroundColor: config.bg,
          color: config.color,
          borderColor: config.border,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '0.375rem',
          fontSize: currentSize.fontSize,
          fontWeight: 600,
          padding: '2px 8px',
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: `${currentSize.dot}px`,
            height: `${currentSize.dot}px`,
            borderRadius: '50%',
            backgroundColor: config.color,
          }}
        />
        {config.label}
      </span>
    );
  }
  
  // Dot variant
  return (
    <div 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.5rem' 
      }}
    >
      <div
        style={{
          width: `${currentSize.dot}px`,
          height: `${currentSize.dot}px`,
          borderRadius: '50%',
          backgroundColor: config.color,
          flexShrink: 0,
        }}
        aria-label={`${config.label} priority`}
      />
      {showLabel && (
        <span 
          style={{ 
            fontSize: currentSize.fontSize, 
            color: config.color,
            fontWeight: 500,
          }}
        >
          {config.label}
        </span>
      )}
    </div>
  );
});

PriorityIndicator.displayName = 'PriorityIndicator';