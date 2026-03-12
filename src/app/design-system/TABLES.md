# Table Pattern Rules

Comprehensive guide for table patterns in the healthcare platform.

## Table Types

### 1. Standard Operational Table

**Use for**: Patient lists, admission queues, order lists, document lists

**Features**:
- Sortable columns
- Row selection (single/multiple)
- Row actions
- Status badges
- Pagination
- Filters integration

**Example**:
```tsx
<Table
  columns={[
    { key: 'name', label: 'Patient Name', sortable: true },
    { key: 'mrn', label: 'MRN', sortable: true },
    { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    { key: 'actions', label: '', render: (row) => <ActionMenu items={actions} /> }
  ]}
  data={patients}
  onSort={handleSort}
  onRowClick={handleRowClick}
  selectable
/>
```

### 2. Compact Queue Table

**Use for**: QA queues, task lists, notification queues

**Features**:
- Dense rows (minimal padding)
- Priority indicators
- Assigned user display
- Quick actions
- Hover-revealed actions

**Characteristics**:
- Row height: 40px-48px
- Font size: 13px (compactTable token)
- Reduced padding
- Hover state for actions

**Example**:
```tsx
<QueueTable
  columns={queueColumns}
  data={queueItems}
  rowHeight="compact"
  showAssignee
  showPriority
/>
```

### 3. Comparison Table

**Use for**: Before/after comparisons, multi-visit comparisons, recertification comparisons

**Features**:
- Side-by-side columns
- Highlighted differences
- Sticky column headers
- Change indicators

**Example**:
```tsx
<ComparisonTable
  columns={[
    { key: 'field', label: 'Field' },
    { key: 'before', label: 'Previous' },
    { key: 'after', label: 'Current' },
    { key: 'change', label: 'Change', render: highlightChange }
  ]}
  data={comparisonData}
/>
```

### 4. Timeline Activity Table

**Use for**: Activity logs, audit trails, status history

**Features**:
- Chronological ordering
- Timestamp display
- User attribution
- Event type icons
- Expandable details

**Example**:
```tsx
<TimelineTable
  events={activityLog}
  renderEvent={(event) => (
    <TimelineRow
      timestamp={event.timestamp}
      user={event.user}
      icon={getEventIcon(event.type)}
      title={event.description}
      details={event.metadata}
    />
  )}
/>
```

## Table Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│  Table Header                                                │
│  ┌───────────────┬──────────────┬─────────────┬──────────┐ │
│  │ Column Header │ Column Header│ Column Header│  Actions │ │
│  │ [Sort Icon]   │ [Sort Icon]  │              │          │ │
│  └───────────────┴──────────────┴─────────────┴──────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┬──────────────┬─────────────┬──────────┐ │
│  │ Cell Content  │ Cell Content │ Badge       │ [Menu]   │ │
│  └───────────────┴──────────────┴─────────────┴──────────┘ │
│  ┌───────────────┬──────────────┬─────────────┬──────────┐ │
│  │ Cell Content  │ Cell Content │ Badge       │ [Menu]   │ │
│  └───────────────┴──────────────┴─────────────┴──────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Pagination: [← 1 2 3 4 →]                     Rows: 50    │
└─────────────────────────────────────────────────────────────┘
```

## Column Configuration

### Column Definition

```tsx
interface TableColumn<T> {
  /** Unique column identifier */
  key: string;
  
  /** Column header label */
  label: string;
  
  /** Enable sorting */
  sortable?: boolean;
  
  /** Column width (px, %, 'auto') */
  width?: string | number;
  
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  
  /** Custom cell renderer */
  render?: (row: T) => React.ReactNode;
  
  /** Custom header renderer */
  renderHeader?: () => React.ReactNode;
  
  /** Column is sticky (fixed position) */
  sticky?: 'left' | 'right';
  
  /** Hide column on small screens */
  hideOnMobile?: boolean;
}
```

### Standard Column Types

```tsx
// ✅ GOOD: Reusable column definitions
const columns = useMemo(() => [
  // Text column
  {
    key: 'name',
    label: 'Patient Name',
    sortable: true,
    width: 200
  },
  
  // Badge column
  {
    key: 'status',
    label: 'Status',
    render: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>
  },
  
  // Date column
  {
    key: 'admissionDate',
    label: 'Admission Date',
    sortable: true,
    render: (row) => formatDate(row.admissionDate)
  },
  
  // User column
  {
    key: 'assignedTo',
    label: 'Assigned To',
    render: (row) => <UserBadge user={row.assignedTo} />
  },
  
  // Actions column
  {
    key: 'actions',
    label: '',
    width: 60,
    align: 'right',
    render: (row) => <TableRowActions row={row} actions={rowActions} />
  }
], []);
```

## Row Configuration

### Row Sizes

```tsx
export const rowSize = {
  // Compact (dense information)
  compact: {
    height: '40px',
    padding: '8px 12px',
    fontSize: fontSize.sm
  },
  
  // Default (balanced)
  default: {
    height: '48px',
    padding: '12px 16px',
    fontSize: fontSize.base
  },
  
  // Comfortable (spacious)
  comfortable: {
    height: '56px',
    padding: '16px 20px',
    fontSize: fontSize.base
  }
};
```

### Row States

```tsx
// Hover state
onMouseEnter: (row) => setHoveredRow(row.id)
onMouseLeave: () => setHoveredRow(null)

// Selected state
selected: selectedRows.includes(row.id)

// Disabled state
disabled: row.status === 'archived'

// Expandable
expandable: true
expanded: expandedRows.includes(row.id)
```

## Performance Rules

### 1. Stable Column Definitions

```tsx
// ❌ BAD: Recreates columns on every render
function PatientTable() {
  const columns = [
    { key: 'name', label: 'Name' }  // ⚠️ New array every render
  ];
  return <Table columns={columns} />;
}

// ✅ GOOD: Memoized columns
function PatientTable() {
  const columns = useMemo(() => [
    { key: 'name', label: 'Name' }
  ], []);
  return <Table columns={columns} />;
}
```

### 2. Server-Side Pagination

```tsx
// ✅ Always use server-side pagination
function PatientTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  
  const { data, total } = usePatients({
    page,
    pageSize,
    sort: sortConfig,
    filter: filterConfig
  });
  
  return (
    <Table
      data={data}
      totalRows={total}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
    />
  );
}
```

### 3. Virtualization for Large Lists

```tsx
// ✅ Use virtualization for >100 rows
import { VirtualTable } from '@/design-system/components';

<VirtualTable
  columns={columns}
  data={largeDataset}
  rowHeight={48}
  visibleRows={20}
/>
```

### 4. Avoid Heavy Row Rendering

```tsx
// ❌ BAD: Heavy computation in render
{
  key: 'status',
  render: (row) => {
    const complex = heavyComputation(row);  // ⚠️ Runs for every row!
    return <Badge>{complex}</Badge>;
  }
}

// ✅ GOOD: Pre-compute before rendering
const processedData = useMemo(() => 
  data.map(row => ({
    ...row,
    complexValue: heavyComputation(row)
  })),
  [data]
);

{
  key: 'status',
  render: (row) => <Badge>{row.complexValue}</Badge>
}
```

## Sorting

### Client-Side Sorting

```tsx
// Only use for small datasets (<100 rows)
const [sortBy, setSortBy] = useState('name');
const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

const sortedData = useMemo(() => {
  return [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    return sortDir === 'asc' 
      ? aVal > bVal ? 1 : -1
      : aVal < bVal ? 1 : -1;
  });
}, [data, sortBy, sortDir]);
```

### Server-Side Sorting

```tsx
// ✅ Default for all tables
const { data } = usePatients({
  sort: {
    field: 'name',
    direction: 'asc'
  }
});
```

## Row Actions

### Inline Actions

```tsx
// Actions visible in row
<TableRowActions
  actions={[
    { icon: <EditIcon />, label: 'Edit', onClick: handleEdit },
    { icon: <ViewIcon />, label: 'View', onClick: handleView }
  ]}
/>
```

### Hover Actions

```tsx
// Actions visible on hover
<TableRow onHover={(isHovered) => setShowActions(isHovered)}>
  {/* Row content */}
  {showActions && <QuickActions />}
</TableRow>
```

### Menu Actions

```tsx
// Overflow menu for many actions
<ActionMenu
  items={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Duplicate', onClick: handleDuplicate },
    { label: 'Archive', onClick: handleArchive },
    { label: 'Delete', onClick: handleDelete, variant: 'danger' }
  ]}
/>
```

## Bulk Selection

### Selection Patterns

```tsx
import { useBulkSelection } from '@/design-system/hooks';

function PatientTable() {
  const {
    selectedIds,
    isSelected,
    toggleSelection,
    toggleSelectAll,
    clearSelection
  } = useBulkSelection();
  
  return (
    <>
      {selectedIds.length > 0 && (
        <BulkActionBar
          count={selectedIds.length}
          actions={[
            { label: 'Assign', onClick: handleBulkAssign },
            { label: 'Export', onClick: handleBulkExport }
          ]}
          onClear={clearSelection}
        />
      )}
      
      <Table
        columns={columns}
        data={patients}
        selectable
        selectedIds={selectedIds}
        onSelect={toggleSelection}
        onSelectAll={toggleSelectAll}
      />
    </>
  );
}
```

## Status Badges

### Badge in Table Cell

```tsx
// ✅ Status badge (color + text)
{
  key: 'status',
  label: 'Status',
  render: (row) => (
    <Badge variant={getStatusVariant(row.status)}>
      {row.status}
    </Badge>
  )
}

// Variant mapping
function getStatusVariant(status: string) {
  const map = {
    active: 'success',
    pending: 'warning',
    inactive: 'neutral',
    error: 'danger'
  };
  return map[status] || 'neutral';
}
```

### Priority Indicators

```tsx
// ✅ Priority with color + icon + text
{
  key: 'priority',
  label: 'Priority',
  render: (row) => (
    <div className="flex items-center gap-2">
      <PriorityDot priority={row.priority} />
      <span>{row.priority}</span>
    </div>
  )
}
```

## Empty States

```tsx
// Table with no data
{data.length === 0 ? (
  <EmptyTableState
    icon={<PatientsIcon />}
    title="No patients found"
    description="Create your first patient to get started"
    action={<Button onClick={handleCreate}>Create Patient</Button>}
  />
) : (
  <Table columns={columns} data={data} />
)}
```

## Loading States

```tsx
// Loading skeleton
{loading ? (
  <TableSkeleton rows={10} columns={5} />
) : (
  <Table columns={columns} data={data} />
)}
```

## Responsive Behavior

### Mobile Adaptation

```tsx
// Hide columns on mobile
const columns = [
  { key: 'name', label: 'Name' },  // Always visible
  { key: 'mrn', label: 'MRN', hideOnMobile: true },
  { key: 'status', label: 'Status' },  // Always visible
  { key: 'admissionDate', label: 'Admission', hideOnMobile: true },
  { key: 'actions', label: '' }  // Always visible
];
```

### Horizontal Scroll

```tsx
// Table with horizontal scroll on mobile
<div className="overflow-x-auto">
  <Table columns={columns} data={data} minWidth="800px" />
</div>
```

## Accessibility

### Keyboard Navigation

- `Tab` - Navigate to table
- `↑↓` - Navigate rows
- `Space` - Select row
- `Enter` - Activate row action

### Screen Readers

```tsx
// Proper table markup
<table role="table" aria-label="Patient list">
  <thead>
    <tr>
      <th scope="col">Patient Name</th>
      <th scope="col">MRN</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>12345</td>
    </tr>
  </tbody>
</table>
```

### Sort Indicators

```tsx
// Accessible sort button
<button
  onClick={() => handleSort('name')}
  aria-label={`Sort by name ${sortDir === 'asc' ? 'descending' : 'ascending'}`}
>
  Name
  {sortBy === 'name' && <SortIcon direction={sortDir} />}
</button>
```

## Best Practices

### DO ✅

- Use server-side pagination for all tables
- Memoize column definitions
- Use semantic status badges (color + text + icon)
- Implement keyboard navigation
- Show loading skeletons
- Handle empty states
- Provide clear row actions
- Use virtualization for >100 rows

### DON'T ❌

- Load entire dataset for large tables
- Recreate columns on every render
- Use color as sole status indicator
- Hide important actions in overflow menu
- Forget mobile responsive behavior
- Skip empty/loading states
- Make rows too dense (reduce readability)
- Put heavy logic in cell renderers

---

**Version**: 1.0  
**Last Updated**: March 11, 2026
