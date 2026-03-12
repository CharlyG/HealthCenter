/**
 * Component Showcase
 * Interactive gallery of all design system components
 */

import React, { useState } from 'react';
import { 
  StatusBadge, 
  PriorityIndicator,
  AdmissionContextBar,
  AuthorizationTracker,
  FrequencyTracker,
  MedicationSummaryCard,
  ClinicalAlertCard,
  DocumentationProgressCard,
  SignatureStatusCard,
  QAQueueItem,
  EVVComplianceCard,
  CredentialStatusCard,
  OrderSummaryCard,
  VisitSummaryCard,
  RiskScoreCard,
  PayerAuthCard,
} from '../components/design-system';
import type {
  AdmissionContextData,
  AuthorizationData,
  FrequencyData,
  MedicationData,
  ClinicalAlert,
  DocumentationProgress,
  SignatureRequirement,
  QAQueueItemData,
  EVVData,
  CredentialData,
  OrderData,
  VisitData,
  RiskScore,
  PayerAuthData,
} from '../components/design-system';
import { ThemeToggle } from '../design-system/semantic/themeProvider';
import { textColor, surface, borderColor, space, typography } from '../design-system/semantic/tokens';
import { Search, Code, Eye } from 'lucide-react';

// Mock data for components
const mockAdmissionContext: AdmissionContextData = {
  patientName: 'John Doe',
  mrn: 'MRN-12345',
  admissionId: 'ADM-001',
  admissionDate: '2024-01-15',
  certificationPeriod: { start: '2024-01-15', end: '2024-03-15' },
  daysRemaining: 45,
  primaryDiscipline: 'SN',
  status: 'active',
};

const mockAuthData: AuthorizationData = {
  authNumber: 'AUTH-789',
  payer: 'Medicare',
  status: 'active',
  visitsAuthorized: 30,
  visitsUsed: 12,
  daysAuthorized: 60,
  daysUsed: 20,
  expirationDate: '2024-03-15',
  daysUntilExpiration: 45,
};

const mockFrequencies: FrequencyData[] = [
  {
    discipline: 'SN',
    ordered: '3x/week',
    scheduled: 12,
    completed: 10,
    missed: 1,
    compliancePercentage: 83,
    status: 'at-risk',
    nextVisitDue: '2024-01-20',
  },
  {
    discipline: 'PT',
    ordered: '2x/week',
    scheduled: 8,
    completed: 8,
    missed: 0,
    compliancePercentage: 100,
    status: 'compliant',
  },
];

const mockMedications: MedicationData[] = [
  {
    id: 'med-1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    route: 'PO',
    status: 'active',
    lastReviewDate: '2024-01-10',
    alerts: [
      {
        type: 'high-risk',
        message: 'Monitor blood pressure regularly',
        priority: 'high',
      },
    ],
  },
  {
    id: 'med-2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    route: 'PO',
    status: 'active',
  },
];

const mockAlert: ClinicalAlert = {
  id: 'alert-1',
  type: 'vital-sign',
  priority: 'critical',
  title: 'Blood Pressure Elevated',
  message: 'BP reading of 180/95 exceeds threshold. Immediate assessment required.',
  timestamp: new Date().toISOString(),
  actionRequired: 'Contact physician and reassess within 2 hours',
};

const mockDocProgress: DocumentationProgress = {
  totalRequired: 15,
  completed: 12,
  pending: 2,
  overdue: 1,
  dueToday: 2,
  completionPercentage: 80,
};

const mockSignatures: SignatureRequirement[] = [
  {
    id: 'sig-1',
    role: 'Physician',
    required: true,
    status: 'signed',
    signedBy: 'Dr. Smith',
    signedAt: '2024-01-18T10:30:00Z',
  },
  {
    id: 'sig-2',
    role: 'Clinical Manager',
    required: true,
    status: 'pending',
    dueDate: '2024-01-20',
  },
];

const mockQAItem: QAQueueItemData = {
  id: 'qa-1',
  documentType: 'OASIS-E Start of Care',
  patientName: 'Jane Smith',
  patientMrn: 'MRN-67890',
  submittedBy: 'Sarah Johnson, RN',
  submittedAt: '2024-01-18T09:00:00Z',
  assignedTo: 'QA Specialist',
  dueDate: '2024-01-19T17:00:00Z',
  priority: 'high',
  status: 'in-review',
  findings: 2,
  daysInQueue: 1,
};

const mockEVV: EVVData = {
  visitId: 'visit-1',
  patientName: 'John Doe',
  caregiver: 'Mary Johnson, RN',
  scheduledStart: '2024-01-18T09:00:00Z',
  scheduledEnd: '2024-01-18T10:00:00Z',
  actualStart: '2024-01-18T09:05:00Z',
  actualEnd: '2024-01-18T10:02:00Z',
  checkInLocation: {
    lat: 40.7128,
    lon: -74.0060,
    address: '123 Main St, New York, NY',
  },
  checkOutLocation: {
    lat: 40.7128,
    lon: -74.0060,
    address: '123 Main St, New York, NY',
  },
  complianceStatus: 'compliant',
};

const mockCredentials: CredentialData[] = [
  {
    type: 'RN License',
    number: 'RN-123456',
    issuedDate: '2020-01-01',
    expirationDate: '2025-01-01',
    status: 'active',
    daysUntilExpiration: 365,
  },
  {
    type: 'CPR Certification',
    issuedDate: '2023-06-01',
    expirationDate: '2024-02-15',
    status: 'expiring-soon',
    daysUntilExpiration: 28,
  },
];

const mockOrder: OrderData = {
  id: 'order-1',
  type: 'skilled-nursing',
  frequency: '3x/week',
  duration: '60 days',
  startDate: '2024-01-15',
  endDate: '2024-03-15',
  orderedBy: 'Dr. Smith',
  orderedDate: '2024-01-14',
  status: 'active',
  priority: 'high',
  notes: 'Focus on wound care and medication management',
};

const mockVisit: VisitData = {
  id: 'visit-1',
  patientName: 'John Doe',
  discipline: 'SN',
  caregiver: 'Mary Johnson',
  scheduledDate: '2024-01-20',
  scheduledStart: '2024-01-20T09:00:00Z',
  scheduledEnd: '2024-01-20T10:00:00Z',
  status: 'scheduled',
  location: '123 Main St, New York, NY',
  visitType: 'routine',
};

const mockRiskScores: RiskScore[] = [
  {
    category: 'fall-risk',
    score: 85,
    level: 'high',
    trend: 'increasing',
    lastAssessed: '2024-01-18',
    factors: ['History of falls', 'Use of walker', 'Vision impairment'],
  },
  {
    category: 'hospitalization',
    score: 45,
    level: 'moderate',
    trend: 'stable',
    lastAssessed: '2024-01-18',
  },
];

const mockPayerAuth: PayerAuthData = {
  id: 'auth-1',
  payer: 'Medicare Part A',
  authNumber: 'AUTH-2024-12345',
  status: 'active',
  startDate: '2024-01-15',
  endDate: '2024-03-15',
  visitsAuthorized: 30,
  visitsUsed: 12,
  daysRemaining: 45,
  serviceTypes: ['Skilled Nursing', 'Physical Therapy', 'Occupational Therapy'],
  restrictions: ['No weekend visits', 'Maximum 1 hour per visit'],
};

interface ComponentSection {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  code: string;
}

export default function ComponentShowcase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCode, setShowCode] = useState<string | null>(null);
  const [variant, setVariant] = useState<'default' | 'compact'>('default');
  
  const components: ComponentSection[] = [
    {
      id: 'status-badge',
      title: 'Status Badge',
      description: '13 status types with consistent styling',
      component: (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: space.sm }}>
          <StatusBadge status="active" />
          <StatusBadge status="pending" />
          <StatusBadge status="completed" />
          <StatusBadge status="cancelled" />
          <StatusBadge status="overdue" />
        </div>
      ),
      code: `<StatusBadge status="active" size="md" />`,
    },
    {
      id: 'priority-indicator',
      title: 'Priority Indicator',
      description: '4 priority levels, 2 variants',
      component: (
        <div style={{ display: 'flex', gap: space.md }}>
          <PriorityIndicator priority="critical" variant="badge" />
          <PriorityIndicator priority="high" variant="badge" />
          <PriorityIndicator priority="medium" variant="dot" />
          <PriorityIndicator priority="low" variant="dot" />
        </div>
      ),
      code: `<PriorityIndicator priority="critical" variant="badge" />`,
    },
    {
      id: 'admission-context',
      title: 'Admission Context Bar',
      description: 'Persistent admission context display',
      component: <AdmissionContextBar data={mockAdmissionContext} variant={variant} />,
      code: `<AdmissionContextBar data={admissionData} />`,
    },
    {
      id: 'auth-tracker',
      title: 'Authorization Tracker',
      description: 'Authorization usage and expiration tracking',
      component: <AuthorizationTracker authorization={mockAuthData} variant={variant} />,
      code: `<AuthorizationTracker authorization={authData} />`,
    },
    {
      id: 'frequency-tracker',
      title: 'Frequency Tracker',
      description: 'Visit frequency compliance monitoring',
      component: <FrequencyTracker frequencies={mockFrequencies} variant={variant} />,
      code: `<FrequencyTracker frequencies={frequencies} />`,
    },
    {
      id: 'medication-card',
      title: 'Medication Summary Card',
      description: 'Medication list with alerts and interactions',
      component: <MedicationSummaryCard medications={mockMedications} variant={variant} />,
      code: `<MedicationSummaryCard medications={medications} />`,
    },
    {
      id: 'clinical-alert',
      title: 'Clinical Alert Card',
      description: 'Priority-based clinical alerts',
      component: <ClinicalAlertCard alert={mockAlert} variant={variant} />,
      code: `<ClinicalAlertCard alert={alertData} />`,
    },
    {
      id: 'doc-progress',
      title: 'Documentation Progress Card',
      description: 'Documentation completion tracking',
      component: <DocumentationProgressCard progress={mockDocProgress} variant={variant} />,
      code: `<DocumentationProgressCard progress={progress} />`,
    },
    {
      id: 'signature-status',
      title: 'Signature Status Card',
      description: 'Signature requirements and status',
      component: <SignatureStatusCard documentType="Plan of Care" documentId="POC-001" requirements={mockSignatures} variant={variant} />,
      code: `<SignatureStatusCard requirements={signatures} />`,
    },
    {
      id: 'qa-queue',
      title: 'QA Queue Item',
      description: 'Standardized QA queue display',
      component: <QAQueueItem item={mockQAItem} variant={variant} />,
      code: `<QAQueueItem item={queueItem} />`,
    },
    {
      id: 'evv-compliance',
      title: 'EVV Compliance Card',
      description: 'Electronic visit verification tracking',
      component: <EVVComplianceCard data={mockEVV} variant={variant} />,
      code: `<EVVComplianceCard data={evvData} />`,
    },
    {
      id: 'credentials',
      title: 'Credential Status Card',
      description: 'Credential expiration monitoring',
      component: <CredentialStatusCard credentials={mockCredentials} caregiverName="Mary Johnson, RN" variant={variant} />,
      code: `<CredentialStatusCard credentials={credentials} />`,
    },
    {
      id: 'order-summary',
      title: 'Order Summary Card',
      description: 'Clinical order display',
      component: <OrderSummaryCard order={mockOrder} variant={variant} />,
      code: `<OrderSummaryCard order={orderData} />`,
    },
    {
      id: 'visit-summary',
      title: 'Visit Summary Card',
      description: 'Visit information card',
      component: <VisitSummaryCard visit={mockVisit} variant={variant} />,
      code: `<VisitSummaryCard visit={visitData} />`,
    },
    {
      id: 'risk-score',
      title: 'Risk Score Card',
      description: 'Patient risk assessment scores',
      component: <RiskScoreCard scores={mockRiskScores} patientName="John Doe" variant={variant} />,
      code: `<RiskScoreCard scores={riskScores} />`,
    },
    {
      id: 'payer-auth',
      title: 'Payer Authorization Card',
      description: 'Insurance authorization tracking',
      component: <PayerAuthCard authorization={mockPayerAuth} variant={variant} />,
      code: `<PayerAuthCard authorization={authData} />`,
    },
  ];
  
  const filteredComponents = components.filter(comp =>
    comp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: surface.default,
      padding: space.xl
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: space.xl }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md }}>
          <div>
            <h1 style={{ 
              fontSize: typography.pageTitle.size, 
              fontWeight: typography.pageTitle.weight,
              color: textColor.primary,
              margin: 0,
              marginBottom: space.xs
            }}>
              Component Showcase
            </h1>
            <p style={{ 
              fontSize: typography.body.size, 
              color: textColor.secondary,
              margin: 0
            }}>
              Interactive gallery of {components.length} healthcare design system components
            </p>
          </div>
          
          <ThemeToggle />
        </div>
        
        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          gap: space.md,
          padding: space.md,
          backgroundColor: surface.elevated,
          borderRadius: '0.5rem',
          border: `1px solid ${borderColor.default}`
        }}>
          {/* Search */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: space.sm, top: '50%', transform: 'translateY(-50%)', color: textColor.muted }} />
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: `${space.sm} ${space.sm} ${space.sm} 40px`,
                fontSize: typography.body.size,
                border: `1px solid ${borderColor.default}`,
                borderRadius: '0.375rem',
                backgroundColor: surface.default,
                color: textColor.primary,
              }}
            />
          </div>
          
          {/* Variant Toggle */}
          <div style={{ display: 'flex', gap: space.sm, backgroundColor: surface.subtle, borderRadius: '0.375rem', padding: '4px' }}>
            <button
              onClick={() => setVariant('default')}
              style={{
                padding: `${space.xs} ${space.md}`,
                fontSize: typography.body.size,
                fontWeight: 500,
                border: 'none',
                borderRadius: '0.25rem',
                backgroundColor: variant === 'default' ? surface.elevated : 'transparent',
                color: textColor.primary,
                cursor: 'pointer',
              }}
            >
              Default
            </button>
            <button
              onClick={() => setVariant('compact')}
              style={{
                padding: `${space.xs} ${space.md}`,
                fontSize: typography.body.size,
                fontWeight: 500,
                border: 'none',
                borderRadius: '0.25rem',
                backgroundColor: variant === 'compact' ? surface.elevated : 'transparent',
                color: textColor.primary,
                cursor: 'pointer',
              }}
            >
              Compact
            </button>
          </div>
        </div>
      </div>
      
      {/* Component Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: space.lg }}>
          {filteredComponents.map((comp) => (
            <div
              key={comp.id}
              style={{
                backgroundColor: surface.elevated,
                border: `1px solid ${borderColor.default}`,
                borderRadius: '0.5rem',
                padding: space.md,
              }}
            >
              {/* Component Header */}
              <div style={{ marginBottom: space.md, paddingBottom: space.md, borderBottom: `1px solid ${borderColor.subtle}` }}>
                <h3 style={{ 
                  fontSize: typography.cardTitle.size, 
                  fontWeight: typography.cardTitle.weight,
                  color: textColor.primary,
                  margin: 0,
                  marginBottom: space.xs
                }}>
                  {comp.title}
                </h3>
                <p style={{ 
                  fontSize: typography.body.size, 
                  color: textColor.secondary,
                  margin: 0
                }}>
                  {comp.description}
                </p>
              </div>
              
              {/* Component Preview */}
              <div style={{ marginBottom: space.md }}>
                {comp.component}
              </div>
              
              {/* Code Toggle */}
              <button
                onClick={() => setShowCode(showCode === comp.id ? null : comp.id)}
                style={{
                  width: '100%',
                  padding: space.sm,
                  fontSize: typography.body.size,
                  fontWeight: 500,
                  border: `1px solid ${borderColor.default}`,
                  borderRadius: '0.375rem',
                  backgroundColor: surface.subtle,
                  color: textColor.primary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: space.sm,
                }}
              >
                {showCode === comp.id ? <Eye size={16} /> : <Code size={16} />}
                {showCode === comp.id ? 'Hide Code' : 'Show Code'}
              </button>
              
              {/* Code Block */}
              {showCode === comp.id && (
                <pre style={{
                  marginTop: space.md,
                  padding: space.md,
                  backgroundColor: surface.default,
                  border: `1px solid ${borderColor.default}`,
                  borderRadius: '0.375rem',
                  fontSize: '13px',
                  color: textColor.primary,
                  overflowX: 'auto',
                }}>
                  <code>{comp.code}</code>
                </pre>
              )}
            </div>
          ))}
        </div>
        
        {filteredComponents.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: space.xxl,
            color: textColor.muted 
          }}>
            No components found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
