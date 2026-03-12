Create the design system for a modern enterprise healthcare operations platform focused on home health and hospice.

The design system must support complex workflows, dense information displays, accessibility, and consistent React component reuse.

Define the following foundations:

Color System
- Neutral scale for text, surfaces, and borders
- Primary brand color
- Semantic colors: success, warning, danger, info
- Disabled and focus states
- Colors must never be the only indicator of state

Typography
- Page title
- Section header
- Card header
- Body text
- Secondary text
- Compact table text
- Helper text

Spacing
Use a strict scale:
4, 8, 12, 16, 20, 24, 32

Radius
- cards
- inputs
- buttons
- badges

Elevation
Use subtle shadows with strong border definitions.

Icons
Use a consistent stroke icon system suitable for enterprise healthcare products.

Define reusable components:

Layout Components
- AppShell
- Sidebar
- TopBar
- WorkspaceLayout
- PatientContextHeader
- SplitViewLayout
- RightDrawer
- Modal
- StickyActionFooter

Navigation
- NavItem
- NavGroup
- Breadcrumb
- Tabs
- CommandPalette
- QuickSwitcher

Data Display
- DataTable
- CompactTable
- QueueCard
- MetricCard
- StatusBadge
- Timeline
- ActivityFeed
- EmptyState
- SkeletonLoader

Forms
- TextInput
- Select
- AsyncSearchSelect
- DatePicker
- DateRange
- TextArea
- Checkbox
- RadioGroup
- Switch
- FileUpload
- SignatureCapture

Healthcare Patterns
- PatientSummaryBanner
- AdmissionSummaryPanel
- PayerSummaryPanel
- AuthorizationWarning
- EVVStatusCard
- QAStatusBadge
- MedicalDirectorSignatureItem
- HOPEDueTracker
- OpenShiftItem
- DelayedVisitAlert

Ensure all future screens reuse these components instead of creating one-off UI patterns.