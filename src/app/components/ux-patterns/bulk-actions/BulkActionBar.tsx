/**
 * BulkActionBar Component
 * 
 * Action bar for bulk operations on selected records.
 * Appears only when items are selected.
 * Part of the Bulk Action Pattern.
 * 
 * @module UXPatterns/BulkActions
 */

import { memo, ReactNode } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface BulkAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}

export interface BulkActionBarProps {
  /** Number of selected items */
  selectedCount: number;
  
  /** Total number of items */
  totalCount?: number;
  
  /** Available bulk actions */
  actions: BulkAction[];
  
  /** Callback when selection is cleared */
  onClearSelection: () => void;
  
  /** Custom selection message */
  selectionMessage?: string;
  
  /** Position of the bar */
  position?: 'top' | 'bottom';
  
  /** Show/hide the bar */
  visible?: boolean;
}

/**
 * BulkActionBar - Toolbar for bulk actions
 */
export const BulkActionBar = memo<BulkActionBarProps>(({
  selectedCount,
  totalCount,
  actions,
  onClearSelection,
  selectionMessage,
  position = 'top',
  visible = true
}) => {
  const isVisible = visible && selectedCount > 0;

  const defaultMessage = totalCount
    ? `${selectedCount} of ${totalCount} selected`
    : `${selectedCount} selected`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
          transition={{ duration: 0.2 }}
          className={`
            bg-primary-600 dark:bg-primary-700 text-white
            px-4 py-3 rounded-lg shadow-lg
            flex items-center justify-between gap-4
            ${position === 'bottom' ? 'mt-4' : 'mb-4'}
          `}
        >
          {/* Selection info */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectionMessage || defaultMessage}
            </span>
            
            <button
              onClick={onClearSelection}
              className="
                flex items-center gap-1 text-sm
                hover:bg-primary-700 dark:hover:bg-primary-800
                px-2 py-1 rounded transition-colors
              "
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-md
                  text-sm font-medium transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    action.variant === 'primary'
                      ? 'bg-white text-primary-600 hover:bg-neutral-100'
                      : action.variant === 'danger'
                      ? 'bg-danger-600 text-white hover:bg-danger-700'
                      : 'bg-primary-700 text-white hover:bg-primary-800 dark:bg-primary-800 dark:hover:bg-primary-900'
                  }
                `}
              >
                {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

BulkActionBar.displayName = 'BulkActionBar';
