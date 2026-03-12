/**
 * Detail Drawer Pattern
 * 
 * Reusable drawer for displaying secondary details without leaving current screen.
 * Supports slide-in from right with overlay.
 * 
 * Use Cases:
 * - Patient summary
 * - Admission details
 * - Medication details
 * - Order history
 * - Claim summary
 * - Caregiver profile
 * - Document preview
 * 
 * Performance:
 * - Lazy-loaded content
 * - Portal rendering
 * - Smooth CSS transitions
 */

import { memo, ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, ExternalLink } from 'lucide-react';
import { cn } from '../ui/utils';

interface QuickAction {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  onClick: () => void;
}

interface DetailDrawerProps {
  /** Show/hide drawer */
  isOpen: boolean;
  
  /** Close handler */
  onClose: () => void;
  
  /** Drawer title */
  title: string;
  
  /** Subtitle or type */
  subtitle?: string;
  
  /** Header icon */
  icon?: ReactNode;
  
  /** Header badge */
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  
  /** Key summary section (always visible at top) */
  summary?: ReactNode;
  
  /** Main content */
  children: ReactNode;
  
  /** Quick actions in header */
  quickActions?: QuickAction[];
  
  /** Footer actions */
  footerActions?: ReactNode;
  
  /** Open in full page link */
  fullPageLink?: string;
  
  /** Drawer size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Show overlay */
  showOverlay?: boolean;
  
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  
  /** Close on escape */
  closeOnEscape?: boolean;
  
  /** Loading state */
  loading?: boolean;
}

const DetailDrawer = memo(function DetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  badge,
  summary,
  children,
  quickActions = [],
  footerActions,
  fullPageLink,
  size = 'lg',
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  loading = false,
}: DetailDrawerProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlayClick) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  if (!isOpen) return null;

  // Size configurations
  const sizeClasses = {
    sm: 'w-96',
    md: 'w-[32rem]',
    lg: 'w-[40rem]',
    xl: 'w-[48rem]',
  };

  const drawer = (
    <>
      {/* Overlay */}
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-200"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 bottom-0 bg-white shadow-2xl z-50 flex flex-col',
          sizeClasses[size],
          'animate-in slide-in-from-right duration-200'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-gray-50">
          <div className="px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {icon && (
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    {icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 
                      id="drawer-title"
                      className="text-lg font-bold text-gray-900 truncate"
                    >
                      {title}
                    </h2>
                    {badge && (
                      <Badge variant={badge.variant || 'default'}>
                        {badge.label}
                      </Badge>
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-sm text-gray-600 truncate">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Quick Actions */}
            {quickActions.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
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
                {fullPageLink && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.location.href = fullPageLink}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Full Page
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Summary Section */}
          {summary && (
            <div className="px-6 py-4 bg-white border-t">
              {summary}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <div className="text-sm text-gray-500">Loading...</div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-6">
              {children}
            </div>
          )}
        </div>

        {/* Footer */}
        {footerActions && (
          <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-end gap-2">
              {footerActions}
            </div>
          </div>
        )}
      </div>
    </>
  );

  // Render in portal to escape parent overflow/z-index constraints
  return createPortal(drawer, document.body);
});

DetailDrawer.displayName = 'DetailDrawer';

export default DetailDrawer;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
import DetailDrawer from './components/patterns/DetailDrawer';
import { User, Phone, Mail, Edit } from 'lucide-react';

function PatientListPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <>
      <PatientTable 
        onRowClick={(patient) => setSelectedPatient(patient)}
      />

      <DetailDrawer
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title={selectedPatient?.name}
        subtitle="Patient Summary"
        icon={<User className="w-5 h-5 text-blue-600" />}
        badge={{ label: 'Active', variant: 'default' }}
        summary={
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-600">MRN</div>
              <div className="font-semibold">{selectedPatient?.mrn}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Age</div>
              <div className="font-semibold">{selectedPatient?.age}y</div>
            </div>
          </div>
        }
        quickActions={[
          {
            id: 'edit',
            label: 'Edit',
            icon: <Edit className="w-4 h-4 mr-2" />,
            onClick: () => console.log('Edit patient')
          },
          {
            id: 'call',
            label: 'Call',
            icon: <Phone className="w-4 h-4 mr-2" />,
            variant: 'outline',
            onClick: () => console.log('Call patient')
          },
        ]}
        fullPageLink={`/patient/${selectedPatient?.id}`}
      >
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Contact Information</h3>
            <div className="text-sm text-gray-600">
              {selectedPatient?.phone}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Current Admissions</h3>
            <div className="text-sm text-gray-600">
              {selectedPatient?.admissions?.length || 0} active
            </div>
          </div>
        </div>
      </DetailDrawer>
    </>
  );
}
*/
