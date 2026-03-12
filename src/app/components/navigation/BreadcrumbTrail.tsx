/**
 * Breadcrumb and Context Trail System
 * 
 * Displays hierarchical path for deep navigation helping users understand their location.
 * Example: Workspace > Patient > Admission > Clinical Documentation > PT Visit Note
 */

import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../ui/utils';

interface BreadcrumbItem {
  id: string;
  label: string;
  path?: string;
  icon?: any;
  current?: boolean;
}

interface BreadcrumbTrailProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
  showHome?: boolean;
  className?: string;
}

export default function BreadcrumbTrail({
  items,
  onNavigate,
  showHome = true,
  className,
}: BreadcrumbTrailProps) {
  const allItems = showHome
    ? [{ id: 'home', label: 'Workspace', path: '/', icon: Home }, ...items]
    : items;

  return (
    <nav
      className={cn('flex items-center gap-2 text-sm', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={item.id} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}

              {item.path && !isLast ? (
                <button
                  onClick={() => onNavigate?.(item.path!)}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </button>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1.5',
                    isLast ? 'text-gray-900 font-medium' : 'text-gray-600'
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BREADCRUMB PRESETS FOR COMMON WORKFLOWS
// ═══════════════════════════════════════════════════════════════════════════

export function usePatientBreadcrumb(patientName: string, patientId: string) {
  return [
    { id: 'patients', label: 'Patients', path: '/patient' },
    { id: 'patient', label: patientName, path: `/patient/${patientId}` },
  ];
}

export function useAdmissionBreadcrumb(
  patientName: string,
  patientId: string,
  admissionDate: string,
  admissionId: string
) {
  return [
    { id: 'patients', label: 'Patients', path: '/patient' },
    { id: 'patient', label: patientName, path: `/patient/${patientId}` },
    {
      id: 'admission',
      label: `Admission ${admissionDate}`,
      path: `/patient/${patientId}/admission/${admissionId}`,
    },
  ];
}

export function useClinicalDocBreadcrumb(
  patientName: string,
  patientId: string,
  admissionDate: string,
  admissionId: string,
  docType: string
) {
  return [
    { id: 'patients', label: 'Patients', path: '/patient' },
    { id: 'patient', label: patientName, path: `/patient/${patientId}` },
    {
      id: 'admission',
      label: `Admission ${admissionDate}`,
      path: `/patient/${patientId}/admission/${admissionId}`,
    },
    {
      id: 'clinical',
      label: 'Clinical Documentation',
      path: `/clinical-documentation-workspace`,
    },
    { id: 'document', label: docType, current: true },
  ];
}