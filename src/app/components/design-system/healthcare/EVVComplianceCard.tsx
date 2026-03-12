/**
 * EVV Compliance Card
 * Electronic Visit Verification compliance tracking
 */
import React from 'react';
import { MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { textColor, surface, borderColor, space, typography, status } from '../../../design-system/semantic/tokens';

export interface EVVData {
  visitId: string;
  patientName: string;
  caregiver: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  checkInLocation?: { lat: number; lon: number; address: string };
  checkOutLocation?: { lat: number; lon: number; address: string };
  complianceStatus: 'compliant' | 'late-checkin' | 'late-checkout' | 'no-checkin' | 'no-checkout' | 'location-issue';
}

interface EVVComplianceCardProps {
  data: EVVData;
  variant?: 'default' | 'compact';
}

export const EVVComplianceCard = React.memo(({ data, variant = 'default' }: EVVComplianceCardProps) => {
  const isCompliant = data.complianceStatus === 'compliant';
  const hasIssue = data.complianceStatus !== 'compliant';
  
  const getStatusColor = () => {
    if (isCompliant) return status.success;
    if (data.complianceStatus.includes('no-')) return status.danger;
    return status.warning;
  };
  
  const statusColor = getStatusColor();
  
  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: space.sm, backgroundColor: statusColor.bg, border: `1px solid ${statusColor.border}`, borderRadius: '0.375rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
          {isCompliant ? <CheckCircle2 size={16} style={{ color: statusColor.text }} /> : <AlertCircle size={16} style={{ color: statusColor.text }} />}
          <span style={{ fontSize: typography.body.size, fontWeight: 500, color: textColor.primary }}>EVV</span>
        </div>
        <span style={{ fontSize: typography.body.size, fontWeight: 600, color: statusColor.text }}>
          {isCompliant ? 'Compliant' : 'Issue'}
        </span>
      </div>
    );
  }
  
  return (
    <div style={{ backgroundColor: surface.elevated, border: `1px solid ${hasIssue ? statusColor.border : borderColor.default}`, borderRadius: '0.5rem', padding: space.md }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md }}>
        <h4 style={{ fontSize: typography.cardTitle.size, fontWeight: typography.cardTitle.weight, color: textColor.primary, margin: 0 }}>EVV Compliance</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.xs, padding: `${space.xs} ${space.sm}`, backgroundColor: statusColor.bg, borderRadius: '0.375rem' }}>
          {isCompliant ? <CheckCircle2 size={16} style={{ color: statusColor.text }} /> : <AlertCircle size={16} style={{ color: statusColor.text }} />}
          <span style={{ fontSize: typography.body.size, fontWeight: 600, color: statusColor.text }}>{data.complianceStatus.replace('-', ' ').toUpperCase()}</span>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: space.md }}>
        <div>
          <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>Check-In</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs, marginBottom: space.xs }}>
            <Clock size={14} style={{ color: textColor.muted }} />
            <span style={{ fontSize: typography.body.size, color: textColor.primary }}>
              {data.actualStart ? new Date(data.actualStart).toLocaleTimeString() : 'Not recorded'}
            </span>
          </div>
          {data.checkInLocation && (
            <div style={{ display: 'flex', alignItems: 'start', gap: space.xs }}>
              <MapPin size={14} style={{ color: textColor.muted, marginTop: '2px' }} />
              <span style={{ fontSize: typography.helper.size, color: textColor.secondary }}>{data.checkInLocation.address}</span>
            </div>
          )}
        </div>
        
        <div>
          <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>Check-Out</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs, marginBottom: space.xs }}>
            <Clock size={14} style={{ color: textColor.muted }} />
            <span style={{ fontSize: typography.body.size, color: textColor.primary }}>
              {data.actualEnd ? new Date(data.actualEnd).toLocaleTimeString() : 'Not recorded'}
            </span>
          </div>
          {data.checkOutLocation && (
            <div style={{ display: 'flex', alignItems: 'start', gap: space.xs }}>
              <MapPin size={14} style={{ color: textColor.muted, marginTop: '2px' }} />
              <span style={{ fontSize: typography.helper.size, color: textColor.secondary }}>{data.checkOutLocation.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

EVVComplianceCard.displayName = 'EVVComplianceCard';
