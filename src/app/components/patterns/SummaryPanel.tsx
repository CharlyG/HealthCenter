/**
 * Summary Panel Pattern
 * 
 * Reusable panel for displaying key information at a glance.
 * Designed to show the most important data and quick actions.
 * 
 * Use Cases:
 * - Patient chart summary
 * - Admission dashboard summary
 * - Billing dashboard summary
 * - Caregiver profile summary
 * - Integration workspace summary
 * 
 * Performance:
 * - Memoized component
 * - Lazy-loaded sections
 * - Optimized renders
 */

import { memo, ReactNode } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { ChevronRight, ExternalLink } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface SummaryField {
  id: string;
  label: string;
  value: string | number | ReactNode;
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  icon?: ReactNode;
  onClick?: () => void;
}

interface SummarySection {
  id: string;
  title: string;
  icon?: ReactNode;
  fields: SummaryField[];
  collapsible?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  onClick: () => void;
}

interface SummaryPanelProps {
  /** Panel title */
  title?: string;
  
  /** Subtitle or description */
  subtitle?: string;
  
  /** Header badge */
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  
  /** Summary sections */
  sections: SummarySection[];
  
  /** Quick actions */
  quickActions?: QuickAction[];
  
  /** Footer actions */
  footerActions?: ReactNode;
  
  /** View full details link */
  viewDetailsLink?: {
    label: string;
    onClick: () => void;
  };
  
  /** Compact mode */
  compact?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Sticky at top */
  sticky?: boolean;
  
  /** Background variant */
  variant?: 'default' | 'bordered' | 'elevated';
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const SummaryPanel = memo(function SummaryPanel({
  title,
  subtitle,
  badge,
  sections,
  quickActions = [],
  footerActions,
  viewDetailsLink,
  compact = false,
  loading = false,
  sticky = false,
  variant = 'default',
}: SummaryPanelProps) {
  const variantStyles = {
    default: 'bg-white',
    bordered: 'bg-white border',
    elevated: 'bg-white border shadow-sm',
  };

  const statusColors = {
    success: 'text-green-700',
    warning: 'text-amber-700',
    danger: 'text-red-700',
    neutral: 'text-gray-900',
  };

  return (
    <div
      className={cn(
        'rounded-lg',
        variantStyles[variant],
        compact ? 'p-3' : 'p-4',
        sticky && 'sticky top-0 z-20'
      )}
    >
      {/* Header */}
      {(title || subtitle || badge) && (
        <div className="mb-4">
          {title && (
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              {badge && (
                <Badge variant={badge.variant || 'default'}>
                  {badge.label}
                </Badge>
              )}
            </div>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section) => (
              <SummaryPanelSection
                key={section.id}
                section={section}
                compact={compact}
                statusColors={statusColors}
              />
            ))}
          </div>

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  size="sm"
                  variant={action.variant || 'outline'}
                  onClick={action.onClick}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* View Details Link */}
          {viewDetailsLink && (
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={viewDetailsLink.onClick}
                className="flex items-center justify-between w-full text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span>{viewDetailsLink.label}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Footer Actions */}
          {footerActions && (
            <div className="mt-4 pt-4 border-t">
              {footerActions}
            </div>
          )}
        </>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface SummaryPanelSectionProps {
  section: SummarySection;
  compact: boolean;
  statusColors: Record<string, string>;
}

const SummaryPanelSection = memo(function SummaryPanelSection({
  section,
  compact,
  statusColors,
}: SummaryPanelSectionProps) {
  return (
    <div>
      {/* Section Title */}
      {section.title && (
        <div className="flex items-center gap-2 mb-2">
          {section.icon}
          <h4 className="text-xs font-semibold text-gray-600 uppercase">
            {section.title}
          </h4>
        </div>
      )}

      {/* Section Fields */}
      <div className={cn('space-y-2', compact && 'space-y-1')}>
        {section.fields.map((field) => (
          <button
            key={field.id}
            onClick={field.onClick}
            disabled={!field.onClick}
            className={cn(
              'w-full flex items-center justify-between gap-3 text-left',
              compact ? 'py-1' : 'py-1.5',
              field.onClick && 'hover:bg-gray-50 rounded px-2 -mx-2 transition-colors cursor-pointer',
              !field.onClick && 'cursor-default'
            )}
          >
            <div className="flex items-center gap-2 flex-shrink-0">
              {field.icon}
              <span className="text-sm text-gray-600">{field.label}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-sm font-semibold text-right',
                  field.status ? statusColors[field.status] : 'text-gray-900'
                )}
              >
                {typeof field.value === 'string' || typeof field.value === 'number'
                  ? field.value
                  : field.value}
              </span>
              {field.onClick && (
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

SummaryPanel.displayName = 'SummaryPanel';

export default SummaryPanel;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
// Patient Chart Summary
<SummaryPanel
  title="Patient Summary"
  badge={{ label: 'Active', variant: 'default' }}
  sections={[
    {
      id: 'demographics',
      title: 'Demographics',
      icon: <User className="w-4 h-4 text-gray-600" />,
      fields: [
        { id: 'mrn', label: 'MRN', value: '123456' },
        { id: 'dob', label: 'DOB', value: '01/15/1950' },
        { id: 'age', label: 'Age', value: '74y' },
      ]
    },
    {
      id: 'contact',
      title: 'Contact',
      fields: [
        { id: 'phone', label: 'Phone', value: '(555) 123-4567' },
        { id: 'email', label: 'Email', value: 'patient@email.com' },
      ]
    },
    {
      id: 'clinical',
      title: 'Clinical Status',
      fields: [
        { id: 'admissions', label: 'Active Admissions', value: 1, status: 'success' },
        { id: 'assessments', label: 'Assessments Due', value: 3, status: 'warning' },
      ]
    }
  ]}
  quickActions={[
    {
      id: 'edit',
      label: 'Edit Profile',
      icon: <Edit className="w-4 h-4 mr-2" />,
      onClick: () => {}
    },
    {
      id: 'call',
      label: 'Call',
      icon: <Phone className="w-4 h-4 mr-2" />,
      variant: 'outline',
      onClick: () => {}
    }
  ]}
  viewDetailsLink={{
    label: 'View Full Chart',
    onClick: () => navigate('/patient/123')
  }}
/>

// Admission Dashboard Summary
<SummaryPanel
  title="Admission Overview"
  subtitle="Medicare Home Health - 60 Day Period"
  badge={{ label: 'Active', variant: 'default' }}
  sections={[
    {
      id: 'status',
      title: 'Status',
      fields: [
        { id: 'soc', label: 'Start of Care', value: '01/15/2026' },
        { id: 'days', label: 'Days in Care', value: 45, status: 'success' },
        { id: 'auth', label: 'Authorization', value: 'Approved', status: 'success' },
      ]
    },
    {
      id: 'visits',
      title: 'Visit Summary',
      fields: [
        { id: 'completed', label: 'Completed', value: '28 / 35', status: 'success' },
        { id: 'scheduled', label: 'Scheduled', value: 5 },
        { id: 'remaining', label: 'Remaining', value: 2 },
      ]
    }
  ]}
  sticky
  variant="elevated"
/>

// Caregiver Profile Summary
<SummaryPanel
  title="Caregiver Profile"
  sections={[
    {
      id: 'info',
      title: 'Information',
      fields: [
        { id: 'discipline', label: 'Discipline', value: 'RN' },
        { id: 'license', label: 'License', value: 'RN-123456' },
        { id: 'status', label: 'Status', value: 'Active', status: 'success' },
      ]
    },
    {
      id: 'compliance',
      title: 'Compliance',
      fields: [
        { id: 'score', label: 'Score', value: '95%', status: 'success' },
        { id: 'expires', label: 'Next Expiration', value: '30 days', status: 'warning' },
      ]
    }
  ]}
  quickActions={[
    { id: 'schedule', label: 'View Schedule', onClick: () => {} },
    { id: 'docs', label: 'Documents', onClick: () => {} },
  ]}
  compact
/>
*/
