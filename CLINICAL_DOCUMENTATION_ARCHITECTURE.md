# Clinical Documentation Architecture

## Overview

Comprehensive clinical documentation system supporting home health and hospice agencies. All documentation is associated with a patient admission and follows regulatory compliance requirements.

## Documentation Categories

### 1. Visit Documentation
Documentation created during patient visits by clinicians in the field.

**Types:**
- Skilled Nursing Visits
- Physical Therapy Visits
- Occupational Therapy Visits
- Speech Therapy Visits
- Medical Social Work Visits
- Home Health Aide Visits
- Aide Supervisory Visits

**Key Features:**
- Mobile-optimized for field use
- Offline capability for areas with poor connectivity
- Real-time auto-save
- Smart phrases and templates
- Copy from previous visit functionality

### 2. Assessment Documentation
Structured clinical assessments required for regulatory compliance and clinical decision-making.

**Types:**
- **OASIS-E** (Outcome and Assessment Information Set)
  - Start of Care (SOC)
  - Resumption of Care (ROC)
  - Follow-Up (FU)
  - Discharge (DC)
- **HOPE** (Hospice Outcomes & Patient Evaluation)
  - Admission
  - Discharge
- **Comprehensive Assessments**
  - Functional Assessment
  - Fall Risk Assessment
  - Medication Reconciliation

**Key Features:**
- Structured data collection
- Built-in validation rules
- Regulatory scoring algorithms
- Historical comparison
- Export capabilities

### 3. Episode Documentation
Documents related to the entire episode of care or certification period.

**Types:**
- Plan of Care (POC)
- Physician Orders
- Recertification Documents
- Discharge Summaries
- Physician Face-to-Face Encounters
- Verbal Orders
- Authorization Requests
- Progress Summaries

**Key Features:**
- Multi-disciplinary coordination
- Physician signature workflow
- Version control
- Recertification tracking
- Medicare/Medicaid compliance

## Core Components

### DocumentHeader
Displays comprehensive document information at the top of every clinical document.

**Information Shown:**
- Patient name and demographics
- Admission start date and type
- Document type and category
- Document status (in_progress, pending_review, signed, etc.)
- Signature status (unsigned, signed, pending_cosign, etc.)
- Clinician information (name, role, credentials)
- Document date (clinical date)
- Created/updated timestamps
- Validation status (errors and warnings count)
- Completion percentage
- Lock status (if applicable)

**File:** `/src/app/components/documentation/DocumentHeader.tsx`

### Section Navigator
Provides quick navigation between document sections with visual progress indicators.

**Features:**
- Shows all document sections
- Visual completion status per section
- Required field tracking
- Error highlighting
- Click to jump to section
- Three variants:
  - **Full Sidebar** - Detailed view with progress bars (desktop)
  - **Compact Horizontal** - Condensed button-style (tablet)
  - **Dots Navigator** - Minimal indicator (mobile)

**File:** `/src/app/components/documentation/DocumentSectionNavigator.tsx`

### Progress Tracker
Visual indicator showing overall document completion.

**Features:**
- Percentage-based progress bar
- Section-by-section breakdown
- Required vs. total field tracking
- Real-time updates as fields are filled
- Color-coded status (incomplete, complete, errors)

**Integrated in:** `ClinicalDocumentationLayout` and `DocumentHeader`

### Validation Panel
Displays all validation errors, warnings, and missing required fields.

**Features:**
- **Errors** - Must be resolved before submission
  - Required field violations
  - Data format errors
  - Business rule violations
- **Warnings** - Can be overridden with justification
  - Data quality concerns
  - Best practice recommendations
- **Missing Required Fields** - Quick list of incomplete required fields
- Click-to-navigate - Jump directly to problematic fields
- Grouped by section for easy scanning
- Real-time validation as user types

**File:** `/src/app/components/documentation/ValidationPanel.tsx`

### Clinical Documentation Layout
Master layout component that integrates all documentation features.

**Layout Structure:**
```
┌─────────────────────────────────────────────────────┐
│ Document Header                                     │
│ (Patient info, status, clinician, signatures)      │
├─────────────────────────────────────────────────────┤
│ Progress Bar (Overall completion %)                 │
├────────┬────────────────────────────┬───────────────┤
│Section │ Current Section Content    │Validation     │
│Nav     │                            │Panel          │
│        │ - Section title            │               │
│- Sec 1 │ - Field inputs             │- Errors: 2    │
│- Sec 2 │ - Smart phrases            │- Warnings: 1  │
│✓ Sec 3 │ - Previous patterns        │- Required: 5  │
│- Sec 4 │                            │               │
│        │ [Previous] [Next]          │               │
│        │                            │               │
│        │ [Save] [Submit] [Sign]     │               │
└────────┴────────────────────────────┴───────────────┘
```

**File:** `/src/app/components/documentation/ClinicalDocumentationLayout.tsx`

## Data Architecture

### Core Types

**ClinicalDocument** - Main document structure
```typescript
{
  id: string;
  documentType: DocumentType;
  documentCategory: 'visit' | 'assessment' | 'episode';
  
  // Patient context
  patientId: string;
  patientName: string;
  admissionId: string;
  admissionStartDate: string;
  
  // Status
  status: DocumentStatus;
  signatureStatus: SignatureStatus;
  
  // Content
  values: FormValues;
  completionPercentage: number;
  sectionProgress: Record<string, SectionProgressData>;
  
  // Validation
  validationErrors: ValidationError[];
  validationWarnings: ValidationWarning[];
  isValid: boolean;
  
  // Signatures
  signedBy?: string;
  cosignRequired: boolean;
  cosignedBy?: string;
}
```

**DocumentTemplate** - Defines document structure
```typescript
{
  id: string;
  name: string;
  category: DocumentCategory;
  documentType: DocumentType;
  sections: FormSectionDef[];
  requiresCosignature?: boolean;
  estimatedTimeMinutes?: number;
}
```

**FormSectionDef** - Section definition
```typescript
{
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: FormFieldDef[];
  order: number;
}
```

**ValidationResult** - Validation state
```typescript
{
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  completionPercentage: number;
  missingRequiredFields: Array<{
    sectionId: string;
    fieldId: string;
    fieldLabel: string;
  }>;
}
```

**File:** `/src/app/lib/documentationTypes.ts`

## Document Statuses

### Document Status Flow
```
in_progress → pending_review → ready_to_sign → signed → [pending_cosign] → cosigned
                                                  ↓
                                               rejected
```

**Status Definitions:**
- `in_progress` - Draft being actively worked on
- `pending_review` - Completed and awaiting review
- `ready_to_sign` - Validation passed, ready for signature
- `signed` - Signed by clinician
- `pending_cosign` - Awaiting co-signature (if required)
- `cosigned` - Co-signed and complete
- `rejected` - Rejected during review, needs revision
- `locked` - Finalized and locked from editing

### Signature Status
- `unsigned` - No signature yet
- `signed` - Signed by primary clinician
- `pending_cosign` - Waiting for co-signer
- `cosigned` - Co-signature complete
- `electronic_signature` - E-signature captured
- `wet_signature` - Physical signature on paper

## Validation System

### Validation Rules

**Field-Level Validation:**
- Required field checks
- Data type validation (number ranges, date formats)
- Pattern matching (regex)
- Custom business rules

**Section-Level Validation:**
- All required fields in section completed
- Conditional requirements based on other fields
- Cross-field dependencies

**Document-Level Validation:**
- All sections meet requirements
- Regulatory compliance checks
- Clinical logic validation
- Data quality thresholds

### Validation Timing

**Real-Time:**
- As user types
- When field loses focus
- On section navigation

**Pre-Submit:**
- Full validation before submission
- Comprehensive report of all issues
- Must resolve all errors (warnings can be overridden)

**Server-Side:**
- Final validation on submission
- Additional compliance checks
- Integration with regulatory systems

## Templates

### Template Structure

Templates define the structure and fields for each document type. Located in `/src/app/lib/documentationTemplates.ts`.

**Example - Skilled Nursing Visit:**
```typescript
{
  id: 'skilled_nursing_visit',
  name: 'Skilled Nursing Visit Note',
  category: 'visit',
  sections: [
    {
      id: 'visit_details',
      title: 'Visit Details',
      fields: [
        { id: 'visit_date', label: 'Visit Date', type: 'date', required: true },
        { id: 'visit_time_in', label: 'Time In', type: 'time', required: true },
        // ... more fields
      ]
    },
    // ... more sections
  ]
}
```

### Template Categories

**Visit Templates:**
- Skilled Nursing Visit
- PT/OT/ST Visit Notes
- Social Work Visits
- Aide Supervisory Visits

**Assessment Templates:**
- OASIS-E Forms (SOC, ROC, FU, DC)
- HOPE Forms (Admission, Discharge)
- Functional Assessments
- Risk Assessments

**Episode Templates:**
- Plan of Care
- Physician Orders
- Recertification Documents
- Discharge Summaries

## Features

### Auto-Save
- Configurable interval (default: 30 seconds)
- Saves draft automatically in background
- Visual indicator of save status
- Last saved timestamp displayed

### Smart Phrases
- Pre-defined clinical phrases
- Personal phrase library
- Quick insertion via keyboard shortcuts
- Category-based organization
- Usage tracking and suggestions

### Previous Patterns
- Copy from previous documentation
- Pattern recognition across visits
- Suggest recent values for fields
- Historical data reference

### Offline Mode
- Works without internet connection
- Local storage of drafts
- Sync when connection restored
- Conflict resolution on sync

### Mobile Optimization
- Responsive design for tablets and phones
- Touch-optimized inputs
- Collapsible navigation
- Optimized field layouts
- Signature capture

## Signature Workflows

### Single Signature
1. Clinician completes document
2. Validation passes
3. Clinician signs electronically
4. Document status → `signed`
5. Document locked

### Co-Signature Required
1. Clinician completes and submits
2. Document status → `pending_cosign`
3. Notification sent to supervisor
4. Supervisor reviews and co-signs
5. Document status → `cosigned`
6. Document locked

### Rejection Flow
1. Supervisor reviews document
2. Identifies issues
3. Rejects with comments
4. Document status → `rejected`
5. Notification sent to clinician
6. Clinician makes corrections
7. Resubmits for review

## Integration Points

### Patient Chart
Documents appear in Patient Chart sections:
- Visit History
- Assessments
- Care Plans
- Orders

### Care Team Collaboration
- Real-time notifications
- Document sharing
- Comments and annotations
- Task assignments

### Billing Integration
- Visit documentation triggers billing
- Diagnosis codes captured
- Service codes documented
- Time tracking for billing

### Regulatory Reporting
- OASIS submission to CMS
- HOPE data export
- State reporting requirements
- Quality measure extraction

## Performance Considerations

### Component Optimization
- Memoized components to prevent unnecessary re-renders
- Lazy loading of sections
- Virtualized lists for long sections
- Debounced validation

### Data Loading
- Progressive loading of templates
- Cached smart phrases
- Optimistic UI updates
- Background sync

### Server-Side Operations
- Pagination for document lists
- Filtered queries for performance
- Indexed fields for fast search
- Compressed payloads

## Security & Compliance

### HIPAA Compliance
- Encrypted data transmission
- Audit trail for all actions
- User authentication required
- Session timeout
- Role-based access control

### Audit Trail
Every action is logged:
- Document created
- Draft saved
- Fields modified
- Submitted for review
- Signed/co-signed
- Rejected
- Viewed/accessed

### Access Control
- Only assigned clinician can edit
- Supervisors can review
- QA team can audit
- Billing can view completed
- Locked documents read-only

## Usage Example

```typescript
import { ClinicalDocumentationLayout } from './components/documentation/ClinicalDocumentationLayout';
import { SKILLED_NURSING_TEMPLATE } from './lib/documentationTemplates';

function VisitDocumentationPage() {
  const document: ClinicalDocument = {
    id: 'doc-123',
    documentType: 'skilled_nursing_visit',
    documentCategory: 'visit',
    patientId: 'pat-456',
    patientName: 'John Doe',
    admissionId: 'adm-789',
    admissionStartDate: '2026-03-01',
    // ... other required fields
  };

  const handleSave = async (values: FormValues) => {
    await saveDocumentDraft(document.id, values);
  };

  const handleSubmit = async (values: FormValues) => {
    await submitDocument(document.id, values);
  };

  const renderSection = (sectionId: string, values: FormValues, onChange) => {
    // Render section fields based on template
    return <SectionFieldRenderer sectionId={sectionId} values={values} onChange={onChange} />;
  };

  return (
    <ClinicalDocumentationLayout
      document={document}
      template={SKILLED_NURSING_TEMPLATE}
      onSave={handleSave}
      onSubmit={handleSubmit}
      renderSectionContent={renderSection}
    />
  );
}
```

## Next Steps

### Planned Enhancements
- [ ] Voice-to-text dictation
- [ ] AI-assisted documentation suggestions
- [ ] Photo/image attachments
- [ ] Digital wound measurement tools
- [ ] Medication barcode scanning
- [ ] Electronic signature capture for caregivers
- [ ] Multi-language support
- [ ] Accessibility improvements (WCAG 2.1 AAA)

### Template Expansion
- [ ] Additional therapy visit templates
- [ ] Hospice-specific assessments
- [ ] Pediatric documentation
- [ ] Maternal/child health forms
- [ ] DME order templates

### Integration Roadmap
- [ ] HL7/FHIR integration
- [ ] EHR system connectors
- [ ] Lab result imports
- [ ] Pharmacy integration
- [ ] Telehealth session notes

## Support

For implementation guidance, refer to:
- `HEALTHCARE_SYSTEM_GUIDE.md` - System overview
- `CLINICAL_MODULE_COMPLETE.md` - Clinical module details
- Type definitions in `/src/app/lib/documentationTypes.ts`
- Component examples in `/src/app/components/documentation/`
