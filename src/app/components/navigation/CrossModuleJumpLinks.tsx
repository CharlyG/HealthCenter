/**
 * Cross-Module Jump Links
 * 
 * Reduces multi-step navigation by providing contextual links to related workflows.
 * Examples:
 * - From visit → open patient chart
 * - From medication alert → open medication profile
 * - From billing issue → open admission dashboard
 * - From QA item → open clinical document
 */

import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  ExternalLink,
  User,
  FileText,
  Pill,
  DollarSign,
  Activity,
  Calendar,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../ui/utils';

export type JumpLinkContext =
  | 'visit'
  | 'medication-alert'
  | 'billing-issue'
  | 'qa-item'
  | 'assessment'
  | 'order'
  | 'claim';

interface JumpLink {
  id: string;
  label: string;
  description?: string;
  icon: any;
  path: string;
  badge?: string | number;
  variant?: 'default' | 'outline' | 'ghost';
}

interface CrossModuleJumpLinksProps {
  context: JumpLinkContext;
  contextData?: any;
  onNavigate?: (path: string) => void;
  className?: string;
}

export default function CrossModuleJumpLinks({
  context,
  contextData,
  onNavigate,
  className,
}: CrossModuleJumpLinksProps) {
  const links = getJumpLinksForContext(context, contextData);

  if (links.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Quick Actions
      </h3>
      <div className="space-y-1">
        {links.map((link) => (
          <JumpLinkButton key={link.id} link={link} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// JUMP LINK BUTTON
// ═══════════════════════════════════════════════════════════════════════════

function JumpLinkButton({
  link,
  onNavigate,
}: {
  link: JumpLink;
  onNavigate?: (path: string) => void;
}) {
  const Icon = link.icon;

  return (
    <button
      onClick={() => onNavigate?.(link.path)}
      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group"
    >
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
          {link.label}
          {link.badge && (
            <Badge variant="outline" className="text-xs">
              {link.badge}
            </Badge>
          )}
        </div>
        {link.description && (
          <div className="text-xs text-gray-600 truncate">{link.description}</div>
        )}
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT-SPECIFIC JUMP LINKS
// ═══════════════════════════════════════════════════════════════════════════

function getJumpLinksForContext(context: JumpLinkContext, data?: any): JumpLink[] {
  switch (context) {
    case 'visit':
      return [
        {
          id: 'patient-chart',
          label: 'View Patient Chart',
          description: data?.patientName || 'Full patient record',
          icon: User,
          path: `/patient/${data?.patientId}/chart`,
        },
        {
          id: 'admission-overview',
          label: 'View Admission',
          description: data?.admissionDate || 'Admission details',
          icon: Activity,
          path: `/patient/${data?.patientId}/admission/${data?.admissionId}`,
        },
        {
          id: 'medications',
          label: 'Medications',
          description: 'Current medication list',
          icon: Pill,
          path: `/patient-medication-profile`,
          badge: data?.medicationCount,
        },
        {
          id: 'care-plan',
          label: 'Care Plan',
          description: 'Active care plan',
          icon: FileText,
          path: `/care-plan-management`,
        },
      ];

    case 'medication-alert':
      return [
        {
          id: 'medication-profile',
          label: 'Full Medication Profile',
          description: 'Complete medication history',
          icon: Pill,
          path: `/patient-medication-profile`,
        },
        {
          id: 'patient-chart',
          label: 'Patient Chart',
          description: data?.patientName,
          icon: User,
          path: `/patient/${data?.patientId}/chart`,
        },
        {
          id: 'recent-visits',
          label: 'Recent Visits',
          description: 'Visit documentation',
          icon: Calendar,
          path: `/visit-timeline`,
          badge: data?.visitCount,
        },
      ];

    case 'billing-issue':
      return [
        {
          id: 'admission-dashboard',
          label: 'Admission Dashboard',
          description: data?.admissionDate || 'View full admission',
          icon: Activity,
          path: `/patient/${data?.patientId}/admission/${data?.admissionId}`,
        },
        {
          id: 'visit-timeline',
          label: 'Visit Timeline',
          description: 'All visits for this admission',
          icon: Calendar,
          path: `/visit-timeline`,
          badge: data?.visitCount,
        },
        {
          id: 'clinical-docs',
          label: 'Clinical Documentation',
          description: 'Review documentation',
          icon: FileText,
          path: `/clinical-documentation-workspace`,
          badge: data?.docCount,
        },
        {
          id: 'orders',
          label: 'Orders & Certification',
          description: 'Physician orders',
          icon: ClipboardCheck,
          path: `/orders-workspace`,
        },
      ];

    case 'qa-item':
      return [
        {
          id: 'clinical-document',
          label: 'Open Document',
          description: data?.documentType || 'View full document',
          icon: FileText,
          path: `/clinical-documentation-workspace`,
        },
        {
          id: 'patient-chart',
          label: 'Patient Chart',
          description: data?.patientName,
          icon: User,
          path: `/patient/${data?.patientId}/chart`,
        },
        {
          id: 'admission',
          label: 'Admission Overview',
          description: data?.admissionDate,
          icon: Activity,
          path: `/patient/${data?.patientId}/admission/${data?.admissionId}`,
        },
        {
          id: 'visit-details',
          label: 'Visit Details',
          description: data?.visitDate,
          icon: Calendar,
          path: `/poc/visit/${data?.visitId}`,
        },
      ];

    case 'assessment':
      return [
        {
          id: 'patient-chart',
          label: 'Patient Chart',
          description: data?.patientName,
          icon: User,
          path: `/patient/${data?.patientId}/chart`,
        },
        {
          id: 'previous-assessments',
          label: 'Assessment History',
          description: 'Compare with previous',
          icon: ClipboardCheck,
          path: `/assessment-history`,
          badge: data?.previousCount,
        },
        {
          id: 'care-plan',
          label: 'Update Care Plan',
          description: 'Reflect assessment findings',
          icon: FileText,
          path: `/care-plan-management`,
        },
      ];

    case 'order':
      return [
        {
          id: 'patient-chart',
          label: 'Patient Chart',
          description: data?.patientName,
          icon: User,
          path: `/patient/${data?.patientId}/chart`,
        },
        {
          id: 'admission',
          label: 'Admission Overview',
          description: data?.admissionDate,
          icon: Activity,
          path: `/patient/${data?.patientId}/admission/${data?.admissionId}`,
        },
        {
          id: 'care-plan',
          label: 'Care Plan',
          description: 'View care plan',
          icon: FileText,
          path: `/care-plan-management`,
        },
        {
          id: 'visit-frequency',
          label: 'Visit Frequency',
          description: 'Schedule compliance',
          icon: Calendar,
          path: `/visit-frequency`,
        },
      ];

    case 'claim':
      return [
        {
          id: 'admission',
          label: 'Admission Details',
          description: data?.admissionDate,
          icon: Activity,
          path: `/patient/${data?.patientId}/admission/${data?.admissionId}`,
        },
        {
          id: 'visits',
          label: 'Visit Timeline',
          description: 'All billed visits',
          icon: Calendar,
          path: `/visit-timeline`,
          badge: data?.visitCount,
        },
        {
          id: 'documentation',
          label: 'Clinical Documentation',
          description: 'Supporting documentation',
          icon: FileText,
          path: `/clinical-documentation-workspace`,
        },
        {
          id: 'orders',
          label: 'Physician Orders',
          description: 'Order verification',
          icon: ClipboardCheck,
          path: `/orders-workspace`,
        },
      ];

    default:
      return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INLINE JUMP LINK (for embedding in cards/panels)
// ═══════════════════════════════════════════════════════════════════════════

interface InlineJumpLinkProps {
  label: string;
  icon?: any;
  path: string;
  onNavigate?: (path: string) => void;
  variant?: 'text' | 'button';
}

export function InlineJumpLink({
  label,
  icon: Icon,
  path,
  onNavigate,
  variant = 'text',
}: InlineJumpLinkProps) {
  if (variant === 'button') {
    return (
      <Button variant="outline" size="sm" onClick={() => onNavigate?.(path)}>
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {label}
        <ExternalLink className="w-3 h-3 ml-2" />
      </Button>
    );
  }

  return (
    <button
      onClick={() => onNavigate?.(path)}
      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      <ExternalLink className="w-3 h-3" />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DEMO COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function CrossModuleJumpLinksDemo() {
  const contexts: { id: JumpLinkContext; label: string; data?: any }[] = [
    {
      id: 'visit',
      label: 'From Visit Context',
      data: {
        patientId: '1',
        patientName: 'Sarah Johnson',
        admissionId: 'adm-1',
        admissionDate: '03/01/2024',
        medicationCount: 8,
      },
    },
    {
      id: 'medication-alert',
      label: 'From Medication Alert',
      data: {
        patientId: '1',
        patientName: 'Sarah Johnson',
        visitCount: 12,
      },
    },
    {
      id: 'billing-issue',
      label: 'From Billing Issue',
      data: {
        patientId: '1',
        admissionId: 'adm-1',
        admissionDate: '03/01/2024',
        visitCount: 15,
        docCount: 7,
      },
    },
    {
      id: 'qa-item',
      label: 'From QA Item',
      data: {
        patientId: '1',
        patientName: 'Sarah Johnson',
        admissionId: 'adm-1',
        admissionDate: '03/01/2024',
        visitId: 'visit-1',
        visitDate: '03/15/2024',
        documentType: 'PT Visit Note',
      },
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Cross-Module Jump Links</h2>
        <p className="text-gray-600">
          Contextual navigation reducing multi-step workflows by providing direct links to related
          modules
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {contexts.map((ctx) => (
          <div key={ctx.id} className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{ctx.label}</h3>
            <CrossModuleJumpLinks
              context={ctx.id}
              contextData={ctx.data}
              onNavigate={(path) => console.log('Navigate to:', path)}
            />
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Inline Jump Link Examples</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Text variant:</span>
            <InlineJumpLink
              label="View Patient Chart"
              icon={User}
              path="/patient/1/chart"
              onNavigate={(path) => console.log('Navigate to:', path)}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Button variant:</span>
            <InlineJumpLink
              label="Open Admission"
              icon={Activity}
              path="/admissions/1"
              variant="button"
              onNavigate={(path) => console.log('Navigate to:', path)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}