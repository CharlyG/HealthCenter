# Gateway Architecture

## Overview

The gateway layer is the **single point of contact** between UI components and external systems (database, vendor APIs). This architecture ensures:

✅ **Decoupled UI** - Components don't know if data comes from Supabase or .NET API  
✅ **Easy migration** - Swap Supabase for .NET 8 API without changing UI code  
✅ **Consistent patterns** - All data access follows the same pattern  
✅ **Audit logging** - All operations are logged automatically  
✅ **Type safety** - Shared TypeScript interfaces across the app  

## Architecture Layers

```
┌─────────────────────────────────────┐
│   UI Components (React)             │
│   - Only call gateway methods       │
│   - Never import Supabase directly  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Gateway Layer (Abstraction)       │
│   - dataGateway (DB operations)     │
│   - integrationGateway (vendors)    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Data Sources                      │
│   - Supabase (now)                  │
│   - .NET 8 API (future)             │
│   - External vendors                │
└─────────────────────────────────────┘
```

## Gateway Files

### `/src/app/lib/dataGateway.ts`
Database operations abstraction.

**Gateways:**
- `patientGateway` - Patient CRUD, search, pagination
- `admissionGateway` - Admission operations
- `visitGateway` - Visit operations
- `configGateway` - Module toggles, feature flags, vendor configs
- `auditGateway` - Audit logging
- `userGateway` - User operations

### `/src/app/lib/integrationGateway.ts`
External vendor integration abstraction.

**Gateways:**
- `evvGateway` - EVV clock in/out, verification
- `smsGateway` - SMS messaging
- `faxGateway` - Fax operations
- `emailGateway` - Email operations
- `medicationGateway` - Medication verification

### `/src/app/lib/index.ts`
Central export - import gateways from here.

## Usage Examples

### Data Gateway Example

```tsx
// ❌ BAD - Don't do this
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(...);
const { data } = await supabase.from('patients').select('*');

// ✅ GOOD - Use gateway
import { patientGateway } from '@/lib';

const result = await patientGateway.search({
  query: 'Johnson',
  pagination: { page: 1, pageSize: 25 },
  sort: { field: 'lastName', direction: 'asc' },
});
```

### Integration Gateway Example

```tsx
// ❌ BAD - Don't do this
const response = await fetch('https://evv-vendor-api.com/clockin', {
  method: 'POST',
  body: JSON.stringify({ ... }),
});

// ✅ GOOD - Use gateway
import { evvGateway } from '@/lib';

const result = await evvGateway.clockIn({
  visitId: '123',
  clinicianId: '456',
  patientId: '789',
  timestamp: new Date().toISOString(),
}, currentUserId);

if (result.success) {
  console.log('Clock in verified:', result.data);
} else {
  console.error('Clock in failed:', result.error);
}
```

## Component Patterns

### Data-Loading Component

```tsx
// DataContainer - Handles data fetching and orchestration
import { patientGateway } from '@/lib';

export function PatientListContainer() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25 });

  useEffect(() => {
    async function loadPatients() {
      setLoading(true);
      const result = await patientGateway.search({
        pagination,
        sort: { field: 'lastName', direction: 'asc' },
      });
      setPatients(result.data);
      setLoading(false);
    }
    loadPatients();
  }, [pagination]);

  return <PatientList patients={patients} loading={loading} />;
}
```

### Presentational Component

```tsx
// Presentational - Only receives props, no data fetching
interface PatientListProps {
  patients: Patient[];
  loading: boolean;
}

export function PatientList({ patients, loading }: PatientListProps) {
  if (loading) return <Spinner />;
  
  return (
    <div>
      {patients.map(patient => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </div>
  );
}
```

## Migration to .NET 8 API

When ready to migrate from Supabase to .NET 8 API:

1. **Update gateway implementations** - Replace Supabase calls with fetch to .NET endpoints
2. **Keep all types unchanged** - Same interfaces
3. **Keep UI components unchanged** - They only call gateway methods
4. **Test gateway methods** - UI will work once gateway works

Example migration for one method:

```tsx
// BEFORE (Supabase)
async getById(id: string): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// AFTER (.NET 8 API)
async getById(id: string): Promise<Patient | null> {
  const response = await fetch(`${API_BASE_URL}/api/patients/${id}`, {
    headers: {
      'Authorization': `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch patient: ${response.statusText}`);
  }
  
  return response.json();
}
```

**UI components don't change at all!**

## Best Practices

✅ **Always use gateways** - Never import Supabase or vendor APIs directly  
✅ **Separate concerns** - Data loading components vs presentational components  
✅ **Server-side operations** - Pagination, filtering, sorting on server  
✅ **Minimal payloads** - List screens fetch list data only  
✅ **Audit everything** - Integration gateway logs all operations  
✅ **Error handling** - Gateways return structured errors  
✅ **Type safety** - Use TypeScript interfaces from gateway  

## TODO: Supabase Implementation

Current gateway methods return mock data. To implement with Supabase:

1. Create database tables matching the types
2. Update gateway methods to use Supabase client
3. Add proper error handling
4. Test all CRUD operations
5. Implement pagination, filtering, sorting

The architecture is ready - just needs Supabase queries!
