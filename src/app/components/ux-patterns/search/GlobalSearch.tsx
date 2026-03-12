/**
 * GlobalSearch Component
 * 
 * Global search with categorized results.
 * Part of the Global Search Pattern.
 * 
 * Supports:
 * - Partial matches
 * - Search by name, MRN, admission ID, document, caregiver
 * - Grouped results by category
 * - Keyboard navigation
 * 
 * @module UXPatterns/Search
 */

import { memo, useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, FileText, User, Users, Clipboard, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type SearchResultType = 
  | 'patient' 
  | 'admission' 
  | 'document' 
  | 'visit' 
  | 'caregiver'
  | 'order';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  metadata?: string;
  onClick: () => void;
}

export interface SearchCategory {
  type: SearchResultType;
  label: string;
  icon: React.ReactNode;
  results: SearchResult[];
}

export interface GlobalSearchProps {
  /** Callback for search */
  onSearch: (query: string) => Promise<SearchResult[]>;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Show search dialog */
  open: boolean;
  
  /** Callback when dialog should close */
  onClose: () => void;
  
  /** Minimum characters before search */
  minChars?: number;
  
  /** Debounce delay in ms */
  debounceMs?: number;
}

/**
 * GlobalSearch - Search dialog with categorized results
 */
export const GlobalSearch = memo<GlobalSearchProps>(({
  onSearch,
  placeholder = 'Search patients, admissions, documents...',
  open,
  onClose,
  minChars = 2,
  debounceMs = 300
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length >= minChars) {
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const searchResults = await onSearch(query);
          setResults(searchResults);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    } else {
      setResults([]);
      setLoading(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, minChars, debounceMs, onSearch]);

  // Group results by category
  const categories = useMemo<SearchCategory[]>(() => {
    const typeConfig: Record<SearchResultType, { label: string; icon: React.ReactNode }> = {
      patient: { label: 'Patients', icon: <User className="w-4 h-4" /> },
      admission: { label: 'Admissions', icon: <Clipboard className="w-4 h-4" /> },
      document: { label: 'Documents', icon: <FileText className="w-4 h-4" /> },
      visit: { label: 'Visits', icon: <Calendar className="w-4 h-4" /> },
      caregiver: { label: 'Caregivers', icon: <Users className="w-4 h-4" /> },
      order: { label: 'Orders', icon: <FileText className="w-4 h-4" /> }
    };

    const grouped = results.reduce((acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    }, {} as Record<SearchResultType, SearchResult[]>);

    return Object.entries(grouped).map(([type, results]) => ({
      type: type as SearchResultType,
      label: typeConfig[type as SearchResultType].label,
      icon: typeConfig[type as SearchResultType].icon,
      results
    }));
  }, [results]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      results[selectedIndex].onClick();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
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
          {loading && (
            <div className="p-8 text-center text-neutral-600 dark:text-neutral-400">
              Searching...
            </div>
          )}

          {!loading && query.length > 0 && query.length < minChars && (
            <div className="p-8 text-center text-neutral-600 dark:text-neutral-400">
              Type at least {minChars} characters to search
            </div>
          )}

          {!loading && query.length >= minChars && results.length === 0 && (
            <div className="p-8 text-center text-neutral-600 dark:text-neutral-400">
              No results found for "{query}"
            </div>
          )}

          {!loading && categories.length > 0 && (
            <div className="py-2">
              {categories.map((category) => (
                <div key={category.type} className="mb-4 last:mb-0">
                  {/* Category header */}
                  <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50">
                    {category.icon}
                    <span>{category.label}</span>
                    <span className="ml-auto">{category.results.length}</span>
                  </div>

                  {/* Category results */}
                  {category.results.map((result, index) => {
                    const globalIndex = results.indexOf(result);
                    return (
                      <button
                        key={result.id}
                        onClick={() => {
                          result.onClick();
                          onClose();
                        }}
                        className={`
                          w-full px-4 py-3 text-left
                          hover:bg-neutral-50 dark:hover:bg-neutral-800
                          transition-colors
                          ${globalIndex === selectedIndex ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                        `}
                      >
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                            {result.subtitle}
                          </div>
                        )}
                        {result.metadata && (
                          <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-1 font-mono">
                            {result.metadata}
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
            <span>Select</span>
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

GlobalSearch.displayName = 'GlobalSearch';
