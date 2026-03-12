/**
 * Authorization Tracker
 * Displays authorization status and tracks visit/days usage
 * 
 * COMPLIANT WITH:
 * - HEALTHCARE_COMPONENTS.md - Standard authorization tracking
 * - SCREEN_GENERATION.md - Uses semantic tokens
 * - WCAG 2.1 AA - Accessible progress indicators
 * 
 * @example
 * ```tsx
 * <AuthorizationTracker
 *   authorization={{
 *     authNumber: 'AUTH-2026-001',
 *     status: 'active',
 *     visitsAuthorized: 30,
 *     visitsUsed: 18,
 *     startDate: '2026-01-01',
 *     endDate: '2026-03-31',
 *     payer: 'Medicare'
 *   }}
 * />
 * ```
 */
import React from 'react';
import { Shield, Calendar, TrendingUp, AlertCircle, XCircle, Activity } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { textColor, surface, borderColor, space, typography, status } from '../../../design-system/semantic/tokens';

export interface AuthorizationData {
  authNumber: string;
  status: 'active' | 'pending' | 'expired' | 'denied';
  visitsAuthorized?: number;
  visitsUsed?: number;
  daysAuthorized?: number;
  daysUsed?: number;
  startDate: string;
  endDate: string;
  payer?: string;
  notes?: string;
}

interface AuthorizationTrackerProps {
  authorization: AuthorizationData;
  variant?: 'default' | 'compact' | 'detailed';
  showProgress?: boolean;
  onRequestExtension?: () => void;
}

export const AuthorizationTracker = React.memo(({ 
  authorization, 
  variant = 'default',
  showProgress = true,
  onRequestExtension 
}: AuthorizationTrackerProps) => {
  
  // Calculate percentages
  const visitsPercentage = authorization.visitsAuthorized && authorization.visitsUsed
    ? (authorization.visitsUsed / authorization.visitsAuthorized) * 100
    : 0;
    
  const daysPercentage = authorization.daysAuthorized && authorization.daysUsed
    ? (authorization.daysUsed / authorization.daysAuthorized) * 100
    : 0;
  
  // Calculate days remaining
  const calculateDaysRemaining = () => {
    const now = new Date();
    const endDate = new Date(authorization.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysRemaining = calculateDaysRemaining();
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0;
  
  // Determine warning state
  const needsAttention = 
    isExpiringSoon || 
    isExpired || 
    visitsPercentage >= 80 || 
    daysPercentage >= 80 ||
    authorization.status === 'denied';
  
  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get status icon and color
  const getStatusInfo = () => {
    switch (authorization.status) {
      case 'active':
        return { 
          icon: Shield, 
          color: status.success.text,
          bg: status.success.bg,
          border: status.success.border
        };
      case 'pending':
        return { 
          icon: TrendingUp, 
          color: status.warning.text,
          bg: status.warning.bg,
          border: status.warning.border
        };
      case 'expired':
        return { 
          icon: XCircle, 
          color: status.danger.text,
          bg: status.danger.bg,
          border: status.danger.border
        };
      case 'denied':
        return { 
          icon: XCircle, 
          color: status.danger.text,
          bg: status.danger.bg,
          border: status.danger.border
        };
      default:
        return { 
          icon: Activity, 
          color: textColor.secondary,
          bg: surface.subtle,
          border: borderColor.default
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;
  
  if (variant === 'compact') {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: space.sm,
        padding: `${space.xs} ${space.sm}`,
        backgroundColor: statusInfo.bg,
        border: `1px solid ${statusInfo.border}`,
        borderRadius: '0.375rem',
      }}>
        <Icon size={16} style={{ color: statusInfo.color }} />
        <div>
          <div style={{ 
            fontSize: typography.helper.size, 
            fontWeight: 600,
            color: statusInfo.color 
          }}>
            {authorization.authNumber}
          </div>
          {authorization.visitsAuthorized && authorization.visitsUsed !== undefined && (
            <div style={{ 
              fontSize: typography.helper.size, 
              color: statusInfo.color 
            }}>
              {authorization.visitsUsed}/{authorization.visitsAuthorized} visits
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      backgroundColor: surface.elevated,
      border: `1px solid ${needsAttention ? status.warning.border : borderColor.default}`,
      borderRadius: '0.5rem',
      padding: space.md,
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between',
        marginBottom: space.md
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, marginBottom: space.xs }}>
            <Icon size={20} style={{ color: statusInfo.color }} />
            <h4 style={{ 
              fontSize: typography.cardTitle.size, 
              fontWeight: typography.cardTitle.weight,
              color: textColor.primary,
              margin: 0
            }}>
              Authorization {authorization.authNumber}
            </h4>
            <StatusBadge status={authorization.status} size="sm" />
          </div>
          
          {authorization.payer && (
            <div style={{ 
              fontSize: typography.body.size, 
              color: textColor.secondary 
            }}>
              Payer: {authorization.payer}
            </div>
          )}
        </div>
        
        {needsAttention && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: space.xs,
            padding: `${space.xs} ${space.sm}`,
            backgroundColor: status.warning.bg,
            border: `1px solid ${status.warning.border}`,
            borderRadius: '0.375rem',
          }}>
            <AlertCircle size={16} style={{ color: status.warning.text }} />
            <span style={{ 
              fontSize: typography.helper.size, 
              fontWeight: 600,
              color: status.warning.text 
            }}>
              Needs Attention
            </span>
          </div>
        )}
      </div>
      
      {/* Date Range */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: space.md,
        marginBottom: space.md,
        padding: space.sm,
        backgroundColor: surface.subtle,
        borderRadius: '0.375rem'
      }}>
        <Calendar size={16} style={{ color: textColor.muted }} />
        <div>
          <span style={{ 
            fontSize: typography.body.size, 
            color: textColor.secondary 
          }}>
            {formatDate(authorization.startDate)} – {formatDate(authorization.endDate)}
          </span>
          <span style={{ 
            fontSize: typography.body.size, 
            color: isExpired 
              ? status.danger.text 
              : isExpiringSoon 
                ? status.warning.text 
                : textColor.primary,
            fontWeight: (isExpired || isExpiringSoon) ? 600 : 400,
            marginLeft: space.sm
          }}>
            ({daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'})
          </span>
        </div>
      </div>
      
      {/* Progress Bars */}
      {showProgress && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
          {/* Visits Progress */}
          {authorization.visitsAuthorized && authorization.visitsUsed !== undefined && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: space.xs
              }}>
                <span style={{ 
                  fontSize: typography.helper.size, 
                  fontWeight: 600,
                  color: textColor.secondary 
                }}>
                  Visits Used
                </span>
                <span style={{ 
                  fontSize: typography.body.size, 
                  fontWeight: 500,
                  color: visitsPercentage >= 90 
                    ? status.danger.text 
                    : visitsPercentage >= 80 
                      ? status.warning.text 
                      : textColor.primary
                }}>
                  {authorization.visitsUsed} / {authorization.visitsAuthorized}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: surface.subtle,
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${Math.min(visitsPercentage, 100)}%`,
                  height: '100%',
                  backgroundColor: visitsPercentage >= 90 
                    ? status.danger.text 
                    : visitsPercentage >= 80 
                      ? status.warning.text 
                      : status.success.text,
                  transition: 'width 0.3s ease',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          )}
          
          {/* Days Progress */}
          {authorization.daysAuthorized && authorization.daysUsed !== undefined && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: space.xs
              }}>
                <span style={{ 
                  fontSize: typography.helper.size, 
                  fontWeight: 600,
                  color: textColor.secondary 
                }}>
                  Days Used
                </span>
                <span style={{ 
                  fontSize: typography.body.size, 
                  fontWeight: 500,
                  color: daysPercentage >= 90 
                    ? status.danger.text 
                    : daysPercentage >= 80 
                      ? status.warning.text 
                      : textColor.primary
                }}>
                  {authorization.daysUsed} / {authorization.daysAuthorized}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: surface.subtle,
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${Math.min(daysPercentage, 100)}%`,
                  height: '100%',
                  backgroundColor: daysPercentage >= 90 
                    ? status.danger.text 
                    : daysPercentage >= 80 
                      ? status.warning.text 
                      : status.success.text,
                  transition: 'width 0.3s ease',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Notes */}
      {variant === 'detailed' && authorization.notes && (
        <div style={{
          marginTop: space.md,
          padding: space.sm,
          backgroundColor: surface.subtle,
          borderRadius: '0.375rem',
          fontSize: typography.body.size,
          color: textColor.secondary
        }}>
          <strong>Notes:</strong> {authorization.notes}
        </div>
      )}
      
      {/* Actions */}
      {onRequestExtension && needsAttention && (
        <div style={{ marginTop: space.md }}>
          <button
            onClick={onRequestExtension}
            style={{
              padding: `${space.xs} ${space.md}`,
              fontSize: typography.body.size,
              color: 'white',
              backgroundColor: status.warning.text,
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Request Extension
          </button>
        </div>
      )}
    </div>
  );
});

AuthorizationTracker.displayName = 'AuthorizationTracker';