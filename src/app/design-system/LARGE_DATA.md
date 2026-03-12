# Large Data Rendering Rules

Guidelines for handling large datasets in the healthcare platform.

## Overview

Large datasets must be handled efficiently to maintain performance and user experience. Never render hundreds of complex rows at once.

## Datasets Requiring Large Data Handling

### Critical Datasets (Always use pagination/virtualization)

- **Patients** - 1000s of patient records
- **Visits** - 10,000s of visit records
- **Claims** - 100,000s of claim records
- **Orders** - 1000s of physician orders
- **Integration Logs** - Millions of log entries
- **QA Queues** - 1000s of documents
- **Documents** - 10,000s of clinical documents
- **Transactions** - 100,000s of billing transactions
- **Audit Logs** - Millions of audit entries
- **Messages/Notifications** - 10,000s of messages

## Rendering Strategies

### 1. Server-Side Pagination (Preferred)

**Use for**: Tables, lists, search results, queues

```tsx
interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Example: Patient List with Server-Side Pagination
function PatientList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState('lastName');
  const [filters, setFilters] = useState({});
  
  const { data, loading } = usePaginatedData<Patient>({
    endpoint: '/patients',
    page,
    pageSize,
    sortBy,
    filters
  });
  
  return (
    <>
      <PatientTable 
        patients={data?.data || []} 
        loading={loading}
        sortBy={sortBy}
        onSort={setSortBy}
      />
      
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        pageSize={pageSize}
        totalItems={data?.total || 0}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </>
  );
}
```

**Benefits**:
- Minimal memory footprint
- Fast initial load
- Efficient for very large datasets
- Enables server-side filtering/sorting

**Page Size Recommendations**:
- Tables: 25-50 rows
- Cards: 12-24 items
- Lists: 50-100 items

### 2. Virtual Scrolling

**Use for**: Long lists, logs, infinite scroll scenarios

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function IntegrationLogs() {
  const parentRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  
  const rowVirtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated row height
    overscan: 5 // Render 5 extra rows above/below viewport
  });
  
  return (
    <div
      ref={parentRef}
      style={{
        height: '600px',
        overflow: 'auto'
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <LogRow log={logs[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Benefits**:
- Smooth scrolling
- Handles 10,000+ items
- No pagination UI needed
- Good for logs/timelines

**When to Use**:
- Integration logs
- Audit trails
- Activity timelines
- Message threads

### 3. Infinite Scroll

**Use for**: Mobile-friendly lists, activity feeds

```tsx
function ClaimsList() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const response = await fetchClaims({ page, pageSize: 25 });
    
    setClaims(prev => [...prev, ...response.data]);
    setHasMore(response.page < response.totalPages);
    setPage(prev => prev + 1);
    setLoading(false);
  }, [page, loading, hasMore]);
  
  // Load more when scrolling near bottom
  useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    loading,
    threshold: 300 // pixels from bottom
  });
  
  return (
    <div>
      {claims.map(claim => (
        <ClaimCard key={claim.id} claim={claim} />
      ))}
      
      {loading && <LoadingSpinner />}
      {!hasMore && <div>No more items</div>}
    </div>
  );
}
```

**Benefits**:
- Mobile-friendly
- No pagination clicks
- Feels native

**When to Use**:
- Mobile views
- Activity feeds
- Social-style feeds

### 4. Lazy Loading Tabs/Sections

**Use for**: Multi-section pages with large datasets in each section

```tsx
function PatientChart({ patientId }: { patientId: string }) {
  const [activeTab, setActiveTab] = useState('demographics');
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="demographics">Demographics</TabsTrigger>
        <TabsTrigger value="visits">Visits</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
      </TabsList>
      
      <TabsContent value="demographics">
        <PatientDemographics patientId={patientId} />
      </TabsContent>
      
      {/* Only load when tab is active */}
      <TabsContent value="visits">
        {activeTab === 'visits' && (
          <PaginatedVisitList patientId={patientId} />
        )}
      </TabsContent>
      
      <TabsContent value="documents">
        {activeTab === 'documents' && (
          <VirtualizedDocumentList patientId={patientId} />
        )}
      </TabsContent>
      
      <TabsContent value="orders">
        {activeTab === 'orders' && (
          <PaginatedOrdersList patientId={patientId} />
        )}
      </TabsContent>
    </Tabs>
  );
}
```

## Data Loading Patterns

### Incremental Loading

**Priority 1: Visible Content**
```tsx
function AdmissionQueue() {
  // Load critical data first
  const { data: summary } = useSummaryData();
  
  // Load list data second
  const { data: items } = useQueueItems();
  
  // Load details on demand
  const { data: details } = useItemDetails(selectedId);
  
  return (
    <>
      {/* Show immediately */}
      <QueueSummary data={summary} />
      
      {/* Show as soon as loaded */}
      {items ? <QueueTable items={items} /> : <Skeleton />}
      
      {/* Load only when item selected */}
      {selectedId && details && <DetailsDrawer data={details} />}
    </>
  );
}
```

### Progressive Enhancement

```tsx
function Dashboard() {
  return (
    <>
      {/* Load critical metrics first */}
      <Suspense fallback={<MetricsSkeleton />}>
        <CriticalMetrics />
      </Suspense>
      
      {/* Load charts after metrics */}
      <Suspense fallback={<ChartSkeleton />}>
        <PerformanceCharts />
      </Suspense>
      
      {/* Load recent activity last */}
      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity limit={10} />
      </Suspense>
    </>
  );
}
```

## Pagination Component

```tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100]
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: space.md,
      borderTop: `1px solid ${borderColor.default}`
    }}>
      {/* Items count */}
      <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
        Showing {startItem}-{endItem} of {totalItems}
      </div>
      
      {/* Page controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          First
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        
        <div style={{ fontSize: typography.body.size }}>
          Page {currentPage} of {totalPages}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </Button>
      </div>
      
      {/* Page size selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
        <span style={{ fontSize: typography.helper.size }}>Show:</span>
        <Select value={pageSize.toString()} onChange={(val) => onPageSizeChange(Number(val))}>
          {pageSizeOptions.map(size => (
            <SelectItem key={size} value={size.toString()}>
              {size}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
}
```

## Performance Rules

### DO ✅

- Always paginate tables with >25 rows
- Use virtual scrolling for logs/timelines
- Load visible content first
- Show loading skeletons
- Implement search/filter server-side
- Use React.memo for list items
- Implement proper keys
- Debounce search inputs
- Cache paginated results
- Show total count

### DON'T ❌

- Render 100+ complex rows at once
- Load all data on page mount
- Implement pagination client-side for large datasets
- Forget loading states
- Skip virtualization for logs
- Use index as key
- Trigger search on every keystroke
- Load data that's not visible
- Show blank pages while loading
- Hide page size options

## Data Fetching Hook

```tsx
function usePaginatedData<T>({
  endpoint,
  page,
  pageSize,
  sortBy,
  sortOrder = 'asc',
  filters = {}
}: PaginationParams & { endpoint: string }) {
  const [data, setData] = useState<PaginatedResponse<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          ...(sortBy && { sortBy, sortOrder }),
          ...filters
        });
        
        const response = await fetch(`${endpoint}?${params}`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const result = await response.json();
        
        if (!cancelled) {
          setData(result);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, [endpoint, page, pageSize, sortBy, sortOrder, JSON.stringify(filters)]);
  
  return { data, loading, error };
}
```

## Backend Requirements

### Pagination Endpoint Pattern

```typescript
// GET /api/patients?page=1&pageSize=25&sortBy=lastName&sortOrder=asc&status=active

interface PaginationQuery {
  page: number;          // 1-based page number
  pageSize: number;      // Items per page
  sortBy?: string;       // Field to sort by
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;    // Additional filters
}

interface PaginatedResponse<T> {
  data: T[];             // Current page items
  total: number;         // Total items matching filters
  page: number;          // Current page
  pageSize: number;      // Items per page
  totalPages: number;    // Total pages
}

// Backend implementation
async function getPaginatedPatients(query: PaginationQuery): Promise<PaginatedResponse<Patient>> {
  const { page, pageSize, sortBy, sortOrder, ...filters } = query;
  
  // Build query with filters
  let dbQuery = db.from('patients').select('*', { count: 'exact' });
  
  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) dbQuery = dbQuery.eq(key, value);
  });
  
  // Apply sorting
  if (sortBy) {
    dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });
  }
  
  // Apply pagination
  const offset = (page - 1) * pageSize;
  dbQuery = dbQuery.range(offset, offset + pageSize - 1);
  
  const { data, count, error } = await dbQuery;
  
  if (error) throw error;
  
  return {
    data,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}
```

---

**Version**: 1.0  
**Last Updated**: March 11, 2026
