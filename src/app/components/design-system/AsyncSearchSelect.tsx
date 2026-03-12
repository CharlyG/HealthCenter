/**
 * AsyncSearchSelect Component
 * Searchable select with async data loading
 * Used for patient search, clinician lookup, location search, etc.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';

export interface AsyncSearchSelectOption {
  value: string;
  label: string;
  metadata?: any;
}

export interface AsyncSearchSelectProps {
  value?: string;
  onValueChange: (value: string, option?: AsyncSearchSelectOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  onSearch: (query: string) => Promise<AsyncSearchSelectOption[]>;
  debounceMs?: number;
  minSearchLength?: number;
  disabled?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function AsyncSearchSelect({
  value,
  onValueChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  onSearch,
  debounceMs = 300,
  minSearchLength = 2,
  disabled = false,
  emptyMessage = 'No results found',
  className,
}: AsyncSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<AsyncSearchSelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<AsyncSearchSelectOption | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Search function with debouncing
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minSearchLength) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await onSearch(searchQuery);
        setOptions(results);
      } catch (error) {
        console.error('Search error:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [onSearch, minSearchLength]
  );

  // Debounced search on query change
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, performSearch, debounceMs]);

  // Handle selection
  const handleSelect = (option: AsyncSearchSelectOption) => {
    setSelectedOption(option);
    onValueChange(option.value, option);
    setOpen(false);
    setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between',
            !selectedOption && 'text-gray-500',
            className
          )}
        >
          {selectedOption?.label || placeholder}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-5 animate-spin text-gray-400" />
              </div>
            )}
            {!loading && query.length < minSearchLength && (
              <CommandEmpty>
                Type at least {minSearchLength} characters to search
              </CommandEmpty>
            )}
            {!loading && query.length >= minSearchLength && options.length === 0 && (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}
            {!loading && options.length > 0 && (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        'mr-2 size-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
