/**
 * Integration Example
 * 
 * Example showing how to integrate UX patterns into a real healthcare component.
 * This demonstrates best practices for combining multiple patterns.
 * 
 * @module UXPatterns/Examples
 */

import { memo, useState, useCallback } from 'react';
import { Save, Send, Users, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Import patterns
import {
  // Error Handling
  ErrorDisplay,
  useErrorHandler,
  
  // Validation
  FormField,
  useFormValidation,
  validationRules,
  
  // Bulk Actions
  BulkActionBar,
  useBulkSelection,
  SelectAllCheckbox,
  SelectableRow,
  
  // Loading
  TableSkeleton,
  
  // Progressive Disclosure
  CollapsibleSection,
  
  // Keyboard Shortcuts
  useKeyboardShortcut,
  useKeyboardShortcuts
} from './index';

interface Patient {
  id: string;
  name: string;
  mrn: string;
  status: 'active' | 'pending' | 'discharged';
  lastVisit: string;
}

/**
 * PatientManagementExample
 * 
 * Real-world example integrating multiple UX patterns:
 * - Error handling for save failures
 * - Form validation for patient filters
 * - Bulk actions for batch operations
 * - Loading states while fetching data
 * - Progressive disclosure for advanced filters
 * - Keyboard shortcuts for common actions
 */
export const PatientManagementExample = memo(() => {
  // State
  const [patients, setPatients] = useState<Patient[]>([
    { id: '1', name: 'John Doe', mrn: 'MRN001', status: 'active', lastVisit: '2026-03-08' },
    { id: '2', name: 'Jane Smith', mrn: 'MRN002', status: 'pending', lastVisit: '2026-03-09' },
    { id: '3', name: 'Bob Johnson', mrn: 'MRN003', status: 'active', lastVisit: '2026-03-10' }
  ]);
  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState({ search: '', status: '' });

  // Pattern 1: Error Handling
  const { error, setError, clearError, showErrorToast } = useErrorHandler();

  // Pattern 2: Form Validation
  const { errors, getFieldProps, validateForm } = useFormValidation({
    rules: {
      search: [validationRules.minLength(3, 'Search must be at least 3 characters')],
      status: []
    },
    validateOnBlur: true
  });

  // Pattern 3: Bulk Selection
  const {
    selectedCount,
    selectedArray,
    isSelected,
    toggleSelection,
    deselectAll,
    toggleSelectAll,
    isAllSelected,
    isIndeterminate
  } = useBulkSelection();

  // Pattern 4: Keyboard Shortcuts
  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      callback: () => handleSaveFilters(),
      description: 'Save current filters'
    },
    {
      key: 'a',
      ctrl: true,
      shift: true,
      callback: () => toggleSelectAll(patients.map(p => p.id)),
      description: 'Select all patients'
    },
    {
      key: 'Escape',
      callback: () => {
        deselectAll();
        clearError();
      },
      description: 'Clear selection and errors',
      preventDefault: false
    }
  ]);

  // Simulated API calls
  const handleSaveFilters = useCallback(async () => {
    const isValid = validateForm(filterData);
    if (!isValid) {
      showErrorToast('VALIDATION_ERROR');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Filters saved successfully');
    } catch (err) {
      setError('SAVE_FAILED');
    }
  }, [filterData, validateForm, showErrorToast, setError]);

  const handleBulkApprove = useCallback(async () => {
    if (selectedCount === 0) return;

    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`${selectedCount} patients approved`);
      deselectAll();
    } catch (err) {
      setError('SAVE_FAILED', {
        title: 'Bulk approval failed',
        description: `Failed to approve ${selectedCount} patients.`
      });
    } finally {
      setLoading(false);
    }
  }, [selectedCount, deselectAll, setError]);

  const handleBulkExport = useCallback(async () => {
    if (selectedCount === 0) return;

    try {
      setLoading(true);
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Exported ${selectedCount} patient records`);
    } catch (err) {
      showErrorToast('SAVE_FAILED', {
        title: 'Export failed',
        description: 'Unable to export patient records.'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedCount, showErrorToast]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedCount === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedCount} patients?`)) {
      return;
    }

    try {
      setLoading(true);
      // Simulate delete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove selected patients
      setPatients(prev => prev.filter(p => !selectedArray.includes(p.id)));
      deselectAll();
      
      toast.success(`${selectedCount} patients deleted`);
    } catch (err) {
      setError('SAVE_FAILED', {
        title: 'Delete failed',
        description: `Failed to delete ${selectedCount} patients.`
      });
    } finally {
      setLoading(false);
    }
  }, [selectedCount, selectedArray, deselectAll, setError]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Patient Management
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Example integrating error handling, validation, bulk actions, loading states, and shortcuts
        </p>
      </div>

      {/* Pattern 1: Error Display */}
      {error && (
        <ErrorDisplay
          title={error.title}
          description={error.description}
          suggestion={error.suggestion}
          errorCode={error.errorCode}
          severity="error"
          onDismiss={clearError}
          actions={[
            { label: 'Retry', onClick: handleSaveFilters, variant: 'primary' },
            { label: 'Dismiss', onClick: clearError }
          ]}
        />
      )}

      {/* Pattern 5: Progressive Disclosure - Filters */}
      <CollapsibleSection
        title="Search and Filters"
        variant="bordered"
        defaultExpanded={true}
      >
        <div className="space-y-4">
          {/* Pattern 2: Form Validation */}
          <FormField
            label="Search Patients"
            helperText="Search by name or MRN (minimum 3 characters)"
            {...getFieldProps('search', filterData.search)}
          >
            <input
              type="text"
              value={filterData.search}
              onChange={(e) => setFilterData({ ...filterData, search: e.target.value })}
              onBlur={getFieldProps('search', filterData.search).onBlur}
              placeholder="Enter name or MRN..."
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900"
            />
          </FormField>

          <FormField
            label="Status Filter"
            {...getFieldProps('status', filterData.status)}
          >
            <select
              value={filterData.status}
              onChange={(e) => setFilterData({ ...filterData, status: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="discharged">Discharged</option>
            </select>
          </FormField>

          <div className="flex gap-2">
            <button
              onClick={handleSaveFilters}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Filters (Ctrl+S)
            </button>
          </div>
        </div>
      </CollapsibleSection>

      {/* Pattern 3: Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedCount}
        totalCount={patients.length}
        onClearSelection={deselectAll}
        actions={[
          {
            id: 'approve',
            label: 'Approve',
            icon: <Send className="w-4 h-4" />,
            onClick: handleBulkApprove,
            variant: 'primary',
            disabled: loading
          },
          {
            id: 'export',
            label: 'Export',
            icon: <Download className="w-4 h-4" />,
            onClick: handleBulkExport,
            disabled: loading
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: handleBulkDelete,
            variant: 'danger',
            disabled: loading
          }
        ]}
      />

      {/* Pattern 4: Loading State with Table Skeleton */}
      {loading ? (
        <TableSkeleton rows={5} columns={5} showHeader />
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="w-12 px-4 py-3">
                  <SelectAllCheckbox
                    checked={isAllSelected(patients.map(p => p.id))}
                    indeterminate={isIndeterminate(patients.map(p => p.id))}
                    onChange={(checked) => {
                      if (checked) {
                        toggleSelectAll(patients.map(p => p.id));
                      } else {
                        deselectAll();
                      }
                    }}
                    label="Select all patients"
                  />
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium">MRN</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Last Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {patients.map((patient) => (
                <SelectableRow
                  key={patient.id}
                  id={patient.id}
                  selected={isSelected(patient.id)}
                  onSelectionChange={(id) => toggleSelection(id)}
                >
                  <td className="px-4 py-3">{patient.name}</td>
                  <td className="px-4 py-3 font-mono text-sm">{patient.mrn}</td>
                  <td className="px-4 py-3">
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${patient.status === 'active' ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300' : ''}
                      ${patient.status === 'pending' ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300' : ''}
                      ${patient.status === 'discharged' ? 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300' : ''}
                    `}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{patient.lastVisit}</td>
                </SelectableRow>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Keyboard Shortcuts Reference */}
      <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          Keyboard Shortcuts
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <div>Ctrl+S - Save filters</div>
          <div>Ctrl+Shift+A - Select all</div>
          <div>Esc - Clear selection/errors</div>
        </div>
      </div>
    </div>
  );
});

PatientManagementExample.displayName = 'PatientManagementExample';
