/**
 * CollapsibleSection Component
 * 
 * Collapsible section for progressive disclosure in forms.
 * Part of the Progressive Disclosure Pattern.
 * 
 * @module UXPatterns/ProgressiveDisclosure
 */

import { memo, ReactNode, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CollapsibleSectionProps {
  /** Section title */
  title: string;
  
  /** Section content */
  children: ReactNode;
  
  /** Initially expanded */
  defaultExpanded?: boolean;
  
  /** Controlled expanded state */
  expanded?: boolean;
  
  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  
  /** Show badge/count */
  badge?: string | number;
  
  /** Description text */
  description?: string;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Variant */
  variant?: 'default' | 'bordered' | 'subtle';
}

/**
 * CollapsibleSection - Expandable section for forms
 */
export const CollapsibleSection = memo<CollapsibleSectionProps>(({
  title,
  children,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  badge,
  description,
  className = '',
  variant = 'default'
}) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  
  const handleToggle = () => {
    const newValue = !isExpanded;
    setInternalExpanded(newValue);
    onExpandedChange?.(newValue);
  };

  const variantClasses = {
    default: 'bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg',
    bordered: 'border border-neutral-200 dark:border-neutral-700 rounded-lg',
    subtle: 'border-b border-neutral-200 dark:border-neutral-700'
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {/* Header */}
      <button
        onClick={handleToggle}
        className={`
          w-full flex items-center justify-between gap-3
          px-4 py-3 text-left
          hover:bg-neutral-100 dark:hover:bg-neutral-800
          transition-colors
          ${variant === 'default' || variant === 'bordered' ? 'rounded-lg' : ''}
        `}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-shrink-0 text-neutral-600 dark:text-neutral-400">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {title}
              </h3>
              {badge !== undefined && (
                <span className="
                  inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                  bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300
                ">
                  {badge}
                </span>
              )}
            </div>
            
            {description && !isExpanded && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 truncate">
                {description}
              </p>
            )}
          </div>
        </div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2">
              {description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  {description}
                </p>
              )}
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

CollapsibleSection.displayName = 'CollapsibleSection';
