/**
 * Healthcare Design System Exports
 * Central export for all design system components
 */

// ===== Layout =====
export { PageLayout, PageHeader, PageSection } from './PageLayout';
export { SplitViewLayout } from './SplitViewLayout';
export {
  WorkspaceLayout,
  WorkspaceHeader,
  WorkspaceFilters,
  WorkspaceSection,
} from './WorkspaceLayout';
export { RightDrawer, ControlledRightDrawer } from './RightDrawer';
export type { RightDrawerProps, ControlledRightDrawerProps } from './RightDrawer';
export { StickyActionFooter } from './StickyActionFooter';
export type { StickyActionFooterProps } from './StickyActionFooter';

// ===== Productivity =====
export { CommandPalette } from './CommandPalette';
export { GlobalSearch } from './GlobalSearch';

// ===== Forms =====
export { FormSection, FormFieldGroup, StickyFormActions } from './FormSection';
export { AsyncSearchSelect } from './AsyncSearchSelect';
export type { AsyncSearchSelectOption, AsyncSearchSelectProps } from './AsyncSearchSelect';

// ===== Data Display =====
export { DataTable } from './DataTable';
export type { Column, DataTableProps } from './DataTable';
export { CompactTable } from './CompactTable';
export type { CompactColumn, CompactTableProps } from './CompactTable';
export { Timeline } from './Timeline';
export type { TimelineEvent, TimelineProps } from './Timeline';
export { ActivityFeed } from './ActivityFeed';
export type { ActivityItem, ActivityFeedProps } from './ActivityFeed';

// ===== Cards =====
export { QueueCard } from './QueueCard';
export type { QueuePriority, QueueStatus } from './QueueCard';
export { MetricCard } from './MetricCard';
export type { MetricTrend } from './MetricCard';

// ===== Status & Badges =====
export { StatusBadge } from './StatusBadge';
export type { StatusType } from './StatusBadge';
export { PriorityIndicator } from './PriorityIndicator';
export type { PriorityLevel } from './PriorityIndicator';

// ===== Context =====
export { PatientContextHeader } from './PatientContextHeader';
export type { PatientContextData, PatientAdmission } from './PatientContextHeader';

// ===== Empty States =====
export { EmptyState } from './EmptyState';
export { LoadingState } from './LoadingState';
export { ErrorState } from './ErrorState';

// ===== Healthcare-Specific Components =====
export { AdmissionContextBar } from './healthcare/AdmissionContextBar';
export type { AdmissionContextData } from './healthcare/AdmissionContextBar';

export { AuthorizationTracker } from './healthcare/AuthorizationTracker';
export type { AuthorizationData } from './healthcare/AuthorizationTracker';

export { FrequencyTracker } from './healthcare/FrequencyTracker';
export type { FrequencyData } from './healthcare/FrequencyTracker';

export { MedicationSummaryCard } from './healthcare/MedicationSummaryCard';
export type { MedicationData } from './healthcare/MedicationSummaryCard';

export { ClinicalAlertCard } from './healthcare/ClinicalAlertCard';
export type { ClinicalAlert } from './healthcare/ClinicalAlertCard';

export { DocumentationProgressCard } from './healthcare/DocumentationProgressCard';
export type { DocumentationProgress } from './healthcare/DocumentationProgressCard';

export { SignatureStatusCard } from './healthcare/SignatureStatusCard';
export type { SignatureRequirement } from './healthcare/SignatureStatusCard';

export { QAQueueItem } from './healthcare/QAQueueItem';
export type { QAQueueItemData } from './healthcare/QAQueueItem';

export { EVVComplianceCard } from './healthcare/EVVComplianceCard';
export type { EVVData } from './healthcare/EVVComplianceCard';

export { CredentialStatusCard } from './healthcare/CredentialStatusCard';
export type { CredentialData } from './healthcare/CredentialStatusCard';

export { OrderSummaryCard } from './healthcare/OrderSummaryCard';
export type { OrderData } from './healthcare/OrderSummaryCard';

export { VisitSummaryCard } from './healthcare/VisitSummaryCard';
export type { VisitData } from './healthcare/VisitSummaryCard';

export { RiskScoreCard } from './healthcare/RiskScoreCard';
export type { RiskScore } from './healthcare/RiskScoreCard';

export { PayerAuthCard } from './healthcare/PayerAuthCard';
export type { PayerAuthData } from './healthcare/PayerAuthCard';

export { AdmissionSummaryPanel } from './healthcare/AdmissionSummaryPanel';
export type { AdmissionSummaryData } from './healthcare/AdmissionSummaryPanel';