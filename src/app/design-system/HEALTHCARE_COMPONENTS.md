# Healthcare-Specific Reusable Components

Specialized components for healthcare workflows that should be reusable across multiple screens.

## Overview

These components encapsulate common healthcare domain concepts and should be consistent throughout the platform.

## Patient Context Components

### 1. Patient Context Header

**Use in**: All patient-scoped pages

```tsx
interface PatientContextHeaderProps {
  patient: Patient;
  showActions?: boolean;
  showAllergies?: boolean;
  showMedications?: boolean;
  compact?: boolean;
}

<PatientContextHeader
  patient={patient}
  showActions
  showAllergies
  showMedications
/>
```

**Displays**:
- Patient name
- MRN
- DOB / Age
- Primary diagnosis
- Allergies (critical)
- Active medications (expandable)
- Quick actions (chart, schedule, documents)

### 2. Admission Context Bar

**Use in**: All admission-scoped pages

```tsx
interface AdmissionContextBarProps {
  admission: Admission;
  showProgress?: boolean;
  showAuthorizations?: boolean;
  compact?: boolean;
}

<AdmissionContextBar
  admission={admission}
  showProgress
  showAuthorizations
/>
```

**Displays**:
- Admission ID
- Start date
- Cert period
- Episode status
- Authorization status
- Progress indicators
- Quick actions

## Clinical Components

### 3. Authorization Tracker

**Use in**: Admission dashboard, billing workspace

```tsx
interface AuthorizationTrackerProps {
  admissionId: string;
  authorizations: Authorization[];
  onRequestAuth?: () => void;
}

<AuthorizationTracker
  admissionId={admission.id}
  authorizations={admission.authorizations}
  onRequestAuth={handleRequestAuth}
/>
```

**Features**:
- Current auth status
- Units authorized vs used
- Expiration warnings
- Request new auth button
- Auth history timeline

### 4. Frequency Tracker

**Use in**: Care plan, visit scheduling

```tsx
interface FrequencyTrackerProps {
  admissionId: string;
  discipline: Discipline;
  frequencies: VisitFrequency[];
  showCompliance?: boolean;
}

<FrequencyTracker
  admissionId={admission.id}
  discipline="SN"
  frequencies={carePlan.frequencies}
  showCompliance
/>
```

**Features**:
- Weekly/monthly targets
- Visits completed vs required
- Compliance percentage
- Upcoming visit needs
- Adjustment warnings

### 5. Medication Summary Card

**Use in**: Patient chart, visit preparation

```tsx
interface MedicationSummaryCardProps {
  patientId: string;
  medications: Medication[];
  showInteractions?: boolean;
  onReconcile?: () => void;
}

<MedicationSummaryCard
  patientId={patient.id}
  medications={patient.activeMedications}
  showInteractions
  onReconcile={openReconciliation}
/>
```

**Features**:
- Active medications list
- Recent changes indicator
- Drug interactions alerts
- Reconciliation status
- Quick actions (add, edit, reconcile)

### 6. Clinical Alert Card

**Use in**: Dashboards, patient chart

```tsx
interface ClinicalAlertCardProps {
  alert: ClinicalAlert;
  severity: 'critical' | 'high' | 'medium' | 'low';
  onAcknowledge?: () => void;
  onDismiss?: () => void;
}

<ClinicalAlertCard
  alert={alert}
  severity="high"
  onAcknowledge={handleAcknowledge}
  onDismiss={handleDismiss}
/>
```

**Displays**:
- Alert type & description
- Severity indicator
- Triggered date/time
- Related patient/admission
- Actions (acknowledge, dismiss, view details)

### 7. Wound Progression Card

**Use in**: Patient chart, wound care tracking

```tsx
interface WoundProgressionCardProps {
  woundId: string;
  assessments: WoundAssessment[];
  showTrend?: boolean;
}

<WoundProgressionCard
  woundId={wound.id}
  assessments={wound.assessments}
  showTrend
/>
```

**Features**:
- Wound location/type
- Current status
- Size progression chart
- Healing stage timeline
- Treatment plan
- Next assessment due

## Documentation Components

### 8. Documentation Progress Card

**Use in**: Dashboards, documentation workspace

```tsx
interface DocumentationProgressCardProps {
  visit?: Visit;
  admission?: Admission;
  period?: 'today' | 'week' | 'month';
  groupBy?: 'discipline' | 'status' | 'caregiver';
}

<DocumentationProgressCard
  admission={admission}
  period="week"
  groupBy="discipline"
/>
```

**Displays**:
- Completed vs pending
- Completion percentage
- Overdue count
- By discipline breakdown
- Critical missing docs
- Quick access to pending

### 9. Signature Status Card

**Use in**: Document workflow, QA workspace

```tsx
interface SignatureStatusCardProps {
  document: Document;
  requiredSignatures: SignatureRequirement[];
  onRequestSignature?: (signerId: string) => void;
}

<SignatureStatusCard
  document={document}
  requiredSignatures={document.signatureRequirements}
  onRequestSignature={requestSignature}
/>
```

**Features**:
- Required signers list
- Signed vs pending
- Signature timestamps
- Reminder functionality
- Signature history

## Operational Components

### 10. QA Queue Item

**Use in**: QA workspace, review queues

```tsx
interface QAQueueItemProps {
  document: QADocument;
  onReview?: () => void;
  onReturn?: () => void;
  onApprove?: () => void;
  compact?: boolean;
}

<QAQueueItem
  document={doc}
  onReview={handleReview}
  onReturn={handleReturn}
  onApprove={handleApprove}
/>
```

**Displays**:
- Document type & patient
- Submission date/time
- Assigned reviewer
- Priority indicator
- Review status
- Quick actions

### 11. EVV Status Card

**Use in**: Visit dashboard, caregiver app

```tsx
interface EVVStatusCardProps {
  visit: Visit;
  evvRecords: EVVRecord[];
  showMap?: boolean;
}

<EVVStatusCard
  visit={visit}
  evvRecords={visit.evvRecords}
  showMap
/>
```

**Features**:
- Clock in/out status
- GPS verification
- Location map (optional)
- Duration tracking
- Compliance indicator
- Exception flagging

### 12. Visit Status Timeline

**Use in**: Visit details, patient chart

```tsx
interface VisitStatusTimelineProps {
  visit: Visit;
  events: VisitEvent[];
  compact?: boolean;
}

<VisitStatusTimeline
  visit={visit}
  events={visit.statusHistory}
  compact
/>
```

**Displays**:
- Visit lifecycle stages
- Timestamps for each stage
- Actor information
- Status transitions
- Current stage highlight
- Exception events

## Compliance Components

### 13. Compliance Checklist Card

**Use in**: Admission dashboard, compliance workspace

```tsx
interface ComplianceChecklistCardProps {
  admissionId: string;
  items: ComplianceItem[];
  category?: ComplianceCategory;
  onComplete?: (itemId: string) => void;
}

<ComplianceChecklistCard
  admissionId={admission.id}
  items={compliance.items}
  category="admission"
  onComplete={handleComplete}
/>
```

**Features**:
- Checklist items
- Completion status
- Due dates
- Overdue indicators
- Responsibility assignment
- Progress percentage

### 14. Credential Status Badge

**Use in**: Caregiver profile, assignment validation

```tsx
interface CredentialStatusBadgeProps {
  credential: Credential;
  showExpiration?: boolean;
  variant?: 'badge' | 'card';
}

<CredentialStatusBadge
  credential={credential}
  showExpiration
  variant="card"
/>
```

**Displays**:
- Credential type
- Status (active, expiring, expired)
- Expiration date
- Renewal actions
- Warning indicators

## Billing Components

### 15. Claim Status Card

**Use in**: Billing workspace, admission dashboard

```tsx
interface ClaimStatusCardProps {
  claim: Claim;
  showHistory?: boolean;
  onResubmit?: () => void;
}

<ClaimStatusCard
  claim={claim}
  showHistory
  onResubmit={handleResubmit}
/>
```

**Features**:
- Claim ID & status
- Submission date
- Payer information
- Amount billed/paid
- Denial reasons
- Resubmission actions

### 16. Payment Reconciliation Card

**Use in**: Billing workspace

```tsx
interface PaymentReconciliationCardProps {
  payment: Payment;
  claims: Claim[];
  onReconcile?: () => void;
}

<PaymentReconciliationCard
  payment={payment}
  claims={relatedClaims}
  onReconcile={handleReconcile}
/>
```

**Features**:
- Payment amount & date
- Associated claims
- Reconciliation status
- Variance indicators
- Manual reconciliation

## Component Library Structure

```
/src/app/components/healthcare/
  /patient/
    PatientContextHeader.tsx
    PatientSummaryCard.tsx
    PatientAllergyList.tsx
  
  /admission/
    AdmissionContextBar.tsx
    AdmissionSummaryCard.tsx
    AuthorizationTracker.tsx
    FrequencyTracker.tsx
  
  /clinical/
    MedicationSummaryCard.tsx
    ClinicalAlertCard.tsx
    WoundProgressionCard.tsx
    VitalSignsCard.tsx
  
  /documentation/
    DocumentationProgressCard.tsx
    SignatureStatusCard.tsx
    DocumentPreviewCard.tsx
  
  /qa/
    QAQueueItem.tsx
    QAReviewCard.tsx
    ReturnReasonSelector.tsx
  
  /visits/
    VisitStatusTimeline.tsx
    EVVStatusCard.tsx
    VisitSummaryCard.tsx
  
  /compliance/
    ComplianceChecklistCard.tsx
    CredentialStatusBadge.tsx
    ComplianceAlertCard.tsx
  
  /billing/
    ClaimStatusCard.tsx
    PaymentReconciliationCard.tsx
    AuthorizationCard.tsx
  
  /caregivers/
    CaregiverProfileCard.tsx
    CaregiverScheduleCard.tsx
    CaregiverComplianceCard.tsx
```

## Usage Guidelines

### DO ✅

- Use healthcare components across all relevant screens
- Maintain consistent data structures
- Keep components focused on single responsibility
- Support common interaction patterns
- Provide clear props interfaces
- Include loading/error states
- Support keyboard navigation
- Maintain HIPAA compliance
- Document component usage
- Version components properly

### DON'T ❌

- Create duplicate components for same concept
- Mix healthcare logic with UI logic
- Hardcode business rules
- Skip accessibility features
- Forget loading states
- Expose sensitive data inappropriately
- Create overly complex components
- Skip documentation
- Break existing interfaces
- Ignore performance

## Component Checklist

When creating a healthcare component:

- [ ] Defined clear interface
- [ ] Supports loading state
- [ ] Handles errors gracefully
- [ ] Keyboard accessible
- [ ] Screen reader friendly
- [ ] Follows design tokens
- [ ] Documented with examples
- [ ] Unit tested
- [ ] HIPAA compliant
- [ ] Performance optimized
- [ ] Reusable across 3+ screens
- [ ] Reviewed by team

---

**Version**: 1.0  
**Last Updated**: March 11, 2026
