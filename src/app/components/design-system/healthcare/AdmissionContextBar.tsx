/**
 * Admission Context Bar
 * Persistent context bar showing current admission information
 * 
 * COMPLIANT WITH:
 * - HEALTHCARE_COMPONENTS.md - Standard admission context display
 * - SCREEN_GENERATION.md - Uses semantic tokens
 * - WCAG 2.1 AA - Accessible color contrast and labels
 * 
 * @example
 * ```tsx
 * <AdmissionContextBar
 *   admission={{
 *     id: '123',
 *     patientName: 'John Doe',
 *     admissionDate: '2026-01-15',
 *     status: 'active',
 *     certPeriodEnd: '2026-03-15',
 *     primaryDiagnosis: 'CHF',
 *     disciplines: ['SN', 'PT']
 *   }}
 * />
 * ```
 */
import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Activity,
  AlertTriangle,
  Users,
  ChevronUp,
  ChevronDown,
  FileText
} from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { 
  textColor, 
  surface, 
  borderColor, 
  space, 
  typography,
  status 
} from '../../../design-system/semantic/tokens';

export interface AdmissionContextData {
  id: string;
  patientName: string;
  patientMrn?: string;
  admissionDate: string;
  status: 'active' | 'pending' | 'discharged' | 'hold';
  certPeriodStart?: string;
  certPeriodEnd?: string;
  primaryDiagnosis?: string;
  disciplines?: string[];
  authDaysRemaining?: number;
  payer?: string;
}

interface AdmissionContextBarProps {
  admission: AdmissionContextData;
  compact?: boolean;
  onNavigate?: (section: string) => void;
}

export const AdmissionContextBar = React.memo(({ 
  admission, 
  compact = false,
  onNavigate 
}: AdmissionContextBarProps) => {
  const [expanded, setExpanded] = useState(!compact);
  
  // Calculate days in certification period
  const calculateDaysInPeriod = () => {
    if (!admission.certPeriodEnd) return null;
    
    const now = new Date();
    const endDate = new Date(admission.certPeriodEnd);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const daysRemaining = calculateDaysInPeriod();
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;
  
  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div style={{
      backgroundColor: surface.elevated,
      borderBottom: `1px solid ${borderColor.default}`,
      padding: compact && !expanded ? space.sm : space.md,
    }}>
      {/* Main Row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: space.md
      }}>
        {/* Left: Patient & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: space.lg }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
              <h3 style={{ 
                fontSize: typography.cardTitle.size, 
                fontWeight: typography.cardTitle.weight,
                color: textColor.primary,
                margin: 0
              }}>
                {admission.patientName}
              </h3>
              <StatusBadge status={admission.status} size="sm" />
            </div>
            {admission.patientMrn && (
              <div style={{ 
                fontSize: typography.helper.size, 
                color: textColor.secondary,
                marginTop: space.xs
              }}>
                MRN: {admission.patientMrn}
              </div>
            )}
          </div>
        </div>
        
        {/* Center: Quick Info */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: space.lg,
          flex: 1,
          justifyContent: 'center'
        }}>
          {/* Admission Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
            <Calendar size={16} style={{ color: textColor.muted }} />
            <div>
              <div style={{ 
                fontSize: typography.helper.size, 
                color: textColor.secondary,
                fontWeight: 500
              }}>
                Admitted
              </div>
              <div style={{ 
                fontSize: typography.body.size, 
                color: textColor.primary 
              }}>
                {formatDate(admission.admissionDate)}
              </div>
            </div>
          </div>
          
          {/* Certification Period Warning */}
          {admission.certPeriodEnd && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: space.xs,
              padding: `${space.xs} ${space.sm}`,
              backgroundColor: isExpired 
                ? status.danger.bg 
                : isExpiringSoon 
                  ? status.warning.bg 
                  : status.success.bg,
              borderRadius: '0.375rem',
              border: `1px solid ${
                isExpired 
                  ? status.danger.border 
                  : isExpiringSoon 
                    ? status.warning.border 
                    : status.success.border
              }`
            }}>
              {(isExpired || isExpiringSoon) && (
                <AlertTriangle 
                  size={16} 
                  style={{ 
                    color: isExpired ? status.danger.text : status.warning.text 
                  }} 
                />
              )}
              <div>
                <div style={{ 
                  fontSize: typography.helper.size, 
                  color: isExpired 
                    ? status.danger.text 
                    : isExpiringSoon 
                      ? status.warning.text 
                      : status.success.text,
                  fontWeight: 600
                }}>
                  Cert Period
                </div>
                <div style={{ 
                  fontSize: typography.body.size, 
                  color: isExpired 
                    ? status.danger.text 
                    : isExpiringSoon 
                      ? status.warning.text 
                      : status.success.text,
                  fontWeight: 500
                }}>
                  {daysRemaining !== null ? (
                    isExpired ? (
                      'Expired'
                    ) : (
                      `${daysRemaining} days left`
                    )
                  ) : (
                    formatDate(admission.certPeriodEnd)
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Disciplines */}
          {admission.disciplines && admission.disciplines.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
              <Users size={16} style={{ color: textColor.muted }} />
              <div>
                <div style={{ 
                  fontSize: typography.helper.size, 
                  color: textColor.secondary,
                  fontWeight: 500
                }}>
                  Disciplines
                </div>
                <div style={{ 
                  fontSize: typography.body.size, 
                  color: textColor.primary 
                }}>
                  {admission.disciplines.join(', ')}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
          {onNavigate && (
            <button
              onClick={() => onNavigate('overview')}
              style={{
                padding: `${space.xs} ${space.sm}`,
                fontSize: typography.body.size,
                color: textColor.link,
                backgroundColor: 'transparent',
                border: `1px solid ${borderColor.default}`,
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: space.xs
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = surface.hover}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Activity size={16} />
              View Details
            </button>
          )}
          
          {compact && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                padding: space.xs,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: textColor.secondary,
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          )}
        </div>
      </div>
      
      {/* Expanded Details */}
      {expanded && admission.primaryDiagnosis && (
        <div style={{
          marginTop: space.md,
          paddingTop: space.md,
          borderTop: `1px solid ${borderColor.subtle}`,
          display: 'flex',
          alignItems: 'center',
          gap: space.lg
        }}>
          {/* Primary Diagnosis */}
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
            <FileText size={16} style={{ color: textColor.muted }} />
            <div>
              <span style={{ 
                fontSize: typography.helper.size, 
                color: textColor.secondary,
                fontWeight: 500
              }}>
                Primary Dx:{' '}
              </span>
              <span style={{ 
                fontSize: typography.body.size, 
                color: textColor.primary 
              }}>
                {admission.primaryDiagnosis}
              </span>
            </div>
          </div>
          
          {/* Payer */}
          {admission.payer && (
            <div>
              <span style={{ 
                fontSize: typography.helper.size, 
                color: textColor.secondary,
                fontWeight: 500
              }}>
                Payer:{' '}
              </span>
              <span style={{ 
                fontSize: typography.body.size, 
                color: textColor.primary 
              }}>
                {admission.payer}
              </span>
            </div>
          )}
          
          {/* Auth Days */}
          {admission.authDaysRemaining !== undefined && (
            <div>
              <span style={{ 
                fontSize: typography.helper.size, 
                color: textColor.secondary,
                fontWeight: 500
              }}>
                Auth Days:{' '}
              </span>
              <span style={{ 
                fontSize: typography.body.size, 
                color: admission.authDaysRemaining <= 3 
                  ? status.warning.text 
                  : textColor.primary,
                fontWeight: admission.authDaysRemaining <= 3 ? 600 : 400
              }}>
                {admission.authDaysRemaining} remaining
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

AdmissionContextBar.displayName = 'AdmissionContextBar';