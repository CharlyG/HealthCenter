/**
 * Advanced Search Panel Component
 * 
 * Comprehensive search interface with:
 * - Full-text search
 * - Advanced filters
 * - Saved searches
 * - Search history
 */

import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Filter, 
  Save, 
  Clock, 
  Star,
  Calendar,
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SearchFilter, SavedSearch } from '../../hooks/useAdvancedSearch';

interface AdvancedSearchPanelProps {
  filter: SearchFilter;
  onFilterChange: (filter: Partial<SearchFilter>) => void;
  onReset: () => void;
  onSave?: (name: string) => void;
  savedSearches?: SavedSearch[];
  onLoadSaved?: (id: string) => void;
  onDeleteSaved?: (id: string) => void;
  searchHistory?: string[];
  onClearHistory?: () => void;
  resultCount: number;
  totalCount: number;
  documentTypes?: string[];
  statuses?: string[];
}

export function AdvancedSearchPanel({
  filter,
  onFilterChange,
  onReset,
  onSave,
  savedSearches = [],
  onLoadSaved,
  onDeleteSaved,
  searchHistory = [],
  onClearHistory,
  resultCount,
  totalCount,
  documentTypes = ['Visit Note', 'Assessment', 'Progress Note', 'Discharge Summary'],
  statuses = ['Draft', 'Pending Review', 'Approved', 'Signed']
}: AdvancedSearchPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  const handleSave = () => {
    if (saveName.trim() && onSave) {
      onSave(saveName.trim());
      setSaveName('');
      setSaveDialogOpen(false);
    }
  };

  const hasActiveFilters = Object.keys(filter).some(key => {
    const value = filter[key as keyof SearchFilter];
    if (key === 'query' || key === 'fields') return false;
    return value && (Array.isArray(value) ? value.length > 0 : !!value);
  });

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      {/* Main Search Bar */}
      <div className="p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filter.query || ''}
              onChange={(e) => onFilterChange({ query: e.target.value })}
              onFocus={() => setShowHistory(true)}
              placeholder="Search documents, ICD-10 codes, medications..."
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            {filter.query && (
              <button
                onClick={() => onFilterChange({ query: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}

            {/* Search History Dropdown */}
            {showHistory && searchHistory.length > 0 && filter.query === '' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Recent Searches
                  </span>
                  <button
                    onClick={onClearHistory}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Clear
                  </button>
                </div>
                {searchHistory.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onFilterChange({ query });
                      setShowHistory(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {query}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              showAdvanced || hasActiveFilters
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="px-1.5 py-0.5 bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
                {Object.keys(filter).filter(k => {
                  const v = filter[k as keyof SearchFilter];
                  return k !== 'query' && k !== 'fields' && v && (Array.isArray(v) ? v.length > 0 : !!v);
                }).length}
              </span>
            )}
          </button>

          {onSave && (
            <button
              onClick={() => setSaveDialogOpen(true)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              title="Save search"
            >
              <Save className="w-4 h-4" />
            </button>
          )}

          {savedSearches.length > 0 && (
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              title="Saved searches"
            >
              <Star className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Showing <strong>{resultCount.toLocaleString()}</strong> of <strong>{totalCount.toLocaleString()}</strong> results
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Document Type
              </label>
              <select
                value={filter.documentType || ''}
                onChange={(e) => onFilterChange({ documentType: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filter.status || ''}
                onChange={(e) => onFilterChange({ status: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Author
              </label>
              <input
                type="text"
                value={filter.author || ''}
                onChange={(e) => onFilterChange({ author: e.target.value || undefined })}
                placeholder="Clinician name..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Date From
              </label>
              <input
                type="date"
                value={filter.dateFrom || ''}
                onChange={(e) => onFilterChange({ dateFrom: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Date To
              </label>
              <input
                type="date"
                value={filter.dateTo || ''}
                onChange={(e) => onFilterChange({ dateTo: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* ICD-10 Codes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ICD-10 Codes
              </label>
              <input
                type="text"
                value={filter.icd10Codes?.join(', ') || ''}
                onChange={(e) => onFilterChange({ 
                  icd10Codes: e.target.value ? e.target.value.split(',').map(c => c.trim()) : undefined 
                })}
                placeholder="E.g., I50.9, E11.9"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Saved Searches Panel */}
      {showSaved && savedSearches.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Saved Searches
            </h3>
            <button
              onClick={() => setShowSaved(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {savedSearches.map(search => (
              <div
                key={search.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <button
                  onClick={() => onLoadSaved?.(search.id)}
                  className="flex-1 text-left"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">{search.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(search.createdAt).toLocaleDateString()}
                  </div>
                </button>
                <button
                  onClick={() => onDeleteSaved?.(search.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {saveDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Save Search
            </h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Enter search name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSaveDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
