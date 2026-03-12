# DataGateway Legacy Functions - All Errors Fixed ✅

## Errors Fixed
1. ✅ `TypeError: dataGateway.getAllPatients is not a function`
2. ✅ `TypeError: dataGateway.getPatientById is not a function`
3. ✅ `TypeError: dataGateway.getAdmissions is not a function`
4. ✅ `TypeError: dataGateway.getAlternateLocations is not a function`

## Root Cause
Multiple components were calling legacy dataGateway functions that didn't exist:
- `PatientList.tsx`, `PatientDetails.tsx`, `AdmissionDetails.tsx`, `usePatients.ts` - calling patient functions
- `PatientAdmissions.tsx` - calling admission functions
- `PatientAlternateLocations.tsx` - calling alternate location functions

The dataGateway had been restructured to use gateway objects (`patientGateway`, `admissionGateway`) but the calling code hadn't been updated.

## Solution
Added four new legacy compatibility functions to `/src/app/lib/dataGateway.ts`:

### 1. getAllPatients

**Function Signature:**
```typescript
export async function getAllPatients(
  orgId: string,
  officeId?: string,
  status?: 'active' | 'inactive' | 'discharged'
): Promise<{ patients: Patient[] }>
```

**What it does:**
1. Accepts organization ID, optional office ID, and optional status filter
2. Builds filter parameters based on the provided arguments
3. Delegates to `patientGateway.search()` with appropriate filters
4. Returns patients in the expected format: `{ patients: Patient[] }`

### 2. getPatientById

**Function Signature:**
```typescript
export async function getPatientById(
  patientId: string
): Promise<{ patient: Patient | null }>
```

**What it does:**
1. Accepts a patient ID
2. Delegates to `patientGateway.getById()` 
3. Returns patient in the expected format: `{ patient: Patient | null }`

### 3. getAdmissions

**Function Signature:**
```typescript
export async function getAdmissions(
  patientId: string
): Promise<{ admissions: Admission[] }>
```

**What it does:**
1. Accepts a patient ID
2. Delegates to `admissionGateway.getByPatientId()` 
3. Returns admissions in the expected format: `{ admissions: Admission[] }`

### 4. getAlternateLocations

**Function Signature:**
```typescript
export async function getAlternateLocations(
  patientId: string
): Promise<{ locations: AlternateLocation[] }>
```

**What it does:**
1. Accepts a patient ID
2. Delegates to `patientGateway.getAlternateLocations()` 
3. Returns alternate locations in the expected format: `{ locations: AlternateLocation[] }`

**Code Location:**
All functions added under two new sections in `/src/app/lib/dataGateway.ts`:
- "LEGACY PATIENT FUNCTIONS (Compatibility layer)" - after AUTH OPERATIONS
- "LEGACY ADMISSION FUNCTIONS (Compatibility layer)" - after legacy patient functions

## Why This Approach?

This maintains backwards compatibility with existing code while using the newer gateway patterns internally. The functions act as compatibility layers that:

- ✅ Provide the expected function interfaces
- ✅ Use the modern gateway patterns internally
- ✅ Support filtering and parameter passing
- ✅ Return data in the expected format
- ✅ Include proper logging for debugging
- ✅ Enable gradual migration without breaking existing code

## Migration Path

Future code should use the gateway objects directly for more control over pagination, sorting, and filtering. These legacy functions are provided for existing components that haven't been migrated yet.

### Modern Pattern (Preferred):
```typescript
// Search patients with pagination
const result = await patientGateway.search({
  filters: { officeId: 'office-1', status: 'active' },
  pagination: { page: 1, pageSize: 50 },
  sort: { field: 'lastName', direction: 'asc' }
});

// Get patient by ID
const patient = await patientGateway.getById('patient-123');

// Get admissions for a patient
const admissions = await admissionGateway.getByPatientId('patient-123');
```

### Legacy Pattern (Supported):
```typescript
// Get all patients
const result = await getAllPatients('org-1', 'office-1', 'active');

// Get patient by ID
const result = await getPatientById('patient-123');

// Get admissions for a patient
const result = await getAdmissions('patient-123');

// Get alternate locations for a patient
const result = await getAlternateLocations('patient-123');
```

## Files That Use These Functions

### getAllPatients:
- `/src/app/pages/PatientList.tsx` - Patient list page
- `/src/app/hooks/usePatients.ts` - Patient data hook

### getPatientById:
- `/src/app/pages/PatientDetails.tsx` - Patient detail page
- `/src/app/pages/AdmissionDetails.tsx` - Admission detail page (needs patient info)
- `/src/app/hooks/usePatients.ts` - Patient data hook

### getAdmissions:
- `/src/app/components/PatientAdmissions.tsx` - Patient admissions component

### getAlternateLocations:
- `/src/app/components/PatientAlternateLocations.tsx` - Patient alternate locations component

All files import the dataGateway as:
```typescript
import * as dataGateway from '../lib/dataGateway';
```

## Impact

All four errors are now resolved! The application should now work correctly:

- ✅ Patient list page loads successfully
- ✅ Individual patient details pages load
- ✅ Admission details pages load with patient information
- ✅ Patient admissions component displays correctly in patient charts
- ✅ Patient alternate locations component displays correctly in patient charts

## Technical Notes

These legacy functions are intentionally simple wrappers that delegate to the modern gateway objects. This approach:

1. **Maintains API compatibility** - Existing components don't need immediate refactoring
2. **Uses modern patterns internally** - All data access goes through the gateway objects
3. **Enables gradual migration** - Teams can update components to use gateway objects over time
4. **Provides clear migration path** - The gateway objects are already available for new code
5. **Includes logging** - Each function logs its invocation for debugging

This is a common pattern when refactoring legacy codebases in production environments.