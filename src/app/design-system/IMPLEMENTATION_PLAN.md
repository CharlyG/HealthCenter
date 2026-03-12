# Design System Implementation Plan

**Status**: Action Plan  
**Timeline**: 4-6 weeks  
**Goal**: Reach 90% compliance with design system rules

---

## Week 1: Critical Components (Priority: CRITICAL)

### ✅ Task 1.1: Create StatusBadge Component - COMPLETED

**File**: `/src/app/components/design-system/StatusBadge.tsx`

**Status**: ✅ REFACTORED - Now uses semantic tokens instead of hardcoded colors

```tsx
import { status } from '@/design-system/semantic/tokens';

type Status = 
  | 'active' | 'inactive' | 'pending'
  | 'in-progress' | 'completed' | 'cancelled'
  | 'approved' | 'rejected' | 'draft';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status: statusValue, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  const statusConfig = {
    'active': {
      bg: status.success.bg,
      text: status.success.text,
      border: status.success.border
    },
    'inactive': {
      bg: status.neutral.bg,
      text: status.neutral.text,
      border: status.neutral.border
    },
    'pending': {
      bg: status.warning.bg,
      text: status.warning.text,
      border: status.warning.border
    },
    'in-progress': {
      bg: status.info.bg,
      text: status.info.text,
      border: status.info.border
    },
    'completed': {
      bg: status.success.bg,
      text: status.success.text,
      border: status.success.border
    },
    'cancelled': {
      bg: status.neutral.bg,
      text: status.neutral.text,
      border: status.neutral.border
    },
    'approved': {
      bg: status.success.bg,
      text: status.success.text,
      border: status.success.border
    },
    'rejected': {
      bg: status.danger.bg,
      text: status.danger.text,
      border: status.danger.border
    },
    'draft': {
      bg: status.neutral.bg,
      text: status.neutral.text,
      border: status.neutral.border
    }
  };
  
  const config = statusConfig[statusValue];
  
  return (
    <span
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '0.375rem',
        fontWeight: 500
      }}
      className={sizeClasses[size]}
    >
      {statusValue.charAt(0).toUpperCase() + statusValue.slice(1).replace('-', ' ')}
    </span>
  );
}
```

**Usage**:
```tsx
// Before
<Badge className={getStatusColor(patient.status)}>
  {patient.status}
</Badge>

// After
<StatusBadge status={patient.status} />
```

### ✅ Task 1.2: Create PriorityIndicator Component - COMPLETED

**File**: `/src/app/components/design-system/PriorityIndicator.tsx`

**Status**: ✅ CREATED - New component with dot and badge variants

```tsx
import { status } from '@/design-system/semantic/tokens';

type Priority = 'critical' | 'high' | 'medium' | 'low';

interface PriorityIndicatorProps {
  priority: Priority;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityIndicator({ 
  priority, 
  showLabel = false,
  size = 'md' 
}: PriorityIndicatorProps) {
  const config = {
    critical: {
      color: status.danger.text,
      label: 'Critical'
    },
    high: {
      color: status.warning.text,
      label: 'High'
    },
    medium: {
      color: status.info.text,
      label: 'Medium'
    },
    low: {
      color: status.neutral.text,
      label: 'Low'
    }
  };
  
  const sizeMap = {
    sm: 6,
    md: 8,
    lg: 10
  };
  
  const dotSize = sizeMap[size];
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div
        style={{
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: '50%',
          backgroundColor: config[priority].color
        }}
      />
      {showLabel && (
        <span style={{ fontSize: '0.875rem', color: config[priority].color }}>
          {config[priority].label}
        </span>
      )}
    </div>
  );
}
```

### ✅ Task 1.3: Implement Pagination in Data Gateway - COMPLETED

**File**: `/src/app/lib/dataGateway.ts`

**Status**: ✅ ADDED - New functions:
- `getPatientsPaginated()` - Server-side pagination with filters
- `getPatientsSummary()` - Summary data for lists
- `PatientSummary` interface - Minimal data type

**Added Lines**: 2854-2956

```tsx
// Add pagination types
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PatientSummary {
  id: string;
  name: string;
  mrn: string;
  status: string;
  lastVisit?: string;
}

// Add paginated endpoint
export async function getPatientsPaginated(
  orgId: string,
  params: PaginationParams & {
    search?: string;
    officeId?: string;
    status?: string;
  }
): Promise<PaginatedResponse<PatientSummary>> {
  const { page, pageSize, search, officeId, status } = params;
  
  return apiRequest('/patients/paginated', {
    method: 'GET',
    body: {
      orgId,
      page,
      pageSize,
      search,
      officeId,
      status
    }
  });
}

// Add summary endpoint
export async function getPatientsSummary(
  orgId: string,
  params: PaginationParams & {
    search?: string;
    officeId?: string;
    status?: string;
  }
): Promise<PaginatedResponse<PatientSummary>> {
  const { page, pageSize, search, officeId, status } = params;
  
  return apiRequest('/patients/summary', {
    method: 'GET',
    body: {
      orgId,
      page,
      pageSize,
      search,
      officeId,
      status
    }
  });
}
```

---

## Week 2: Refactor Existing Pages

### Task 2.1: Refactor PatientList.tsx

**Before**: `/src/app/pages/PatientList.tsx` (Custom layout)

**After**: Using `ListPageShell`

```tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import * as dataGateway from '../lib/dataGateway';
import { Button } from '../components/ui/button';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import ListPageShell from '../components/shells/ListPageShell';
import { StatusBadge } from '../components/common/StatusBadge';
import { textColor, space, typography } from '../design-system/semantic/tokens';

export default function PatientList() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Data state
  const [data, setData] = useState<dataGateway.PaginatedResponse<dataGateway.PatientSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load paginated data
  const loadData = useCallback(async () => {
    if (!profile?.org_id) return;
    
    try {
      setLoading(true);
      const result = await dataGateway.getPatientsPaginated(profile.org_id, {
        page,
        pageSize,
        search: searchQuery || undefined,
        officeId: selectedOffice !== 'all' ? selectedOffice : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined
      });
      
      setData(result);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [profile?.org_id, page, pageSize, searchQuery, selectedOffice, selectedStatus]);
  
  // Load on mount and when filters change
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Active filters count
  const activeFiltersCount = 
    (selectedOffice !== 'all' ? 1 : 0) +
    (selectedStatus !== 'all' ? 1 : 0);
  
  return (
    <ListPageShell
      title="Patients"
      subtitle="Manage patient records and admissions"
      primaryAction={{
        label: 'New Patient',
        icon: <Plus className="w-4 h-4 mr-2" />,
        onClick: () => navigate('/patient/new')
      }}
      searchPlaceholder="Search by name, MRN..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      filterPanel={
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: space.md }}>
          <div>
            <label style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
              Office
            </label>
            <Select value={selectedOffice} onValueChange={setSelectedOffice}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Offices</SelectItem>
                {/* Office options */}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
              Status
            </label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      }
      activeFiltersCount={activeFiltersCount}
      onRefresh={loadData}
      loading={loading}
      totalCount={data?.total}
    >
      {/* Patient Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: space.md, textAlign: 'left', fontSize: typography.helper.size, fontWeight: typography.h3.weight, color: textColor.secondary }}>
                Patient
              </th>
              <th style={{ padding: space.md, textAlign: 'left', fontSize: typography.helper.size, fontWeight: typography.h3.weight, color: textColor.secondary }}>
                MRN
              </th>
              <th style={{ padding: space.md, textAlign: 'left', fontSize: typography.helper.size, fontWeight: typography.h3.weight, color: textColor.secondary }}>
                Status
              </th>
              <th style={{ padding: space.md, textAlign: 'left', fontSize: typography.helper.size, fontWeight: typography.h3.weight, color: textColor.secondary }}>
                Last Visit
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((patient) => (
              <tr
                key={patient.id}
                onClick={() => navigate(`/patients/${patient.id}`)}
                style={{ cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <td style={{ padding: space.md }}>
                  <div style={{ fontSize: typography.body.size, fontWeight: 500, color: textColor.primary }}>
                    {patient.name}
                  </div>
                </td>
                <td style={{ padding: space.md, fontSize: typography.body.size, color: textColor.secondary }}>
                  {patient.mrn}
                </td>
                <td style={{ padding: space.md }}>
                  <StatusBadge status={patient.status} />
                </td>
                <td style={{ padding: space.md, fontSize: typography.body.size, color: textColor.secondary }}>
                  {patient.lastVisit || 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        {data && (
          <div style={{ 
            padding: space.md, 
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, data.total)} of {data.total}
            </div>
            
            <div style={{ display: 'flex', gap: space.sm }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(data.totalPages)}
                disabled={page === data.totalPages}
              >
                Last
              </Button>
            </div>
            
            <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
              Page {page} of {data.totalPages}
            </div>
          </div>
        )}
      </div>
    </ListPageShell>
  );
}
```

**Improvements**:
1. ✅ Uses `ListPageShell`
2. ✅ Server-side pagination
3. ✅ Loads summary data only
4. ✅ Uses semantic tokens
5. ✅ Uses `StatusBadge` component
6. ✅ Proper filter implementation

---

## Week 3: Healthcare Components

### Task 3.1: PatientContextHeader

**File**: `/src/app/components/healthcare/PatientContextHeader.tsx`

```tsx
import { textColor, space, typography, borderColor, surface } from '@/design-system/semantic/tokens';
import { AlertCircle, Pill, FileText } from 'lucide-react';
import { Button } from '../ui/button';

interface Patient {
  id: string;
  name: string;
  mrn: string;
  dob: string;
  age: number;
  primaryDiagnosis?: string;
  allergies?: string[];
  activeMedications?: number;
}

interface PatientContextHeaderProps {
  patient: Patient;
  compact?: boolean;
  showActions?: boolean;
}

export function PatientContextHeader({ 
  patient, 
  compact = false,
  showActions = true 
}: PatientContextHeaderProps) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div style={{
      backgroundColor: surface.elevated,
      borderBottom: `1px solid ${borderColor.default}`,
      padding: compact ? space.md : space.lg
    }}>
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Patient info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: space.lg }}>
          <div>
            <h2 style={{ 
              fontSize: typography.h2.size, 
              fontWeight: typography.h2.weight,
              color: textColor.primary,
              marginBottom: space.xs
            }}>
              {patient.name}
            </h2>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: space.md,
              fontSize: typography.helper.size,
              color: textColor.secondary
            }}>
              <span>MRN: {patient.mrn}</span>
              <span>•</span>
              <span>DOB: {formatDate(patient.dob)}</span>
              <span>•</span>
              <span>Age: {patient.age}</span>
            </div>
          </div>
          
          {/* Critical alerts */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: space.sm,
              padding: `${space.sm} ${space.md}`,
              backgroundColor: status.danger.bg,
              color: status.danger.text,
              borderRadius: '0.375rem',
              fontSize: typography.helper.size,
              fontWeight: 600
            }}>
              <AlertCircle size={16} />
              ALLERGIES
            </div>
          )}
        </div>
        
        {/* Actions */}
        {showActions && (
          <div style={{ display: 'flex', gap: space.sm }}>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Chart
            </Button>
            <Button variant="outline" size="sm">
              Schedule Visit
            </Button>
          </div>
        )}
      </div>
      
      {/* Expandable details */}
      {!compact && (
        <div style={{ marginTop: space.md }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              fontSize: typography.helper.size,
              color: textColor.link,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0
            }}
          >
            {expanded ? 'Hide' : 'Show'} Details
          </button>
          
          {expanded && (
            <div style={{
              marginTop: space.md,
              padding: space.md,
              backgroundColor: surface.subtle,
              borderRadius: '0.375rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: space.md
            }}>
              {/* Allergies */}
              <div>
                <div style={{ 
                  fontSize: typography.helper.size, 
                  fontWeight: 600,
                  color: textColor.secondary,
                  marginBottom: space.xs
                }}>
                  Allergies
                </div>
                {patient.allergies && patient.allergies.length > 0 ? (
                  <ul style={{ fontSize: typography.body.size, color: textColor.primary }}>
                    {patient.allergies.map((allergy, i) => (
                      <li key={i}>{allergy}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: typography.body.size, color: textColor.muted }}>
                    None documented
                  </div>
                )}
              </div>
              
              {/* Medications */}
              <div>
                <div style={{ 
                  fontSize: typography.helper.size, 
                  fontWeight: 600,
                  color: textColor.secondary,
                  marginBottom: space.xs
                }}>
                  Active Medications
                </div>
                <div style={{ 
                  fontSize: typography.body.size, 
                  color: textColor.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: space.sm
                }}>
                  <Pill size={16} />
                  {patient.activeMedications || 0} medications
                </div>
              </div>
              
              {/* Diagnosis */}
              <div>
                <div style={{ 
                  fontSize: typography.helper.size, 
                  fontWeight: 600,
                  color: textColor.secondary,
                  marginBottom: space.xs
                }}>
                  Primary Diagnosis
                </div>
                <div style={{ fontSize: typography.body.size, color: textColor.primary }}>
                  {patient.primaryDiagnosis || 'Not documented'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}
```

### Task 3.2: Create Remaining Healthcare Components

**Priority Order**:
1. ✅ `PatientContextHeader` (done above)
2. `AdmissionContextBar`
3. `StatusBadge` (done in Week 1)
4. `AuthorizationTracker`
5. `FrequencyTracker`
6. `MedicationSummaryCard`
7. `ClinicalAlertCard`
8. `DocumentationProgressCard`
9. `SignatureStatusCard`
10. `QAQueueItem`

*[Templates for remaining components available in HEALTHCARE_COMPONENTS.md]*

---

## Week 4: Server-Side Implementation

### Task 4.1: Backend Pagination Endpoint

**File**: `/supabase/functions/server/index.tsx`

```typescript
// Add paginated patients endpoint
app.get('/make-server-845bc545/patients/paginated', async (c) => {
  try {
    const userToken = c.req.header('X-User-Token');
    if (!userToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { orgId, page, pageSize, search, officeId, status } = c.req.query();
    
    const pageNum = parseInt(page || '1');
    const pageSizeNum = parseInt(pageSize || '25');
    const offset = (pageNum - 1) * pageSizeNum;
    
    // Build query
    let query = supabase
      .from('patients')
      .select('id, first_name, last_name, mrn, status', { count: 'exact' })
      .eq('org_id', orgId);
    
    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,mrn.ilike.%${search}%`);
    }
    
    if (officeId) {
      query = query.eq('office_id', officeId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    // Apply pagination
    query = query
      .order('last_name')
      .range(offset, offset + pageSizeNum - 1);
    
    const { data, count, error } = await query;
    
    if (error) throw error;
    
    // Transform to summary format
    const patients = data.map(p => ({
      id: p.id,
      name: `${p.first_name} ${p.last_name}`,
      mrn: p.mrn,
      status: p.status,
      lastVisit: null // TODO: Join with visits
    }));
    
    return c.json({
      data: patients,
      total: count || 0,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages: Math.ceil((count || 0) / pageSizeNum)
    });
    
  } catch (error: any) {
    console.error('Error fetching paginated patients:', error);
    return c.json({ error: error.message }, 500);
  }
});
```

---

## Week 5-6: Enforcement & Testing

### Task 5.1: ESLint Rules

**File**: `.eslintrc.js`

```javascript
module.exports = {
  rules: {
    // Ban hardcoded colors
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
        message: 'Use semantic tokens instead of hardcoded colors'
      },
      {
        selector: 'Literal[value=/^rgb\\(/]',
        message: 'Use semantic tokens instead of hardcoded colors'
      }
    ],
    
    // Ban direct Supabase imports in pages
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/supabaseClient'],
            message: 'Use dataGateway instead of direct Supabase access'
          }
        ]
      }
    ]
  }
};
```

### Task 5.2: Pre-commit Hooks

**File**: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check for hardcoded colors
if git diff --cached --name-only | grep -E '\.(tsx|ts)$' | xargs grep -E 'className=".*bg-(red|green|blue|yellow|gray)-[0-9]{3}"'; then
  echo "ERROR: Hardcoded Tailwind colors found. Use semantic tokens instead."
  exit 1
fi

# Check for direct Supabase imports in pages
if git diff --cached --name-only | grep -E 'pages/.*\.(tsx|ts)$' | xargs grep -E 'from.*supabaseClient'; then
  echo "ERROR: Direct Supabase import found in page. Use dataGateway instead."
  exit 1
fi

npm run lint
```

### Task 5.3: Code Review Checklist

**File**: `.github/pull_request_template.md`

```markdown
## Design System Compliance Checklist

- [ ] Uses semantic tokens (no hardcoded colors/spacing)
- [ ] Uses existing shell (ListPageShell, WorkspaceShell, etc.)
- [ ] Implements pagination for lists >25 items
- [ ] Uses StatusBadge for status display
- [ ] Uses healthcare components where applicable
- [ ] Data access through dataGateway (no direct Supabase)
- [ ] Loading and error states implemented
- [ ] Memoization for expensive operations
- [ ] Follows SCREEN_GENERATION.md rules
```

---

## Success Metrics

### Week 1
- [ ] StatusBadge component created
- [ ] PriorityIndicator component created
- [ ] Pagination added to dataGateway

### Week 2
- [ ] PatientList refactored
- [ ] 2+ other pages refactored

### Week 3
- [ ] 10+ healthcare components created
- [ ] Documentation updated

### Week 4
- [ ] Backend pagination implemented
- [ ] Server-side filtering implemented

### Week 5-6
- [ ] ESLint rules configured
- [ ] Pre-commit hooks added
- [ ] 90% compliance reached

---

## Rollout Strategy

### Phase 1: New Code (Week 1-2)
- All new screens must follow design system
- Code reviews enforce compliance

### Phase 2: High-Traffic Pages (Week 3-4)
- Refactor: PatientList, Dashboard, Admissions
- Measure performance improvements

### Phase 3: Remaining Pages (Week 5-6)
- Refactor all list pages
- Refactor all workspace pages
- Update documentation

---

## Training

### Developer Training Session (Week 2)
**Duration**: 2 hours

**Topics**:
1. Design system overview (15 min)
2. Using semantic tokens (20 min)
3. Shell patterns (30 min)
4. Healthcare components (30 min)
5. Pagination patterns (15 min)
6. Q&A (10 min)

**Materials**:
- QUICK_REFERENCE.md
- SCREEN_GENERATION.md
- Live coding examples

---

## Support

### During Implementation

**Office Hours**: Daily 2-3pm
**Slack Channel**: #design-system
**Documentation**: design-system/README.md
**Point of Contact**: Design System Team

---

**Next Review**: Weekly standup  
**Status Updates**: Twice weekly  
**Completion Target**: April 22, 2026