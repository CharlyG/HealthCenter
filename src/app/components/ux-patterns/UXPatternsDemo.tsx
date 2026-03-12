/**
 * UXPatternsDemo Component
 * 
 * Demonstration of all UX patterns for the healthcare platform.
 * This component serves as both documentation and testing ground.
 * 
 * @module UXPatterns
 */

import { memo, useState } from 'react';
import { Save, FileText, Users, Trash2, Download, Send, Check } from 'lucide-react';

// Error Handling
import {
  ErrorDisplay,
  InlineError,
  useErrorHandler
} from './error-handling';

// Validation
import {
  FormField,
  useFormValidation,
  validationRules
} from './validation';

// Bulk Actions
import {
  BulkActionBar,
  useBulkSelection,
  SelectAllCheckbox,
  SelectableRow
} from './bulk-actions';

// Loading States
import {
  SkeletonLoader,
  TableSkeleton,
  CardSkeleton,
  FormSkeleton,
  LoadingSpinner
} from './loading';

// Progressive Disclosure
import {
  CollapsibleSection,
  ExpandableFieldset
} from './progressive-disclosure';

// Global Search
import {
  GlobalSearch,
  useGlobalSearch
} from './search';

// Keyboard Shortcuts
import {
  KeyboardShortcut,
  useKeyboardShortcut,
  CommandPalette
} from './keyboard-shortcuts';

/**
 * UXPatternsDemo - Interactive demonstration of all patterns
 */
export const UXPatternsDemo = memo(() => {
  const [activePattern, setActivePattern] = useState<string>('error-handling');
  const [showLoading, setShowLoading] = useState(false);

  // Error Handling Demo
  const { error, setError, showErrorToast, clearError } = useErrorHandler();

  // Validation Demo
  const [formData, setFormData] = useState({ email: '', age: '' });
  const { errors, getFieldProps, validateForm } = useFormValidation({
    rules: {
      email: [validationRules.required(), validationRules.email()],
      age: [validationRules.required(), validationRules.min(18, 'Must be at least 18 years old')]
    }
  });

  // Bulk Actions Demo
  const mockData = [
    { id: '1', name: 'John Doe', mrn: 'MRN001' },
    { id: '2', name: 'Jane Smith', mrn: 'MRN002' },
    { id: '3', name: 'Bob Johnson', mrn: 'MRN003' }
  ];
  const {
    selectedIds,
    selectedCount,
    isSelected,
    toggleSelection,
    deselectAll,
    toggleSelectAll,
    isAllSelected,
    isIndeterminate
  } = useBulkSelection();

  // Global Search Demo
  const globalSearch = useGlobalSearch({
    onSearch: async (query) => {
      // Mock search
      return [
        {
          id: '1',
          type: 'patient',
          title: 'John Doe',
          subtitle: 'Active patient',
          metadata: 'MRN: MRN001',
          onClick: () => console.log('Navigate to patient')
        }
      ];
    }
  });

  // Command Palette Demo
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const commandActions = [
    {
      id: 'save',
      label: 'Save Document',
      icon: <Save className="w-5 h-5" />,
      category: 'Document',
      shortcut: ['Ctrl', 'S'],
      onExecute: () => console.log('Save')
    },
    {
      id: 'search',
      label: 'Search Patients',
      icon: <Users className="w-5 h-5" />,
      category: 'Navigation',
      shortcut: ['Ctrl', 'K'],
      onExecute: () => globalSearch.open()
    }
  ];

  // Keyboard Shortcuts
  useKeyboardShortcut({
    key: 's',
    ctrl: true,
    callback: () => showErrorToast('SAVE_FAILED')
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          UX Patterns Library
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Comprehensive patterns for HIPAA-compliant healthcare platform
        </p>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 p-4 space-y-1">
          {[
            { id: 'error-handling', label: 'Error Handling' },
            { id: 'validation', label: 'Inline Validation' },
            { id: 'bulk-actions', label: 'Bulk Actions' },
            { id: 'loading', label: 'Loading States' },
            { id: 'progressive-disclosure', label: 'Progressive Disclosure' },
            { id: 'search', label: 'Global Search' },
            { id: 'shortcuts', label: 'Keyboard Shortcuts' }
          ].map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => setActivePattern(pattern.id)}
              className={`
                w-full text-left px-3 py-2 rounded-md text-sm font-medium
                transition-colors
                ${activePattern === pattern.id
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }
              `}
            >
              {pattern.label}
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Error Handling Pattern */}
          {activePattern === 'error-handling' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Error Handling Pattern</h2>
              
              <div className="space-y-4">
                <ErrorDisplay
                  title="Failed to save changes"
                  description="Your changes could not be saved at this time."
                  suggestion="Please check your connection and try again."
                  severity="error"
                  errorCode="ERR_SAVE_001"
                  actions={[
                    { label: 'Retry', onClick: () => console.log('Retry'), variant: 'primary' },
                    { label: 'Cancel', onClick: () => console.log('Cancel') }
                  ]}
                />

                <ErrorDisplay
                  title="Document pending review"
                  description="This document requires QA review before it can be submitted."
                  suggestion="Submit the document for review to proceed."
                  severity="warning"
                />

                <InlineError message="This field is required" />

                <div className="flex gap-2">
                  <button
                    onClick={() => setError('SAVE_FAILED')}
                    className="px-4 py-2 bg-danger-600 text-white rounded-md hover:bg-danger-700"
                  >
                    Show Error
                  </button>
                  <button
                    onClick={() => showErrorToast('NETWORK_ERROR')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Show Toast
                  </button>
                  {error && (
                    <button
                      onClick={clearError}
                      className="px-4 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700"
                    >
                      Clear Error
                    </button>
                  )}
                </div>

                {error && (
                  <ErrorDisplay
                    title={error.title}
                    description={error.description}
                    suggestion={error.suggestion}
                    errorCode={error.errorCode}
                  />
                )}
              </div>
            </div>
          )}

          {/* Validation Pattern */}
          {activePattern === 'validation' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Inline Validation Pattern</h2>
              
              <form className="max-w-md space-y-4 bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <FormField
                  label="Email Address"
                  required
                  {...getFieldProps('email', formData.email)}
                >
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onBlur={getFieldProps('email', formData.email).onBlur}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900"
                  />
                </FormField>

                <FormField
                  label="Age"
                  required
                  helperText="Must be at least 18 years old"
                  {...getFieldProps('age', formData.age)}
                >
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    onBlur={getFieldProps('age', formData.age).onBlur}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900"
                  />
                </FormField>

                <button
                  type="button"
                  onClick={() => {
                    const isValid = validateForm(formData);
                    if (isValid) {
                      showErrorToast('SAVE_FAILED', { title: 'Form submitted!' });
                    }
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Submit
                </button>
              </form>
            </div>
          )}

          {/* Bulk Actions Pattern */}
          {activePattern === 'bulk-actions' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Bulk Actions Pattern</h2>
              
              <BulkActionBar
                selectedCount={selectedCount}
                totalCount={mockData.length}
                onClearSelection={deselectAll}
                actions={[
                  {
                    id: 'approve',
                    label: 'Approve',
                    icon: <Check className="w-4 h-4" />,
                    onClick: () => console.log('Approve', selectedIds),
                    variant: 'primary'
                  },
                  {
                    id: 'export',
                    label: 'Export',
                    icon: <Download className="w-4 h-4" />,
                    onClick: () => console.log('Export', selectedIds)
                  },
                  {
                    id: 'delete',
                    label: 'Delete',
                    icon: <Trash2 className="w-4 h-4" />,
                    onClick: () => console.log('Delete', selectedIds),
                    variant: 'danger'
                  }
                ]}
              />

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <SelectAllCheckbox
                          checked={isAllSelected(mockData.map(d => d.id))}
                          indeterminate={isIndeterminate(mockData.map(d => d.id))}
                          onChange={(checked) => {
                            if (checked) {
                              toggleSelectAll(mockData.map(d => d.id));
                            } else {
                              deselectAll();
                            }
                          }}
                        />
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">MRN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.map((item) => (
                      <SelectableRow
                        key={item.id}
                        id={item.id}
                        selected={isSelected(item.id)}
                        onSelectionChange={(id, selected) => toggleSelection(id)}
                      >
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3 font-mono text-sm">{item.mrn}</td>
                      </SelectableRow>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Loading States Pattern */}
          {activePattern === 'loading' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Loading States Pattern</h2>
              
              <div>
                <h3 className="font-medium mb-2">Skeleton Variants</h3>
                <div className="space-y-2 bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <SkeletonLoader variant="title" />
                  <SkeletonLoader variant="text" />
                  <SkeletonLoader variant="text" width="80%" />
                  <SkeletonLoader variant="button" width={120} />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Table Skeleton</h3>
                <TableSkeleton rows={3} columns={4} />
              </div>

              <div>
                <h3 className="font-medium mb-2">Card Skeleton</h3>
                <CardSkeleton showAvatar lines={3} showActions />
              </div>

              <div>
                <h3 className="font-medium mb-2">Form Skeleton</h3>
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <FormSkeleton fields={3} />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Loading Spinner</h3>
                <LoadingSpinner message="Loading data..." centered />
              </div>
            </div>
          )}

          {/* Progressive Disclosure Pattern */}
          {activePattern === 'progressive-disclosure' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Progressive Disclosure Pattern</h2>
              
              <CollapsibleSection
                title="Advanced Clinical Options"
                badge="3"
                description="Additional clinical documentation fields"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Field 1</label>
                    <input type="text" className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Field 2</label>
                    <input type="text" className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900" />
                  </div>
                </div>
              </CollapsibleSection>

              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <ExpandableFieldset
                  basicFields={
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Basic Field 1</label>
                        <input type="text" className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Basic Field 2</label>
                        <input type="text" className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900" />
                      </div>
                    </div>
                  }
                  advancedFields={
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Advanced Field 1</label>
                        <input type="text" className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Advanced Field 2</label>
                        <input type="text" className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900" />
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          )}

          {/* Global Search Pattern */}
          {activePattern === 'search' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Global Search Pattern</h2>
              
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Press <KeyboardShortcut keys={['Ctrl', 'K']} size="sm" /> to open global search
                </p>
                <button
                  onClick={globalSearch.open}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Open Search
                </button>
              </div>

              <GlobalSearch
                open={globalSearch.isOpen}
                onClose={globalSearch.close}
                onSearch={globalSearch.search}
              />
            </div>
          )}

          {/* Keyboard Shortcuts Pattern */}
          {activePattern === 'shortcuts' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Keyboard Shortcuts Pattern</h2>
              
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 space-y-4">
                <h3 className="font-medium">Available Shortcuts</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Open search</span>
                    <KeyboardShortcut keys={['Ctrl', 'K']} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Save document</span>
                    <KeyboardShortcut keys={['Ctrl', 'S']} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Submit document</span>
                    <KeyboardShortcut keys={['Ctrl', 'Enter']} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Close dialog</span>
                    <KeyboardShortcut keys={['Esc']} />
                  </div>
                </div>

                <button
                  onClick={() => setShowCommandPalette(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Open Command Palette
                </button>
              </div>

              <CommandPalette
                open={showCommandPalette}
                onClose={() => setShowCommandPalette(false)}
                actions={commandActions}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
});

UXPatternsDemo.displayName = 'UXPatternsDemo';
