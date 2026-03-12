/**
 * Visit Summary Card - Visit information display with status and timing
 */
import React from 'react';
import { Calendar, Clock, User, MapPin, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { textColor, surface, borderColor, space, typography, status } from '../../../design-system/semantic/tokens';

export interface VisitData {
  id: string;
  patientName: string;
  discipline: 'SN' | 'PT' | 'OT' | 'ST' | 'HHA' | 'MSW';
  caregiver: string;
  scheduledDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'missed' | 'cancelled';
  location?: string;
  visitType?: 'routine' | 'admission' | 'recertification' | 'discharge';
}

interface VisitSummaryCardProps {
  visit: VisitData;
  onClick?: () => void;
  variant?: 'default' | 'compact';
}

const disciplineLabels: Record<VisitData['discipline'], string> = {
  'SN': 'Skilled Nursing',
  'PT': 'Physical Therapy',
  'OT': 'Occupational Therapy',
  'ST': 'Speech Therapy',
  'HHA': 'Home Health Aide',
  'MSW': 'Medical Social Worker'
};

export const VisitSummaryCard = React.memo(({ visit, onClick, variant = 'default' }: VisitSummaryCardProps) => {
  const isCompleted = visit.status === 'completed';
  const isInProgress = visit.status === 'in-progress';
  
  if (variant === 'compact') {
    return (
      <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: space.sm, backgroundColor: surface.elevated, border: `1px solid ${borderColor.default}`, borderRadius: '0.375rem', cursor: onClick ? 'pointer' : 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
          <div style={{ width: '4px', height: '40px', backgroundColor: isCompleted ? status.success.text : isInProgress ? status.info.text : textColor.muted, borderRadius: '2px' }} />
          <div>
            <div style={{ fontSize: typography.body.size, fontWeight: 500, color: textColor.primary }}>{visit.patientName}</div>
            <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>{disciplineLabels[visit.discipline]}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: typography.body.size, fontWeight: 500, color: textColor.primary }}>
            {new Date(visit.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <StatusBadge status={visit.status} size="sm" />
        </div>
      </div>
    );
  }
  
  return (
    <div onClick={onClick} style={{ backgroundColor: surface.elevated, border: `1px solid ${borderColor.default}`, borderRadius: '0.5rem', padding: space.md, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: space.md }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, marginBottom: space.xs }}>
            {isCompleted && <CheckCircle2 size={18} style={{ color: status.success.text }} />}
            <h4 style={{ fontSize: typography.cardTitle.size, fontWeight: typography.cardTitle.weight, color: textColor.primary, margin: 0 }}>
              {visit.patientName}
            </h4>
          </div>
          <div style={{ fontSize: typography.body.size, color: textColor.secondary }}>
            {disciplineLabels[visit.discipline]}
            {visit.visitType && ` • ${visit.visitType.charAt(0).toUpperCase() + visit.visitType.slice(1)}`}
          </div>
        </div>
        <StatusBadge status={visit.status} size="sm" />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: space.md }}>
        <div>
          <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>Date</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
            <Calendar size={14} style={{ color: textColor.muted }} />
            <span style={{ fontSize: typography.body.size, color: textColor.primary }}>
              {new Date(visit.scheduledDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>Time</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
            <Clock size={14} style={{ color: textColor.muted }} />
            <span style={{ fontSize: typography.body.size, color: textColor.primary }}>
              {new Date(visit.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(visit.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>Caregiver</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
            <User size={14} style={{ color: textColor.muted }} />
            <span style={{ fontSize: typography.body.size, color: textColor.primary }}>{visit.caregiver}</span>
          </div>
        </div>
        
        {visit.location && (
          <div>
            <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>Location</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
              <MapPin size={14} style={{ color: textColor.muted }} />
              <span style={{ fontSize: typography.body.size, color: textColor.primary }}>{visit.location}</span>
            </div>
          </div>
        )}
      </div>
      
      {(visit.actualStart || visit.actualEnd) && (
        <div style={{ marginTop: space.md, paddingTop: space.md, borderTop: `1px solid ${borderColor.subtle}` }}>
          <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>Actual Time</div>
          <div style={{ fontSize: typography.body.size, color: textColor.primary }}>
            {visit.actualStart && new Date(visit.actualStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {visit.actualStart && visit.actualEnd && ' - '}
            {visit.actualEnd && new Date(visit.actualEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )}
    </div>
  );
});

VisitSummaryCard.displayName = 'VisitSummaryCard';
