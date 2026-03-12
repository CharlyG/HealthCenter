# Route and Layout Stability Rules

Guidelines for consistent routing patterns and stable layouts across the healthcare platform.

## Overview

Routes should follow predictable patterns and reuse shared page shells to reduce UI jank and improve perceived performance.

## Route Patterns

### 1. List Routes

**Pattern**: `/{entity}` or `/{workspace}`

```
/patients
/admissions
/visits
/orders
/qa-workspace
/billing-workspace
```

**Shell**: `ListPageShell`

```tsx
<ListPageShell
  title="Patients"
  icon={<UsersIcon />}
  actions={<CreatePatientButton />}
  filters={<PatientFilters />}
  breadcrumbs={[{ label: 'Patients' }]}
>
  <PaginatedPatientTable />
</ListPageShell>
```

### 2. Detail Routes

**Pattern**: `/{entity}/{id}`

```
/patients/12345
/admissions/ADM-789
/visits/VST-456
/orders/ORD-123
```

**Shell**: `DetailPageShell`

```tsx
<DetailPageShell
  title={patient.name}
  subtitle={`MRN: ${patient.mrn}`}
  status={<StatusBadge status={patient.status} />}
  actions={<PatientActions />}
  breadcrumbs={[
    { label: 'Patients', href: '/patients' },
    { label: patient.name }
  ]}
  tabs={[
    { id: 'overview', label: 'Overview' },
    { id: 'visits', label: 'Visits' },
    { id: 'documents', label: 'Documents' }
  ]}
>
  <TabContent />
</DetailPageShell>
```

### 3. Patient Context Routes

**Pattern**: `/patients/{patientId}/{context}`

```
/patients/12345/chart
/patients/12345/visits
/patients/12345/documents
/patients/12345/orders
/patients/12345/medications
```

**Shell**: `PatientContextShell`

```tsx
<PatientContextShell patientId={patientId}>
  <PatientContextHeader patient={patient} />
  
  <Tabs>
    <TabsList>
      <TabsTrigger value="chart">Chart</TabsTrigger>
      <TabsTrigger value="visits">Visits</TabsTrigger>
      <TabsTrigger value="documents">Documents</TabsTrigger>
    </TabsList>
    
    <TabsContent value="chart">
      <PatientChart />
    </TabsContent>
  </Tabs>
</PatientContextShell>
```

### 4. Admission Context Routes

**Pattern**: `/admissions/{admissionId}/{context}`

```
/admissions/ADM-789/overview
/admissions/ADM-789/care-plan
/admissions/ADM-789/visits
/admissions/ADM-789/orders
/admissions/ADM-789/authorizations
```

**Shell**: `AdmissionContextShell`

```tsx
<AdmissionContextShell admissionId={admissionId}>
  <AdmissionContextBar admission={admission} />
  
  <div className="admission-content">
    <Outlet />
  </div>
</AdmissionContextShell>
```

### 5. Editor Routes

**Pattern**: `/{entity}/{id}/edit` or `/{entity}/new`

```
/patients/12345/edit
/patients/new
/admissions/ADM-789/edit
/admissions/new
/orders/ORD-123/edit
```

**Shell**: `EditorShell`

```tsx
<EditorShell
  title="Edit Patient"
  breadcrumbs={[
    { label: 'Patients', href: '/patients' },
    { label: patient.name, href: `/patients/${patient.id}` },
    { label: 'Edit' }
  ]}
  footer={
    <StickyFooter>
      <FooterLeft>
        <Button variant="link" onClick={handleCancel}>Cancel</Button>
      </FooterLeft>
      <FooterRight>
        <SaveStatus status={saveStatus} />
        <Button variant="secondary" onClick={saveDraft}>Save Draft</Button>
        <Button variant="primary" onClick={handleSubmit}>Save Changes</Button>
      </FooterRight>
    </StickyFooter>
  }
>
  <PatientEditForm />
</EditorShell>
```

### 6. Settings Routes

**Pattern**: `/settings/{category}`

```
/settings/profile
/settings/organization
/settings/billing
/settings/integrations
/settings/users
/settings/roles
```

**Shell**: `SettingsShell`

```tsx
<SettingsShell
  title="Settings"
  sections={[
    { id: 'profile', label: 'Profile', icon: <UserIcon /> },
    { id: 'organization', label: 'Organization', icon: <BuildingIcon /> },
    { id: 'billing', label: 'Billing', icon: <CreditCardIcon /> },
    { id: 'integrations', label: 'Integrations', icon: <PlugIcon /> }
  ]}
>
  <SettingsContent />
</SettingsShell>
```

### 7. Workflow Routes

**Pattern**: `/{workflow}/{step}` or `/{workflow}/{id}/{step}`

```
/new-admission/patient-info
/new-admission/insurance
/new-admission/clinical
/new-admission/review

/assessments/12345/demographics
/assessments/12345/functional
/assessments/12345/clinical
/assessments/12345/review
```

**Shell**: `WorkflowShell`

```tsx
<WorkflowShell
  title="New Admission"
  steps={[
    { id: 'patient-info', label: 'Patient Info' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'clinical', label: 'Clinical' },
    { id: 'review', label: 'Review' }
  ]}
  currentStep={currentStep}
  onStepChange={setCurrentStep}
  footer={
    <StickyFooter>
      <FooterLeft>
        <StepIndicator current={currentStep} total={steps.length} />
      </FooterLeft>
      <FooterRight>
        {currentStep > 1 && (
          <Button variant="secondary" onClick={goBack}>Back</Button>
        )}
        {currentStep < steps.length ? (
          <Button variant="primary" onClick={goNext}>Next</Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit}>Submit</Button>
        )}
      </FooterRight>
    </StickyFooter>
  }
>
  <StepContent />
</WorkflowShell>
```

## Layout Stability

### Stable Layout Structure

**Keep these elements stable during navigation**:

```tsx
// Root layout - Always present
<div className="app-layout">
  {/* Persistent navigation */}
  <GlobalNavigation />
  
  {/* Main content area */}
  <main className="app-content">
    {/* Context-specific header (patient, admission, etc.) */}
    {contextHeader}
    
    {/* Page content - changes on navigation */}
    <Outlet />
  </main>
</div>
```

### Patient Context Stability

**When navigating within patient context, keep patient header visible**:

```tsx
// Routes: /patients/12345/chart, /patients/12345/visits, /patients/12345/documents

<PatientContextShell>
  {/* Stable - doesn't rerender */}
  <PatientContextHeader patient={patient} />
  
  {/* Changes based on route */}
  <Outlet />
</PatientContextShell>
```

**Benefits**:
- Patient info always visible
- No layout shift
- Faster perceived navigation
- Maintains context

### Admission Context Stability

**When navigating within admission context, keep admission bar visible**:

```tsx
// Routes: /admissions/ADM-789/overview, /admissions/ADM-789/visits

<AdmissionContextShell>
  {/* Stable */}
  <AdmissionContextBar admission={admission} />
  
  {/* Changes */}
  <Outlet />
</AdmissionContextShell>
```

### Workspace Context Stability

**When navigating within workspace, keep workspace chrome stable**:

```tsx
// Routes: /qa-workspace/pending, /qa-workspace/in-review, /qa-workspace/completed

<QAWorkspaceShell>
  {/* Stable */}
  <WorkspaceHeader title="QA Center" />
  <WorkspaceTabs tabs={qaTabs} />
  
  {/* Changes */}
  <Outlet />
</QAWorkspaceShell>
```

## Route Configuration

### Route Hierarchy

```tsx
const routes = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Dashboard
      { index: true, element: <Dashboard /> },
      
      // Patient Routes
      {
        path: 'patients',
        children: [
          // List
          { index: true, element: <PatientList /> },
          
          // New
          { path: 'new', element: <NewPatient /> },
          
          // Patient Context
          {
            path: ':patientId',
            element: <PatientContextShell />,
            children: [
              { index: true, element: <PatientOverview /> },
              { path: 'chart', element: <PatientChart /> },
              { path: 'visits', element: <PatientVisits /> },
              { path: 'documents', element: <PatientDocuments /> },
              { path: 'orders', element: <PatientOrders /> },
              { path: 'edit', element: <EditPatient /> }
            ]
          }
        ]
      },
      
      // Admission Routes
      {
        path: 'admissions',
        children: [
          { index: true, element: <AdmissionList /> },
          { path: 'new', element: <NewAdmission /> },
          {
            path: ':admissionId',
            element: <AdmissionContextShell />,
            children: [
              { index: true, element: <AdmissionOverview /> },
              { path: 'care-plan', element: <CarePlan /> },
              { path: 'visits', element: <AdmissionVisits /> },
              { path: 'orders', element: <AdmissionOrders /> }
            ]
          }
        ]
      },
      
      // Workspace Routes
      {
        path: 'qa-workspace',
        element: <QAWorkspaceShell />,
        children: [
          { index: true, element: <QAPending /> },
          { path: 'in-review', element: <QAInReview /> },
          { path: 'completed', element: <QACompleted /> }
        ]
      }
    ]
  }
]);
```

## Navigation Performance

### Prefetch on Hover

```tsx
function PatientTableRow({ patient }: { patient: Patient }) {
  const navigate = useNavigate();
  const [isPrefetching, startPrefetch] = useState(false);
  
  const handleMouseEnter = () => {
    if (!isPrefetching) {
      // Prefetch patient data
      queryClient.prefetchQuery({
        queryKey: ['patient', patient.id],
        queryFn: () => fetchPatient(patient.id)
      });
      startPrefetch(true);
    }
  };
  
  return (
    <tr
      onClick={() => navigate(`/patients/${patient.id}`)}
      onMouseEnter={handleMouseEnter}
    >
      {/* ... */}
    </tr>
  );
}
```

### Optimistic Navigation

```tsx
function navigateWithOptimisticUI(path: string) {
  // Show loading state immediately
  setNavigating(true);
  
  // Navigate
  navigate(path);
  
  // Hide loading after navigation completes
  setTimeout(() => setNavigating(false), 100);
}
```

### Preserve Scroll Position

```tsx
// Preserve scroll when navigating back
<Router>
  <ScrollRestoration />
  <Routes />
</Router>

// Or manual control
function useScrollRestoration() {
  const location = useLocation();
  const scrollPositions = useRef<Record<string, number>>({});
  
  useEffect(() => {
    // Save current scroll position
    const key = location.key;
    scrollPositions.current[key] = window.scrollY;
  }, [location]);
  
  useEffect(() => {
    // Restore scroll position
    const key = location.key;
    const savedPosition = scrollPositions.current[key];
    
    if (savedPosition !== undefined) {
      window.scrollTo(0, savedPosition);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);
}
```

## URL Patterns

### Query Parameters

```
# Filters
/patients?status=active&branch=main

# Pagination
/patients?page=2&pageSize=50

# Search
/patients?search=john+doe

# Sorting
/patients?sortBy=lastName&sortOrder=asc

# Combination
/patients?status=active&page=2&sortBy=lastName&search=smith
```

### Route Parameters

```
# Entity ID
/patients/:patientId
/admissions/:admissionId

# Optional segments
/patients/:patientId/visits/:visitId?

# Wildcards
/settings/*
```

## Best Practices

### DO ✅

- Use consistent route patterns
- Reuse page shells
- Keep context headers stable
- Implement breadcrumbs
- Preserve scroll position
- Prefetch on hover
- Use query params for filters
- Implement proper 404 pages
- Handle loading states
- Support deep linking

### DON'T ❌

- Create unique layouts for each page
- Rerender entire shell on navigation
- Hide context during navigation
- Use state for filters (use URL)
- Skip loading states
- Create inconsistent URL patterns
- Forget breadcrumbs
- Break back button
- Skip route guards
- Lose data on navigation

---

**Version**: 1.0  
**Last Updated**: March 11, 2026
