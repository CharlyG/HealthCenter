# Design System Patterns

Comprehensive pattern library for the healthcare platform.

## Table of Contents

1. [Table Patterns](#table-patterns)
2. [List and Queue Patterns](#list-and-queue-patterns)
3. [Form Patterns](#form-patterns)
4. [Navigation Patterns](#navigation-patterns)
5. [Data Display Patterns](#data-display-patterns)

---

## Table Patterns

### Standard Operational Table

**Purpose**: Display operational data with sorting, filtering, actions.

**Requirements**:
- Dense but readable rows
- Sortable columns
- Filter integration
- Row actions
- Status badges
- Bulk selection (where appropriate)

**Example**:

```tsx
<Table>
  <TableHeader sticky>
    <TableRow>
      <TableHeaderCell width="40px">
        <Checkbox onChange={handleSelectAll} />
      </TableHeaderCell>
      <TableHeaderCell sortable sortDirection="asc" onSort={() => handleSort('name')}>
        Patient Name
      </TableHeaderCell>
      <TableHeaderCell sortable onSort={() => handleSort('mrn')}>
        MRN
      </TableHeaderCell>
      <TableHeaderCell sortable onSort={() => handleSort('date')}>
        Admission Date
      </TableHeaderCell>
      <TableHeaderCell>Status</TableHeaderCell>
      <TableHeaderCell width="120px" align="right">
        Actions
      </TableHeaderCell>
    </TableRow>
  </TableHeader>
  
  <TableBody>
    {patients.map(patient => (
      <TableRow
        key={patient.id}
        selected={isSelected(patient.id)}
        onClick={() => handleRowClick(patient.id)}
      >
        <TableCell>
          <Checkbox
            checked={isSelected(patient.id)}
            onChange={() => toggleSelect(patient.id)}
          />
        </TableCell>
        <TableCell fontWeight="medium">{patient.name}</TableCell>
        <TableCell variant="secondary">{patient.mrn}</TableCell>
        <TableCell>{formatDate(patient.admissionDate)}</TableCell>
        <TableCell>
          <StatusBadge status={patient.status} />
        </TableCell>
        <TableCell align="right">
          <TableActions>
            <IconButton icon={Edit} onClick={() => handleEdit(patient.id)} />
            <IconButton icon={MoreVertical} onClick={() => showMenu(patient.id)} />
          </TableActions>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Column Configuration**:

```tsx
const PATIENT_COLUMNS = [
  {
    key: 'name',
    label: 'Patient Name',
    width: '200px',
    sortable: true,
    render: (patient) => patient.name
  },
  {
    key: 'mrn',
    label: 'MRN',
    width: '120px',
    sortable: true,
    render: (patient) => patient.mrn
  },
  {
    key: 'status',
    label: 'Status',
    width: '120px',
    render: (patient) => <StatusBadge status={patient.status} />
  }
] as const;
```

**Performance Rules**:
- Columns must be stable (defined outside component or memoized)
- Use pagination for > 50 rows
- Use virtualization for > 200 rows
- Avoid heavy rendering logic in cells
- Don't render large hidden content in rows

---

### Compact Queue Table

**Purpose**: High-density queue display for operational screens.

**Characteristics**:
- Compact spacing (`tableCellPaddingCompact`)
- Smaller font (`fontSize.sm`)
- Tight line height
- Quick scan optimized

**Example**:

```tsx
<CompactTable>
  <TableHeader>
    <TableRow>
      <TableHeaderCell>ID</TableHeaderCell>
      <TableHeaderCell>Patient</TableHeaderCell>
      <TableHeaderCell>Priority</TableHeaderCell>
      <TableHeaderCell>Assigned</TableHeaderCell>
      <TableHeaderCell>Actions</TableHeaderCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    {queue.map(item => (
      <TableRow key={item.id} compact>
        <TableCell variant="mono">{item.id}</TableCell>
        <TableCell>{item.patientName}</TableCell>
        <TableCell>
          <PriorityBadge priority={item.priority} size="sm" />
        </TableCell>
        <TableCell variant="secondary">{item.assignedTo}</TableCell>
        <TableCell>
          <Button size="sm" variant="ghost">Review</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</CompactTable>
```

---

### Comparison Table

**Purpose**: Side-by-side comparison of entities.

**Example**:

```tsx
<ComparisonTable>
  <TableHeader>
    <TableRow>
      <TableHeaderCell>Metric</TableHeaderCell>
      <TableHeaderCell>Current Period</TableHeaderCell>
      <TableHeaderCell>Previous Period</TableHeaderCell>
      <TableHeaderCell>Change</TableHeaderCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell fontWeight="medium">Total Visits</TableCell>
      <TableCell>1,234</TableCell>
      <TableCell variant="secondary">1,156</TableCell>
      <TableCell>
        <TrendIndicator value={78} isPositive />
      </TableCell>
    </TableRow>
  </TableBody>
</ComparisonTable>
```

---

### Timeline/Activity Table

**Purpose**: Chronological activity log.

**Example**:

```tsx
<ActivityTable>
  {activities.map(activity => (
    <ActivityRow key={activity.id}>
      <ActivityIcon type={activity.type} />
      <ActivityContent>
        <ActivityTitle>{activity.description}</ActivityTitle>
        <ActivityMeta>
          <Timestamp>{activity.timestamp}</Timestamp>
          <UserName>{activity.user}</UserName>
        </ActivityMeta>
      </ActivityContent>
    </ActivityRow>
  ))}
</ActivityTable>
```

---

## List and Queue Patterns

### Queue Item Pattern

**Purpose**: Reusable pattern for operational queues.

**Structure**:
- Title
- Key identifiers (MRN, Admission ID, etc.)
- Status badge
- Priority indicator
- Assigned user
- Quick actions

**Example**:

```tsx
<QueueItem
  title={item.patientName}
  identifiers={[
    { label: 'MRN', value: item.mrn },
    { label: 'Admission', value: item.admissionId }
  ]}
  status={{
    label: item.status,
    variant: getStatusVariant(item.status)
  }}
  priority={item.priority}
  metadata={[
    { icon: Calendar, label: formatDate(item.date) },
    { icon: User, label: item.assignedTo }
  ]}
  actions={[
    { label: 'Review', onClick: () => handleReview(item.id) },
    { label: 'Assign', onClick: () => handleAssign(item.id) }
  ]}
/>
```

**Use Cases**:
- Admission queue items
- Visit queue items
- Order queue items
- QA review items
- Credential issue items
- Integration error items

---

### List Item Variants

**Simple List Item**:

```tsx
<ListItem
  title="John Doe"
  subtitle="MRN: 123456"
  avatar={<Avatar name="John Doe" />}
  action={<IconButton icon={ChevronRight} />}
  onClick={() => handleClick()}
/>
```

**Detailed List Item**:

```tsx
<DetailedListItem
  title="Skilled Nursing Visit"
  subtitle="March 15, 2026 at 10:00 AM"
  metadata={[
    { label: 'Caregiver', value: 'Sarah Johnson, RN' },
    { label: 'Duration', value: '60 minutes' }
  ]}
  status={<StatusBadge status="Scheduled" />}
  actions={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Cancel', onClick: handleCancel }
  ]}
/>
```

---

## Form Patterns

### Form Structure

**Rules**:
1. Long forms must be divided into logical sections
2. Each section has clear title and optional helper text
3. Use structured fields first, narrative text second
4. Avoid excessively long uninterrupted scroll
5. Use sticky save/action footer
6. Validation appears inline and in summary panel

**Example**:

```tsx
<Form onSubmit={handleSubmit}>
  <FormSection
    title="Patient Information"
    description="Basic demographic and contact information"
  >
    <FormGrid columns={2}>
      <FormField
        label="First Name"
        required
        error={errors.firstName}
      >
        <Input
          value={formData.firstName}
          onChange={handleChange('firstName')}
        />
      </FormField>
      
      <FormField
        label="Last Name"
        required
        error={errors.lastName}
      >
        <Input
          value={formData.lastName}
          onChange={handleChange('lastName')}
        />
      </FormField>
    </FormGrid>
  </FormSection>
  
  <FormSection
    title="Insurance"
    description="Primary and secondary insurance information"
  >
    {/* Insurance fields */}
  </FormSection>
  
  <StickyFormFooter>
    <Button type="submit" variant="primary">Save Admission</Button>
    <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
    <SaveStatus status={saveStatus} />
  </StickyFormFooter>
</Form>
```

---

### Form Field Patterns

**Standard Field**:

```tsx
<FormField
  label="Medical Record Number"
  required
  helperText="Patient's unique identifier in the system"
  error={errors.mrn}
>
  <Input
    value={formData.mrn}
    onChange={handleChange('mrn')}
    placeholder="Enter MRN"
  />
</FormField>
```

**Field with Inline Help**:

```tsx
<FormField
  label="Primary Diagnosis"
  required
  helperText="ICD-10 code for primary diagnosis"
  helpContent={{
    title: 'OASIS M1021',
    content: 'Primary diagnosis most related to current plan of care',
    cmsReference: 'OASIS-E Guidance Manual, Chapter 3'
  }}
>
  <DiagnosisCodeInput
    value={formData.diagnosisCode}
    onChange={handleChange('diagnosisCode')}
  />
</FormField>
```

**Field Group**:

```tsx
<FieldGroup label="Name">
  <FormGrid columns={2}>
    <Input placeholder="First Name" {...register('firstName')} />
    <Input placeholder="Last Name" {...register('lastName')} />
  </FormGrid>
</FieldGroup>
```

---

### Form Layouts

**Single Column (Default)**:

```tsx
<FormLayout columns={1}>
  <FormField label="Full Name">
    <Input />
  </FormField>
  <FormField label="Email">
    <Input type="email" />
  </FormField>
</FormLayout>
```

**Two Column**:

```tsx
<FormLayout columns={2}>
  <FormField label="First Name">
    <Input />
  </FormField>
  <FormField label="Last Name">
    <Input />
  </FormField>
  <FormField label="Phone" span={2}>
    <Input type="tel" />
  </FormField>
</FormLayout>
```

**Responsive Grid**:

```tsx
<FormGrid
  columns={{
    sm: 1,
    md: 2,
    lg: 3
  }}
  gap="md"
>
  <FormField label="Field 1"><Input /></FormField>
  <FormField label="Field 2"><Input /></FormField>
  <FormField label="Field 3"><Input /></FormField>
</FormGrid>
```

---

### Auto-Save Pattern

```tsx
function ClinicalNoteForm({ noteId }: { noteId: string }) {
  const [formData, setFormData] = useState({});
  
  const { status, scheduleAutoSave } = useAutoSave({
    onSave: async (data) => {
      await saveClinicalNote(noteId, data);
    },
    debounceMs: 2000
  });
  
  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    scheduleAutoSave(newData);
  };
  
  return (
    <Form>
      <FormHeader>
        <FormTitle>Clinical Note</FormTitle>
        <SaveStatusIndicator status={status} />
      </FormHeader>
      
      {/* Form fields */}
    </Form>
  );
}
```

---

## Navigation Patterns

### Tabs

**Standard Tabs**:

```tsx
<Tabs value={activeTab} onChange={setActiveTab}>
  <TabList>
    <Tab value="overview">Overview</Tab>
    <Tab value="medications">Medications</Tab>
    <Tab value="documents">Documents</Tab>
  </TabList>
  
  <TabPanel value="overview">
    <OverviewContent />
  </TabPanel>
  
  <TabPanel value="medications">
    <MedicationsContent />
  </TabPanel>
  
  <TabPanel value="documents">
    <DocumentsContent />
  </TabPanel>
</Tabs>
```

**Tabs with Counts**:

```tsx
<Tab value="pending" badge={pendingCount}>
  Pending Review
</Tab>
```

**Lazy-Loaded Tabs**:

```tsx
<TabPanel value="history">
  {activeTab === 'history' && <HistoryContent />}
</TabPanel>
```

---

### Breadcrumbs

```tsx
<Breadcrumbs>
  <BreadcrumbItem href="/patients">Patients</BreadcrumbItem>
  <BreadcrumbItem href="/patients/12345">John Doe</BreadcrumbItem>
  <BreadcrumbItem current>Admission #456</BreadcrumbItem>
</Breadcrumbs>
```

---

### Pagination

```tsx
<Pagination
  page={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={totalItems}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  pageSizeOptions={[25, 50, 100]}
/>
```

---

## Data Display Patterns

### Stat Card

```tsx
<StatCard
  label="Total Patients"
  value={1,234}
  trend={{
    value: 12,
    isPositive: true,
    label: 'vs last month'
  }}
  icon={Users}
/>
```

---

### Info Panel

```tsx
<InfoPanel title="Patient Demographics">
  <InfoRow label="Date of Birth" value={formatDate(dob)} />
  <InfoRow label="Gender" value={gender} />
  <InfoRow label="Address" value={address} />
  <InfoRow label="Phone" value={formatPhone(phone)} />
</InfoPanel>
```

---

### Timeline

```tsx
<Timeline>
  <TimelineItem
    timestamp="Mar 15, 2026 10:30 AM"
    icon={<CheckCircle className="text-green-600" />}
    title="Visit Completed"
    description="Skilled nursing visit completed by Sarah Johnson"
  />
  <TimelineItem
    timestamp="Mar 14, 2026 2:15 PM"
    icon={<FileText className="text-blue-600" />}
    title="Documentation Updated"
    description="Clinical note updated"
  />
</Timeline>
```

---

### Alert/Notice

```tsx
<Alert severity="warning">
  <AlertTitle>Missing Documentation</AlertTitle>
  <AlertContent>
    Visit notes are incomplete. Please complete documentation within 24 hours.
  </AlertContent>
  <AlertActions>
    <Button size="sm">Complete Now</Button>
  </AlertActions>
</Alert>
```

---

### Empty State

```tsx
<EmptyState
  icon={Calendar}
  title="No visits scheduled"
  description="Schedule your first visit to get started"
  action={{
    label: 'Schedule Visit',
    onClick: handleSchedule
  }}
/>
```

---

## Summary

### Pattern Usage Guidelines

1. **Tables**
   - Use standard table for operational data
   - Use compact table for dense queues
   - Use comparison table for metrics
   - Always paginate or virtualize large datasets

2. **Lists and Queues**
   - Use queue item pattern for all operational queues
   - Keep structure consistent across modules
   - Include key identifiers, status, priority

3. **Forms**
   - Divide long forms into sections
   - Use auto-save for clinical forms
   - Show save status clearly
   - Validate inline

4. **Navigation**
   - Use breadcrumbs for hierarchical navigation
   - Use tabs for related content
   - Lazy-load tab content
   - Persist tab selection in URL

5. **Data Display**
   - Use stat cards for KPIs
   - Use info panels for entity details
   - Use timelines for activity/history
   - Use alerts for important notices

---

**Last Updated**: March 11, 2026  
**Version**: 1.0  
**Maintained by**: Healthcare Platform Team
