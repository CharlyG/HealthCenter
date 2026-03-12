/**
 * CommandPalette Component
 * 
 * Command palette for quick access to actions via keyboard.
 * Part of the Keyboard Shortcuts Pattern.
 * 
 * @module UXPatterns/KeyboardShortcuts
 */

import { memo, useState, useEffect, useRef, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useKeyboardShortcut } from './useKeyboardShortcut';

export interface CommandAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  category?: string;
  keywords?: string[];
  onExecute: () => void;
  shortcut?: string[];
}

export interface CommandPaletteProps {
  /** Available actions */
  actions: CommandAction[];
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Show command palette */
  open?: boolean;
  
  /** Callback when palette should close */
  onClose?: () => void;
  
  /** Enable Ctrl+K shortcut (default: true) */
  enableShortcut?: boolean;
}

/**
 * CommandPalette - Quick action command palette
 */
export const CommandPalette = memo<CommandPaletteProps>(({
  actions,
  placeholder = 'Type a command or search...',
  open: controlledOpen,
  onClose,
  enableShortcut = true
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  // Register Ctrl+K shortcut
  if (enableShortcut) {
    useKeyboardShortcut({
      key: 'k',
      ctrl: true,
      callback: () => {
        if (controlledOpen === undefined) {
          setInternalOpen(prev => !prev);
        } else {
          onClose?.();
        }
      }
    });
  }

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter actions based on query
  const filteredActions = useMemo(() => {
    if (!query.trim()) return actions;

    const lowerQuery = query.toLowerCase();
    return actions.filter(action => {
      const labelMatch = action.label.toLowerCase().includes(lowerQuery);
      const categoryMatch = action.category?.toLowerCase().includes(lowerQuery);
      const keywordMatch = action.keywords?.some(kw => kw.toLowerCase().includes(lowerQuery));
      return labelMatch || categoryMatch || keywordMatch;
    });
  }, [query, actions]);

  // Group by category
  const categorizedActions = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {};
    
    filteredActions.forEach(action => {
      const category = action.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(action);
    });

    return Object.entries(groups).map(([category, actions]) => ({
      category,
      actions
    }));
  }, [filteredActions]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleClose = () => {
    if (controlledOpen === undefined) {
      setInternalOpen(false);
    } else {
      onClose?.();
    }
    setQuery('');
  };

  const handleExecute = (action: CommandAction) => {
    action.onExecute();
    handleClose();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredActions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredActions[selectedIndex]) {
      e.preventDefault();
      handleExecute(filteredActions[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20 px-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-lg shadow-xl overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="
              flex-1 bg-transparent border-none outline-none
              text-neutral-900 dark:text-neutral-100
              placeholder:text-neutral-400
            "
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {filteredActions.length === 0 && (
            <div className="p-8 text-center text-neutral-600 dark:text-neutral-400">
              {query ? `No commands found for "${query}"` : 'No commands available'}
            </div>
          )}

          {categorizedActions.length > 0 && (
            <div className="py-2">
              {categorizedActions.map(({ category, actions }) => (
                <div key={category} className="mb-2 last:mb-0">
                  {/* Category header */}
                  <div className="px-4 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    {category}
                  </div>

                  {/* Actions */}
                  {actions.map((action) => {
                    const globalIndex = filteredActions.indexOf(action);
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleExecute(action)}
                        className={`
                          w-full px-4 py-2.5 text-left
                          hover:bg-neutral-50 dark:hover:bg-neutral-800
                          transition-colors
                          flex items-center justify-between gap-3
                          ${globalIndex === selectedIndex ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {action.icon && (
                            <span className="w-5 h-5 flex-shrink-0 text-neutral-600 dark:text-neutral-400">
                              {action.icon}
                            </span>
                          )}
                          <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {action.label}
                          </span>
                        </div>

                        {action.shortcut && (
                          <div className="flex items-center gap-1">
                            {action.shortcut.map((key, index) => (
                              <span key={index} className="flex items-center gap-1">
                                <kbd className="
                                  px-1.5 py-0.5 text-xs font-mono
                                  bg-neutral-100 dark:bg-neutral-700
                                  border border-neutral-300 dark:border-neutral-600
                                  rounded
                                ">
                                  {key}
                                </kbd>
                                {index < action.shortcut!.length - 1 && (
                                  <span className="text-neutral-400 text-xs">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with keyboard hints */}
        <div className="
          px-4 py-2 border-t border-neutral-200 dark:border-neutral-700
          bg-neutral-50 dark:bg-neutral-800/50
          flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400
        ">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded">↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded">Enter</kbd>
            <span>Execute</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded">Esc</kbd>
            <span>Close</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

CommandPalette.displayName = 'CommandPalette';
