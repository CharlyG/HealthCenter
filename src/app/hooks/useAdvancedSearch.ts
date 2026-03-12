/**
 * useAdvancedSearch Hook
 * 
 * Provides full-text search with advanced filtering capabilities
 * 
 * Features:
 * - Full-text search across multiple fields
 * - ICD-10 code search
 * - Medication search
 * - Date range filtering
 * - Save and load search filters
 * - Search history
 * - Fuzzy matching
 */

import { useState, useEffect, useMemo, useCallback } from 'react';

export interface SearchFilter {
  query: string;
  fields?: string[]; // Which fields to search
  icd10Codes?: string[];
  medications?: string[];
  dateFrom?: string;
  dateTo?: string;
  documentType?: string;
  status?: string;
  author?: string;
  patientId?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filter: SearchFilter;
  createdAt: Date;
}

interface SearchResult<T> {
  item: T;
  score: number; // Relevance score 0-1
  matches: Array<{
    field: string;
    value: string;
    highlight: string;
  }>;
}

interface UseAdvancedSearchOptions<T> {
  data: T[];
  searchableFields: string[];
  onSearchChange?: (results: T[]) => void;
  caseSensitive?: boolean;
  fuzzyMatch?: boolean;
}

export function useAdvancedSearch<T extends Record<string, any>>(
  options: UseAdvancedSearchOptions<T>
) {
  const {
    data,
    searchableFields,
    onSearchChange,
    caseSensitive = false,
    fuzzyMatch = true
  } = options;

  const [filter, setFilter] = useState<SearchFilter>({
    query: '',
    fields: searchableFields
  });
  
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load saved searches and history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved).map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt)
      })));
    }

    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  /**
   * Perform the search
   */
  const results = useMemo(() => {
    let filtered = [...data];

    // Text search
    if (filter.query.trim()) {
      const searchResults = performTextSearch(
        filtered,
        filter.query,
        filter.fields || searchableFields,
        { caseSensitive, fuzzyMatch }
      );
      filtered = searchResults.map(r => r.item);
    }

    // ICD-10 code filter
    if (filter.icd10Codes && filter.icd10Codes.length > 0) {
      filtered = filtered.filter(item => {
        const itemCodes = getNestedValue(item, 'icd10Codes') || 
                         getNestedValue(item, 'diagnoses') || 
                         [];
        return filter.icd10Codes!.some(code => 
          itemCodes.some((ic: any) => 
            (typeof ic === 'string' ? ic : ic.code)?.includes(code)
          )
        );
      });
    }

    // Medication filter
    if (filter.medications && filter.medications.length > 0) {
      filtered = filtered.filter(item => {
        const itemMeds = getNestedValue(item, 'medications') || [];
        return filter.medications!.some(med =>
          itemMeds.some((im: any) =>
            (typeof im === 'string' ? im : im.name)
              ?.toLowerCase()
              .includes(med.toLowerCase())
          )
        );
      });
    }

    // Date range filter
    if (filter.dateFrom || filter.dateTo) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(
          getNestedValue(item, 'date') || 
          getNestedValue(item, 'createdAt') ||
          getNestedValue(item, 'timestamp')
        );

        if (isNaN(itemDate.getTime())) return true;

        if (filter.dateFrom) {
          const fromDate = new Date(filter.dateFrom);
          if (itemDate < fromDate) return false;
        }

        if (filter.dateTo) {
          const toDate = new Date(filter.dateTo);
          toDate.setHours(23, 59, 59, 999); // Include entire day
          if (itemDate > toDate) return false;
        }

        return true;
      });
    }

    // Document type filter
    if (filter.documentType) {
      filtered = filtered.filter(item =>
        getNestedValue(item, 'type') === filter.documentType ||
        getNestedValue(item, 'documentType') === filter.documentType
      );
    }

    // Status filter
    if (filter.status) {
      filtered = filtered.filter(item =>
        getNestedValue(item, 'status') === filter.status
      );
    }

    // Author filter
    if (filter.author) {
      filtered = filtered.filter(item => {
        const author = getNestedValue(item, 'author') || 
                      getNestedValue(item, 'createdBy');
        return author?.toLowerCase().includes(filter.author!.toLowerCase());
      });
    }

    // Patient ID filter
    if (filter.patientId) {
      filtered = filtered.filter(item =>
        getNestedValue(item, 'patientId') === filter.patientId
      );
    }

    return filtered;
  }, [data, filter, searchableFields, caseSensitive, fuzzyMatch]);

  // Notify parent of result changes
  useEffect(() => {
    onSearchChange?.(results);
  }, [results, onSearchChange]);

  /**
   * Update filter
   */
  const updateFilter = useCallback((updates: Partial<SearchFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));

    // Add to search history if query changed
    if (updates.query && updates.query.trim()) {
      setSearchHistory(prev => {
        const newHistory = [updates.query!, ...prev.filter(q => q !== updates.query)].slice(0, 20);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, []);

  /**
   * Reset filter
   */
  const resetFilter = useCallback(() => {
    setFilter({
      query: '',
      fields: searchableFields
    });
  }, [searchableFields]);

  /**
   * Save current search
   */
  const saveSearch = useCallback((name: string) => {
    const newSearch: SavedSearch = {
      id: `search_${Date.now()}`,
      name,
      filter: { ...filter },
      createdAt: new Date()
    };

    setSavedSearches(prev => {
      const updated = [...prev, newSearch];
      localStorage.setItem('savedSearches', JSON.stringify(updated));
      return updated;
    });

    return newSearch;
  }, [filter]);

  /**
   * Load saved search
   */
  const loadSearch = useCallback((searchId: string) => {
    const search = savedSearches.find(s => s.id === searchId);
    if (search) {
      setFilter(search.filter);
    }
  }, [savedSearches]);

  /**
   * Delete saved search
   */
  const deleteSavedSearch = useCallback((searchId: string) => {
    setSavedSearches(prev => {
      const updated = prev.filter(s => s.id !== searchId);
      localStorage.setItem('savedSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  /**
   * Clear search history
   */
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  return {
    filter,
    results,
    resultCount: results.length,
    totalCount: data.length,
    updateFilter,
    resetFilter,
    savedSearches,
    saveSearch,
    loadSearch,
    deleteSavedSearch,
    searchHistory,
    clearHistory,
    hasActiveFilters: Object.keys(filter).some(key => {
      const value = filter[key as keyof SearchFilter];
      return value && (Array.isArray(value) ? value.length > 0 : value !== '');
    })
  };
}

/**
 * Perform full-text search
 */
function performTextSearch<T>(
  items: T[],
  query: string,
  fields: string[],
  options: { caseSensitive: boolean; fuzzyMatch: boolean }
): SearchResult<T>[] {
  const results: SearchResult<T>[] = [];
  const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t);

  for (const item of items) {
    let totalScore = 0;
    const matches: SearchResult<T>['matches'] = [];

    for (const field of fields) {
      const value = getNestedValue(item, field);
      if (!value) continue;

      const strValue = String(value);
      const searchValue = options.caseSensitive ? strValue : strValue.toLowerCase();

      let fieldScore = 0;

      for (const term of searchTerms) {
        const searchTerm = options.caseSensitive ? term : term.toLowerCase();

        // Exact match
        if (searchValue.includes(searchTerm)) {
          fieldScore += 1;
          
          // Bonus for exact word match
          const wordBoundary = new RegExp(`\\b${escapeRegex(searchTerm)}\\b`, 'i');
          if (wordBoundary.test(searchValue)) {
            fieldScore += 0.5;
          }

          // Bonus for match at start
          if (searchValue.startsWith(searchTerm)) {
            fieldScore += 0.3;
          }
        }
        // Fuzzy match
        else if (options.fuzzyMatch) {
          const similarity = calculateSimilarity(searchTerm, searchValue);
          if (similarity > 0.7) {
            fieldScore += similarity * 0.5;
          }
        }
      }

      if (fieldScore > 0) {
        totalScore += fieldScore;
        matches.push({
          field,
          value: strValue,
          highlight: highlightMatches(strValue, searchTerms, options.caseSensitive)
        });
      }
    }

    if (totalScore > 0) {
      results.push({
        item,
        score: totalScore,
        matches
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Get nested property value
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Calculate string similarity (Levenshtein-based)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Highlight search matches in text
 */
function highlightMatches(text: string, terms: string[], caseSensitive: boolean): string {
  let highlighted = text;

  for (const term of terms) {
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(`(${escapeRegex(term)})`, flags);
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  }

  return highlighted;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
