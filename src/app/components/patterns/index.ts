/**
 * Pattern Components
 * 
 * Central export file for reusable UI patterns.
 * These patterns provide consistent experience across modules.
 */

export { default as DetailDrawer } from './DetailDrawer';

export {
  FilterBar,
  FilterSelect,
  FilterDateRange,
  FilterCheckboxGroup,
} from './FilterBar';

export type {
  QuickFilter,
  SavedView,
} from './FilterBar';

export {
  MetricCard,
  QueueCard,
  SummaryCard,
  AlertCard,
  InsightCard,
} from './DashboardCards';

export { default as SummaryPanel } from './SummaryPanel';

export { default as StickyActionFooter } from './StickyActionFooter';

export {
  ValidationPanel,
} from './ValidationPanel';

export type {
  ValidationSeverity,
  ValidationMessage,
} from './ValidationPanel';

export {
  Timeline,
} from './Timeline';

export type {
  TimelineEventType,
  TimelineEvent,
} from './Timeline';

export {
  StatusBadge,
  StatusBadgeGroup,
  StatusIndicator,
} from './StatusBadge';

export type {
  StatusType,
} from './StatusBadge';

export {
  EmptyState,
  NoDataEmptyState,
  NoSearchResultsEmptyState,
  NoFilterMatchesEmptyState,
  NotConfiguredEmptyState,
} from './EmptyState';

export type {
  EmptyStateType,
} from './EmptyState';

// ═══════════════════════════════════════════════════════════════════════════
// NEW UX INTERACTION PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Confirm Dialog
 * Reusable confirmation dialogs for high-impact actions
 */
export {
  ConfirmDialog,
  useConfirmDialog,
} from './ConfirmDialog';

export type {
  ConfirmDialogProps,
  ConfirmDialogVariant,
} from './ConfirmDialog';

/**
 * Autosave Indicator
 * Subtle feedback for autosave status
 */
export {
  AutosaveIndicator,
} from './AutosaveIndicator';

export type {
  AutosaveIndicatorProps,
  AutosaveStatus,
} from './AutosaveIndicator';

/**
 * Form Mode Pattern
 * Create/Edit/View mode management
 */
export {
  FormModeWrapper,
  FormModeHeader,
  FormModeActions,
  useFormMode,
} from './FormMode';

export type {
  FormMode,
  FormModeConfig,
  FormModeHeaderProps,
  FormModeActionsProps,
  FormModeWrapperProps,
  UseFormModeOptions,
} from './FormMode';

/**
 * Status Transition
 * Workflow status transitions with validation
 */
export {
  StatusTransition,
  StatusTimeline,
} from './StatusTransition';

export type {
  StatusTransitionRule,
  StatusHistory,
  StatusTransitionProps,
  StatusTimelineProps,
} from './StatusTransition';

/**
 * Unsaved Changes Dialog
 * Protection against accidental data loss
 */
export {
  UnsavedChangesDialog,
} from './UnsavedChangesDialog';

export type {
  UnsavedChangesDialogProps,
} from './UnsavedChangesDialog';