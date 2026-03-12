/**
 * Payer Authorization Card
 * Displays insurance authorization status and details
 */
import React from 'react';
import { Shield, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { textColor, surface, borderColor, space, typography, status } from '../../../design-system/semantic/tokens';

export interface PayerAuthData {
  id: string;
  payer: string;
  authNumber: string;
  status: 'active' | 'pending' | 'expired' | 'denied';
  startDate: string;
  endDate: string;
  visitsAuthorized: number;
  visitsUsed: number;
  daysRemaining: number;
  serviceTypes: string[];
  restrictions?: string[];
}

interface PayerAuthCardProps {
  authorization: PayerAuthData;
  variant?: 'default' | 'compact';
  onRequestExtension?: () => void;
}

export const PayerAuthCard = React.memo(({ authorization, variant = 'default', onRequestExtension }: PayerAuthCardProps) => {
  const isExpiringSoon = authorization.daysRemaining <= 7 && authorization.daysRemaining > 0;
  const isExpired = authorization.status === 'expired';
  const visitPercentage = (authorization.visitsUsed / authorization.visitsAuthorized) * 100;
  
  const getStatusColor = () => {
    if (isExpired || authorization.status === 'denied') return status.danger;
    if (isExpiringSoon || authorization.status === 'pending') return status.warning;
    return status.success;
  };
  
  const statusColor = getStatusColor();
  
  if (variant === 'compact') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: space.sm,
        backgroundColor: statusColor.bg,
        border: `1px solid ${statusColor.border}`,
        borderRadius: '0.375rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
          <Shield size={16} style={{ color: statusColor.text }} />
          <div>
            <div style={{ fontSize: typography.body.size, fontWeight: 500, color: textColor.primary }}>
              {authorization.payer}
            </div>
            <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
              {authorization.authNumber}
            </div>
          </div>
        </div>
        <StatusBadge status={authorization.status} size="sm" />
      </div>
    );
  }
  
  return (
    <div style={{
      backgroundColor: surface.elevated,
      border: `1px solid ${statusColor.border}`,
      borderRadius: '0.5rem',
      padding: space.md,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: space.md }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, marginBottom: space.xs }}>
            <Shield size={20} style={{ color: statusColor.text }} />
            <h4 style={{ fontSize: typography.cardTitle.size, fontWeight: typography.cardTitle.weight, color: textColor.primary, margin: 0 }}>
              {authorization.payer}
            </h4>
          </div>
          <div style={{ fontSize: typography.body.size, color: textColor.secondary }}>
            Auth #: {authorization.authNumber}
          </div>
        </div>
        <StatusBadge status={authorization.status} size="sm" />
      </div>
      
      {/* Alert Banner */}
      {(isExpiringSoon || isExpired) && (
        <div style={{
          padding: space.sm,
          backgroundColor: statusColor.bg,
          border: `1px solid ${statusColor.border}`,
          borderRadius: '0.375rem',
          marginBottom: space.md,
          display: 'flex',
          alignItems: 'center',
          gap: space.sm
        }}>
          <AlertCircle size={16} style={{ color: statusColor.text }} />
          <span style={{ fontSize: typography.body.size, fontWeight: 600, color: statusColor.text }}>
            {isExpired ? 'Authorization expired - services may not be covered' : 
             `Expires in ${authorization.daysRemaining} days - request extension soon`}
          </span>
        </div>
      )}
      
      {/* Date Range */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: space.md, marginBottom: space.md }}>
        <div style={{ padding: space.sm, backgroundColor: surface.subtle, borderRadius: '0.375rem' }}>
          <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>
            Start Date
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
            <Calendar size={14} style={{ color: textColor.muted }} />
            <span style={{ fontSize: typography.body.size, fontWeight: 500, color: textColor.primary }}>
              {new Date(authorization.startDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div style={{ padding: space.sm, backgroundColor: surface.subtle, borderRadius: '0.375rem' }}>
          <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>
            End Date
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
            <Calendar size={14} style={{ color: isExpiringSoon || isExpired ? statusColor.text : textColor.muted }} />
            <span style={{ fontSize: typography.body.size, fontWeight: 500, color: isExpiringSoon || isExpired ? statusColor.text : textColor.primary }}>
              {new Date(authorization.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Visits Progress */}
      <div style={{ marginBottom: space.md }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.sm }}>
          <div style={{ fontSize: typography.body.size, fontWeight: 600, color: textColor.primary }}>
            Visits Authorized
          </div>
          <div style={{ fontSize: typography.cardTitle.size, fontWeight: 700, color: visitPercentage >= 90 ? status.warning.text : textColor.primary }}>
            {authorization.visitsUsed} / {authorization.visitsAuthorized}
          </div>
        </div>
        
        <div style={{
          width: '100%',
          height: '10px',
          backgroundColor: surface.subtle,
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(visitPercentage, 100)}%`,
            height: '100%',
            backgroundColor: visitPercentage >= 90 ? status.warning.text : status.success.text,
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginTop: space.xs }}>
          {authorization.visitsAuthorized - authorization.visitsUsed} visits remaining
        </div>
      </div>
      
      {/* Service Types */}
      <div style={{ marginBottom: space.md }}>
        <div style={{ fontSize: typography.helper.size, fontWeight: 600, color: textColor.secondary, marginBottom: space.sm }}>
          Authorized Services
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: space.xs }}>
          {authorization.serviceTypes.map((service, idx) => (
            <span key={idx} style={{
              padding: `${space.xs} ${space.sm}`,
              backgroundColor: status.info.bg,
              color: status.info.text,
              borderRadius: '12px',
              fontSize: typography.helper.size,
              fontWeight: 500
            }}>
              {service}
            </span>
          ))}
        </div>
      </div>
      
      {/* Restrictions */}
      {authorization.restrictions && authorization.restrictions.length > 0 && (
        <div style={{ marginBottom: space.md, padding: space.sm, backgroundColor: status.warning.bg, border: `1px solid ${status.warning.border}`, borderRadius: '0.375rem' }}>
          <div style={{ fontSize: typography.helper.size, fontWeight: 600, color: status.warning.text, marginBottom: space.xs }}>
            Restrictions
          </div>
          <ul style={{ margin: 0, paddingLeft: space.md, fontSize: typography.helper.size, color: textColor.primary }}>
            {authorization.restrictions.map((restriction, idx) => (
              <li key={idx}>{restriction}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Action Button */}
      {onRequestExtension && (isExpiringSoon || authorization.visitsAuthorized - authorization.visitsUsed <= 2) && (
        <button
          onClick={onRequestExtension}
          style={{
            width: '100%',
            padding: `${space.sm} ${space.md}`,
            fontSize: typography.body.size,
            fontWeight: 500,
            color: 'white',
            backgroundColor: status.info.text,
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: space.sm
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Clock size={16} />
          Request Extension
        </button>
      )}
    </div>
  );
});

PayerAuthCard.displayName = 'PayerAuthCard';
