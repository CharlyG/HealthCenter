/**
 * Advanced Search Component
 * 
 * Full-text search across clinical documentation with:
 * - ICD-10 code search
 * - Medication search
 * - Keyword search within document content
 * - Date range filters
 * - Document type filters
 * - Saved search filters
 * - Search history
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Save, Clock, FileText, Calendar, Pill, AlertCircle } from 'lucide-react';
import { Button } from '../../design-system/components/Button';

export interface SearchFilters {
  query: string;
  documentTypes: string[];
  dateRange: {
    start: string;
    end: string;
  };
  icd10Codes: string[];
  medications: string[];
  clinicianIds: string[];
  patientIds: string[];
}

export interface SearchResult {
  id: string;
  type: 'visit_note' | 'assessment' | 'care_plan' | 'order' | 'authorization';
  title: string;
  patientName: string;
  patientMRN: string;
  clinicianName: string;
  date: Date;
  snippet: string;
  matchedTerms: string[];
  score: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: Date;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => Promise<SearchResult[]>;
  onSelectResult?: (result: SearchResult) => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onSelectResult
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    documentTypes: [],
    dateRange: { start: '', end: '' },
    icd10Codes: [],
    medications: [],
    clinicianIds: [],
    patientIds: []
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');

  // Load saved searches and history on mount
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

  const handleSearch = async () => {
    if (!filters.query.trim()) return;

    setIsSearching(true);
    try {
      const searchResults = await onSearch(filters);
      setResults(searchResults);

      // Add to search history
      const newHistory = [
        filters.query,
        ...searchHistory.filter(h => h !== filters.query)
      ].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveSearch = () => {
    if (!saveSearchName.trim()) return;

    const newSearch: SavedSearch = {
      id: `search_${Date.now()}`,
      name: saveSearchName,
      filters: { ...filters },
      createdAt: new Date()
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    setShowSaveDialog(false);
    setSaveSearchName('');
  };

  const handleLoadSavedSearch = (search: SavedSearch) => {
    setFilters(search.filters);
    handleSearch();
  };

  const handleDeleteSavedSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <K extends keyof SearchFilters>(
    key: K,
    value: string
  ) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated as SearchFilters[K]);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      documentTypes: [],
      dateRange: { start: '', end: '' },
      icd10Codes: [],
      medications: [],
      clinicianIds: [],
      patientIds: []
    });
    setResults([]);
  };

  const highlightText = (text: string, terms: string[]) => {
    if (terms.length === 0) return text;

    let highlighted = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
    });

    return highlighted;
  };

  const documentTypeOptions = [
    { value: 'visit_note', label: 'Visit Notes' },
    { value: 'assessment', label: 'Assessments' },
    { value: 'care_plan', label: 'Care Plans' },
    { value: 'order', label: 'Orders' },
    { value: 'authorization', label: 'Authorizations' }
  ];

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
        <input
          type="text"
          value={filters.query}
          onChange={(e) => updateFilter('query', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search documents, ICD-10 codes, medications..."
          className="w-full pl-10 pr-24 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${isExpanded ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            aria-label="Advanced filters"
          >
            <Filter className="size-4" />
          </button>
          <Button
            size="sm"
            onClick={handleSearch}
            disabled={isSearching || !filters.query.trim()}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Search History Suggestions */}
      {!isExpanded && filters.query === '' && searchHistory.length > 0 && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="size-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Recent searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 5).map((query, index) => (
              <button
                key={index}
                onClick={() => {
                  updateFilter('query', query);
                  handleSearch();
                }}
                className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
          {/* Document Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Document Types
            </label>
            <div className="flex flex-wrap gap-2">
              {documentTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleArrayFilter('documentTypes', option.value)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    filters.documentTypes.includes(option.value)
                      ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-500 dark:text-blue-200'
                      : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:border-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="size-4 mr-1" />
              Clear filters
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowSaveDialog(true)}>
                <Save className="size-4 mr-1" />
                Save search
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Saved Searches</h4>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <button
                  onClick={() => handleLoadSavedSearch(search)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {search.name}
                </button>
                <button
                  onClick={() => handleDeleteSavedSearch(search.id)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                  aria-label="Delete saved search"
                >
                  <X className="size-3 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Save Search</h3>
            <input
              type="text"
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              placeholder="Enter search name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSearch} disabled={!saveSearchName.trim()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </h3>
          {results.map((result) => (
            <div
              key={result.id}
              onClick={() => onSelectResult?.(result)}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="size-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {result.type.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">{result.title}</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-medium">{result.patientName}</span> ({result.patientMRN})
                    <span className="mx-2">•</span>
                    {result.clinicianName}
                    <span className="mx-2">•</span>
                    {result.date.toLocaleDateString()}
                  </div>
                  <p
                    className="text-sm text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(result.snippet, result.matchedTerms)
                    }}
                  />
                  {result.matchedTerms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.matchedTerms.map((term, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Match score: {Math.round(result.score * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {results.length === 0 && filters.query && !isSearching && (
        <div className="mt-6 text-center py-12">
          <AlertCircle className="size-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No results found for "{filters.query}"</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
};
