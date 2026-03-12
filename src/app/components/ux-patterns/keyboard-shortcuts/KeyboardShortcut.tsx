/**
 * KeyboardShortcut Component
 * 
 * Visual display of keyboard shortcuts.
 * Part of the Keyboard Shortcuts Pattern.
 * 
 * @module UXPatterns/KeyboardShortcuts
 */

import { memo } from 'react';

export interface KeyboardShortcutProps {
  /** Keyboard keys */
  keys: string[];
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * KeyboardShortcut - Display keyboard shortcut keys
 */
export const KeyboardShortcut = memo<KeyboardShortcutProps>(({
  keys,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs px-1 py-0.5',
    md: 'text-sm px-1.5 py-0.5',
    lg: 'text-base px-2 py-1'
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {keys.map((key, index) => (
        <span key={index} className="flex items-center gap-1">
          <kbd
            className={`
              inline-flex items-center justify-center
              font-mono font-medium
              bg-neutral-100 dark:bg-neutral-700
              border border-neutral-300 dark:border-neutral-600
              rounded
              ${sizeClasses[size]}
            `}
          >
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-neutral-400">+</span>
          )}
        </span>
      ))}
    </div>
  );
});

KeyboardShortcut.displayName = 'KeyboardShortcut';
