# Production-Grade Architecture Documentation

## Overview
This document outlines the modular, production-ready architecture implemented for the healthcare operations platform. The architecture is designed for long-term maintainability, .NET 8 API compatibility, and scalable team development.

## Architecture Layers

### 1. Data Access Layer (`/src/app/hooks/`)
**Purpose**: Centralized data fetching with proper loading, error, and auth state management.

**Files**:
- `useAuth.ts` - Authentication state with `isReady` flag
- `usePatients.ts` - Patient CRUD operations
- `useOffices.ts` - Office data operations
- `useFormAutosave.ts` - Autosave functionality
- `useNavigationGuard.ts` - Save-before-navigate protection

**Benefits**:
- Single source of truth for data operations
- Consistent error handling
- Reusable across components
- Easy to migrate to different backend (e.g., .NET 8 API)
- Type-safe interfaces

**Example**:
```typescript
// Instead of duplicate useEffect + fetch code everywhere:
const { patients, loading, error, search } = usePatientList();
```

### 2. Design System (`/src/app/components/design-system/`)
**Purpose**: Reusable, consistent UI components with healthcare-appropriate visual language.

**Components**:
- `StatusBadge` - Standardized status indicators
- `PatientContextHeader` - Sticky patient context with quick actions
- `DataTable` - High-performance table with memoized rows
- `PageLayout` / `PageHeader` / `PageSection` - Consistent page structure
- `FormSection` / `FormFieldGroup` - Standardized form layouts

**Benefits**:
- Consistent UX across the application
- Memoized components prevent unnecessary rerenders
- Professional healthcare visual language
- Easy to update global styling
- Reusable patterns

### 3. Presentation Components (`/src/app/components/patient/`)
**Purpose**: Pure UI components focused on display logic.

**Structure**:
```
/patient
  /list
    PatientListTable.tsx    - Memoized table rows
    PatientListFilters.tsx  - Search and filter controls
  /forms
    PatientDemographicsForm.tsx - Form presentation
```

**Benefits**:
- Separation of concerns (data vs. display)
- Easy to test in isolation
- Reusable across different pages
- React.memo optimization

### 4. Container/Orchestration Layer (`/src/app/pages/`)
**Purpose**: Coordinate data fetching, state management, and component composition.

**Files**:
- `PatientListNew.tsx` - Orchestrates patient list view
- `PatientDetailsNew.tsx` - Orchestrates patient details view

**Benefits**:
- Clean separation of data and presentation
- Easy to understand data flow
- Testable business logic

## Key Patterns

### Data Loading Pattern
```typescript
// Container (Page)
const { patients, loading } = usePatientList();

// Presentation Component
<PatientListTable patients={patients} loading={loading} />
```

### Form Pattern
```typescript
// Container manages state and save logic
const [formData, setFormData] = useState<FormData>(...);
const { isDirty, isSaving, lastSaved, saveNow } = useFormAutosave({
  formData,
  onSave: handleSave,
});

// Presentation component receives props
<DemographicsForm 
  formData={formData}
  onFieldChange={handleFieldChange}
  isDirty={isDirty}
  isSaving={isSaving}
/>
```

### Memoization Pattern
```typescript
// Expensive components use React.memo
export const PatientListTable = React.memo(({ patients, offices }) => {
  // Expensive render logic
});

// Columns defined with useMemo
const columns = useMemo<Column<Patient>[]>(() => [...], [dependencies]);
```

## Performance Optimizations

1. **React.lazy()** - All module pages lazy load
2. **React.memo** - Expensive list/table components memoized
3. **useMemo** - Computed values and column definitions cached
4. **Memoized row rendering** - Table rows only rerender when data changes
5. **Auth readiness checks** - Prevents premature API calls

## Migration Path to .NET 8 API

The data access layer (`usePatients.ts`, etc.) abstracts all API calls. To migrate:

1. Update `dataGateway.ts` to point to .NET endpoints
2. Adjust response mapping if needed
3. No changes required to components

Example:
```typescript
// Before (Supabase)
const res = await dataGateway.getAllPatients(orgId);

// After (.NET 8) - Same interface, different implementation
const res = await fetch('/api/patients', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## File Organization

```
/src/app
  /hooks              # Data access layer
    useAuth.ts
    usePatients.ts
    useOffices.ts
  /lib
    dataGateway.ts    # API client
    /utils
      dateUtils.ts    # Shared utilities
  /components
    /design-system    # Reusable UI components
    /patient          # Patient-specific components
      /list
      /forms
    /ui               # Base UI primitives
  /pages              # Container components
    PatientListNew.tsx
    PatientDetailsNew.tsx
```

## Next Steps for Production

1. **Add Virtualization**: Implement react-window for large patient lists
2. **Add Pagination**: Server-side pagination for 10k+ records
3. **Add Sorting**: Client and server-side sort support
4. **Work Queues**: Priority task lists for daily workflows
5. **Lazy Panels**: Drawer/inspector patterns for secondary data
6. **Priority Loading**: Dashboard widgets load in order of importance
7. **Error Boundaries**: Graceful error handling per module
8. **Audit Trail**: Track all data mutations
9. **Role-Based Views**: Filter navigation and features by role
10. **Performance Monitoring**: Add performance tracking

## Testing Strategy

### Unit Tests
```typescript
// Test data hooks in isolation
test('usePatientList loads patients', async () => {
  const { result } = renderHook(() => usePatientList());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.patients).toHaveLength(3);
});
```

### Component Tests
```typescript
// Test presentation components with mock data
test('PatientListTable renders patients', () => {
  render(<PatientListTable patients={mockPatients} offices={mockOffices} />);
  expect(screen.getByText('Doe, John')).toBeInTheDocument();
});
```

### Integration Tests
```typescript
// Test full page flow
test('PatientListPage loads and displays data', async () => {
  render(<PatientListPage />);
  await waitFor(() => expect(screen.getByText('Doe, John')).toBeInTheDocument());
});
```

## Benefits Summary

✅ **Modular** - Small, focused components
✅ **Testable** - Each layer can be tested independently
✅ **Performant** - Memoization and lazy loading
✅ **Maintainable** - Clear separation of concerns
✅ **Scalable** - Easy to add new modules
✅ **Type-Safe** - TypeScript interfaces throughout
✅ **Migration-Ready** - API layer easily swappable
✅ **Production-Grade** - No demo shortcuts

## Comparison: Old vs New

### Old Approach (PatientList.tsx)
```typescript
// ❌ Mixed concerns - data, presentation, business logic
export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Duplicate auth checks
    if (!authLoading && user && profile?.org_id) {
      loadData();
    }
  }, [authLoading, user, profile]);

  const loadData = async () => {
    // Inline data fetching logic
    const res = await fetch(...);
    setPatients(res.data);
  };

  return (
    <div>
      {/* 300+ lines of mixed logic and JSX */}
    </div>
  );
}
```

### New Approach (PatientListNew.tsx)
```typescript
// ✅ Clean separation - orchestration only
export default function PatientListPage() {
  const { patients, loading } = usePatientList();
  const { offices } = useOffices();

  return (
    <PageLayout>
      <PageHeader title="Patients" />
      <PatientListFilters {...filterProps} />
      <PatientListTable patients={patients} offices={offices} />
    </PageLayout>
  );
}
```

## Routes

**Testing the new architecture**:
- New patient list: `/patient-new`
- New patient details: `/patient-new/:patientId`

**Old routes** (to be deprecated):
- Old patient list: `/patient`
- Old patient details: `/patient/:patientId`
