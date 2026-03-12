# UX Patterns Architecture

## Overview

This document describes the architecture of the UX Patterns system and how it integrates with the HIPAA-compliant healthcare platform.

## Design Principles

### 1. **Modularity**
Each pattern is self-contained and can be used independently or combined with others.

```
ux-patterns/
├── error-handling/     # Independent error handling system
├── validation/         # Independent form validation
├── bulk-actions/       # Independent bulk operations
├── loading/            # Independent loading states
├── progressive-disclosure/ # Independent progressive UI
├── search/             # Independent search system
└── keyboard-shortcuts/ # Independent keyboard system
```

### 2. **Composition Over Inheritance**
Patterns are designed to be composed together rather than extending from base classes.

```tsx
// ✅ Good: Composing patterns
const MyComponent = () => {
  const { error, setError } = useErrorHandler();
  const { validateForm } = useFormValidation({ rules });
  const { selectedCount } = useBulkSelection();
  
  return (
    <>
      {error && <ErrorDisplay {...error} />}
      <BulkActionBar selectedCount={selectedCount} />
      {/* Component content */}
    </>
  );
};

// ❌ Bad: Inheritance-based approach
class MyComponent extends BaseComponentWithPatterns { ... }
```

### 3. **Performance First**
All components are optimized for performance:
- Components use `memo()` to prevent unnecessary re-renders
- Event handlers use `useCallback()`
- Expensive computations use `useMemo()`
- Large lists support virtualization

### 4. **Accessibility First**
All patterns follow WCAG 2.1 AA standards:
- Keyboard navigation support
- Screen reader friendly with ARIA labels
- Focus management
- Color contrast compliance

### 5. **Type Safety**
Full TypeScript support with comprehensive type definitions:
```tsx
export interface ErrorDisplayProps {
  title: string;
  description?: string;
  severity?: ErrorSeverity;
  // ... full type definitions
}
```

## Pattern Integration

### Integration with Existing Modules

Each pattern can be integrated into existing platform modules:

#### Patient Chart Module
```tsx
import { ErrorDisplay, useErrorHandler } from '@/components/ux-patterns';

export const PatientChart = () => {
  const { error, setError } = useErrorHandler();
  
  // Use error handling in chart operations
  const handleSave = async () => {
    try {
      await saveChart();
    } catch (err) {
      setError('SAVE_FAILED');
    }
  };
  
  return (
    <>
      {error && <ErrorDisplay {...error} />}
      {/* Chart content */}
    </>
  );
};
```

#### QA Workspace Module
```tsx
import { 
  BulkActionBar, 
  useBulkSelection,
  useKeyboardShortcut 
} from '@/components/ux-patterns';

export const QAWorkspace = () => {
  const { selectedCount, selectedArray } = useBulkSelection();
  
  // Bulk approve documents
  useKeyboardShortcut({
    key: 'a',
    ctrl: true,
    shift: true,
    callback: () => handleBulkApprove(selectedArray)
  });
  
  return (
    <BulkActionBar
      selectedCount={selectedCount}
      actions={[
        { id: 'approve', label: 'Approve', onClick: handleApprove },
        { id: 'return', label: 'Return for Correction', onClick: handleReturn }
      ]}
    />
  );
};
```

#### Clinical Documentation Module
```tsx
import { 
  FormField, 
  useFormValidation,
  validationRules 
} from '@/components/ux-patterns';

export const ClinicalDocumentation = () => {
  const { errors, getFieldProps, validateForm } = useFormValidation({
    rules: {
      bloodPressure: [
        validationRules.required(),
        validationRules.pattern(/^\d{2,3}\/\d{2,3}$/, 'Must be in format: 120/80')
      ],
      heartRate: [
        validationRules.required(),
        validationRules.min(40, 'Heart rate must be at least 40'),
        validationRules.max(200, 'Heart rate must not exceed 200')
      ]
    }
  });
  
  return (
    <FormField label="Blood Pressure" required {...getFieldProps('bloodPressure', data.bloodPressure)}>
      <input {...inputProps} />
    </FormField>
  );
};
```

### Integration with Data Gateway

Patterns integrate seamlessly with the existing `dataGateway.ts` abstraction:

```tsx
// src/app/lib/dataGateway.ts
import { useErrorHandler } from '@/components/ux-patterns';

export const patientGateway = {
  getAll: async () => {
    try {
      // Fetch from Supabase or future .NET API
      return await fetchPatients();
    } catch (error) {
      // Error will be handled by component using useErrorHandler
      throw error;
    }
  }
};

// In component
const MyComponent = () => {
  const { error, handleApiError } = useErrorHandler();
  
  useEffect(() => {
    patientGateway.getAll()
      .catch(handleApiError); // Automatically handles error
  }, []);
};
```

### Integration with Toast System

Patterns integrate with the existing Sonner toast system:

```tsx
import { useErrorHandler } from '@/components/ux-patterns';
import { healthcareToasts } from '@/components/ux-patterns/ToastIntegration';

const MyComponent = () => {
  const { showErrorToast } = useErrorHandler();
  
  const handleSave = async () => {
    try {
      await saveData();
      healthcareToasts.saveSuccess('Patient record');
    } catch (err) {
      showErrorToast('SAVE_FAILED');
    }
  };
};
```

## State Management

### Local State
Patterns use local component state via hooks:
```tsx
const { selectedIds, toggleSelection } = useBulkSelection();
const { error, setError } = useErrorHandler();
```

### Global State
For application-wide patterns (like global search), state can be lifted:
```tsx
// In App.tsx or root layout
const globalSearch = useGlobalSearch({
  onSearch: async (query) => {
    // Search across all modules
    return await searchEverything(query);
  }
});

// Pass to context or props
<SearchContext.Provider value={globalSearch}>
  <App />
</SearchContext.Provider>
```

## Performance Optimization

### Code Splitting
Patterns support lazy loading for better performance:

```tsx
import { lazy, Suspense } from 'react';

const CommandPalette = lazy(() => 
  import('@/components/ux-patterns').then(m => ({ default: m.CommandPalette }))
);

function App() {
  return (
    <Suspense fallback={null}>
      <CommandPalette {...props} />
    </Suspense>
  );
}
```

### Virtualization
Loading patterns support virtualization for large datasets:

```tsx
import { TableSkeleton } from '@/components/ux-patterns';
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualizedTable = ({ data }) => {
  const virtualizer = useVirtualizer({
    count: data.length,
    // ... virtualizer config
  });
  
  if (loading) return <TableSkeleton rows={10} />;
  
  return <VirtualTable virtualizer={virtualizer} />;
};
```

## HIPAA Compliance

### PHI Protection
Patterns are designed to prevent PHI exposure:

```tsx
// ✅ Good: Generic error message
setError('SAVE_FAILED', {
  title: 'Failed to save record',
  description: 'Unable to save at this time',
  errorCode: 'ERR_001' // For support reference
});

// ❌ Bad: Exposing PHI in error
setError('CUSTOM_ERROR', {
  title: 'Failed to save John Doe (MRN: 12345)',
  description: error.message // May contain PHI
});
```

### Audit Logging
Patterns can integrate with audit logging:

```tsx
const { selectedArray } = useBulkSelection();

const handleBulkDelete = async () => {
  // Log bulk action for audit trail
  await auditLog.record({
    action: 'BULK_DELETE',
    entityType: 'PATIENT',
    entityIds: selectedArray,
    userId: currentUser.id,
    timestamp: new Date()
  });
  
  await deletePatients(selectedArray);
};
```

## Testing Strategy

### Unit Tests
Each pattern component is unit testable:

```tsx
import { render, fireEvent } from '@testing-library/react';
import { ErrorDisplay } from '@/components/ux-patterns';

test('displays error message', () => {
  const { getByText } = render(
    <ErrorDisplay title="Test Error" description="Test Description" />
  );
  
  expect(getByText('Test Error')).toBeInTheDocument();
  expect(getByText('Test Description')).toBeInTheDocument();
});
```

### Integration Tests
Patterns work together in integration tests:

```tsx
test('form validation with error display', async () => {
  const { getByLabelText, getByText } = render(<MyForm />);
  
  // Submit invalid form
  fireEvent.click(getByText('Submit'));
  
  // Check validation error appears
  expect(getByText('This field is required')).toBeInTheDocument();
  
  // Fill valid data
  fireEvent.change(getByLabelText('Email'), { target: { value: 'test@test.com' }});
  
  // Error should clear
  await waitFor(() => {
    expect(queryByText('This field is required')).not.toBeInTheDocument();
  });
});
```

## Migration to .NET 8

Patterns are designed for future migration:

### Concept Mapping
React patterns map to .NET concepts:

| React Pattern | .NET Equivalent |
|--------------|-----------------|
| `useErrorHandler` | Exception handling middleware |
| `useFormValidation` | FluentValidation |
| `useBulkSelection` | Batch operation services |
| `GlobalSearch` | ElasticSearch integration |
| `CommandPalette` | Hotkey service |

### Shared Validation Rules
Validation rules can be shared between frontend and backend:

```typescript
// Shared validation schema (can be converted to C# FluentValidation)
export const patientValidation = {
  mrn: [
    required('MRN is required'),
    pattern(/^[A-Z0-9]{6,10}$/i, 'MRN must be 6-10 alphanumeric characters')
  ],
  email: [
    required('Email is required'),
    email('Must be a valid email')
  ]
};
```

## Extending Patterns

### Creating Custom Patterns

New patterns should follow the same architecture:

```tsx
// 1. Create pattern directory
mkdir src/app/components/ux-patterns/my-pattern

// 2. Create main component
// src/app/components/ux-patterns/my-pattern/MyPattern.tsx
export const MyPattern = memo<MyPatternProps>(() => {
  // Pattern implementation
});

// 3. Create hook (if needed)
// src/app/components/ux-patterns/my-pattern/useMyPattern.tsx
export function useMyPattern() {
  // Hook implementation
}

// 4. Export from index
// src/app/components/ux-patterns/my-pattern/index.ts
export { MyPattern } from './MyPattern';
export { useMyPattern } from './useMyPattern';

// 5. Add to main index
// src/app/components/ux-patterns/index.ts
export * from './my-pattern';
```

### Pattern Checklist

When creating new patterns, ensure:

- [ ] Memoized components (`memo()`)
- [ ] Callback stability (`useCallback()`)
- [ ] TypeScript types exported
- [ ] Accessibility support (ARIA, keyboard)
- [ ] Dark mode support
- [ ] Responsive design
- [ ] Documentation in README
- [ ] Example in demo file
- [ ] Unit tests
- [ ] HIPAA compliance review

## Support and Maintenance

### Version History
- v1.0.0 (March 10, 2026) - Initial release with 7 core patterns

### Team Contacts
- UX Lead: [Team member]
- Frontend Lead: [Team member]
- Accessibility Champion: [Team member]

### Contributing
See [README.md](./README.md) for usage guidelines and examples.

---

**Last Updated:** March 10, 2026  
**Maintained by:** Healthcare Platform Team
