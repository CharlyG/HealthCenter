Implement a Clinical Assessment Engine for the Home Health Platform.

The system must support creation and completion of discipline-specific clinical assessments.

Assessment Types to create:

Physical Therapy Evaluation
Occupational Therapy Evaluation
Speech Therapy Evaluation
Skilled Nursing Assessment
OASIS-E Assessment
HOPE Assessment
Recertification Assessment
Discharge Summary

--------------------------------

Create a reusable Assessment Engine component.

Structure:

AssessmentHeader
- Patient
- Admission
- Assessment Type
- Clinician
- Date

AssessmentNavigation
- section list
- completion progress

AssessmentSections

Each section contains multiple questions.

--------------------------------

Assessment Question Types

Text Input
Numeric Input
Dropdown
Checkbox
Radio Buttons
Multi Select
Pain Scale
Functional Score
Date Field

--------------------------------

Assessment Example

Physical Therapy Evaluation

Sections:

Patient History
- reason for referral
- prior functional level
- living situation

Pain Assessment
- pain scale 0-10
- pain location
- pain triggers

Mobility Assessment
- gait
- transfers
- balance

Strength Assessment
- lower extremity strength
- upper extremity strength

Functional Limitations
- ADL limitations
- mobility restrictions

Plan of Care
- therapy goals
- recommended frequency
- expected duration

--------------------------------

Speech Therapy Evaluation

Sections:

Communication
- expressive language
- receptive language

Cognition
- memory
- attention

Swallowing
- swallowing difficulty
- aspiration risk

Plan of Care
- therapy goals
- frequency

--------------------------------

Assessment UX

Left side navigation showing sections.

Right side content panel showing questions.

Progress indicator:

Completed
In Progress
Not Started

--------------------------------

Autosave support

Draft mode
Submit mode
QA review mode

--------------------------------

Validation

Required questions must be completed before submission.

--------------------------------

Submission Workflow

Assessment Completed
→ Submit for Signature
→ QA Review
→ Approved

--------------------------------

Mobile optimized version for clinicians.