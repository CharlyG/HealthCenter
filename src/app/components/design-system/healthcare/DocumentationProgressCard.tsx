/**
 * Documentation Progress Card
 * Shows documentation completion status with progress tracking
 */
import React from 'react';
import { FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { textColor, surface, borderColor, space, typography, status } from '../../../design-system/semantic/tokens';

export interface DocumentationProgress {
  totalRequired: number;
  completed: number;
  pending: number;
  overdue: number;
  dueToday: number;
  completionPercentage: number;
}

interface DocumentationProgressCardProps {
  progress: DocumentationProgress;
  title?: string;
  variant?: 'default' | 'compact';
}

export const DocumentationProgressCard = React.memo(({ 
  progress, 
  title = 'Documentation Progress',
  variant = 'default'
}: DocumentationProgressCardProps) => {
  
  const getStatusColor = () => {
    if (progress.overdue > 0) return status.danger;
    if (progress.completionPercentage < 75) return status.warning;
    return status.success;
  };
  
  const statusColor = getStatusColor();
  
  if (variant === 'compact') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: space.md,
        backgroundColor: surface.elevated,
        border: `1px solid ${borderColor.default}`,
        borderRadius: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
          <FileText size={18} style={{ color: textColor.secondary }} />
          <span style={{ fontSize: typography.body.size, fontWeight: 500, color: textColor.primary }}>
            {title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.md }}>
          <span style={{ fontSize: typography.body.size, color: textColor.secondary }}>
            {progress.completed}/{progress.totalRequired}
          </span>
          <span style={{ fontSize: typography.cardTitle.size, fontWeight: 600, color: statusColor.text }}>
            {progress.completionPercentage}%
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      backgroundColor: surface.elevated,
      border: `1px solid ${borderColor.default}`,
      borderRadius: '0.5rem',
      padding: space.md,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md }}>
        <h4 style={{ fontSize: typography.cardTitle.size, fontWeight: typography.cardTitle.weight, color: textColor.primary, margin: 0, display: 'flex', alignItems: 'center', gap: space.sm }}>
          <FileText size={20} />
          {title}
        </h4>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: statusColor.text }}>
          {progress.completionPercentage}%
        </div>
      </div>
      
      <div style={{ width: '100%', height: '12px', backgroundColor: surface.subtle, borderRadius: '6px', overflow: 'hidden', marginBottom: space.md }}>
        <div style={{ width: `${progress.completionPercentage}%`, height: '100%', backgroundColor: statusColor.text, transition: 'width 0.3s ease' }} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: space.md }}>
        <div style={{ padding: space.sm, backgroundColor: status.success.bg, borderRadius: '0.375rem', border: `1px solid ${status.success.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs, marginBottom: space.xs }}>
            <CheckCircle2 size={16} style={{ color: status.success.text }} />
            <span style={{ fontSize: typography.helper.size, fontWeight: 600, color: status.success.text }}>Completed</span>
          </div>
          <div style={{ fontSize: typography.cardTitle.size, fontWeight: 700, color: status.success.text }}>{progress.completed}</div>
        </div>
        
        <div style={{ padding: space.sm, backgroundColor: surface.subtle, borderRadius: '0.375rem', border: `1px solid ${borderColor.default}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs, marginBottom: space.xs }}>
            <Clock size={16} style={{ color: textColor.secondary }} />
            <span style={{ fontSize: typography.helper.size, fontWeight: 600, color: textColor.secondary }}>Pending</span>
          </div>
          <div style={{ fontSize: typography.cardTitle.size, fontWeight: 700, color: textColor.primary }}>{progress.pending}</div>
        </div>
        
        {progress.dueToday > 0 && (
          <div style={{ padding: space.sm, backgroundColor: status.warning.bg, borderRadius: '0.375rem', border: `1px solid ${status.warning.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: space.xs, marginBottom: space.xs }}>
              <Clock size={16} style={{ color: status.warning.text }} />
              <span style={{ fontSize: typography.helper.size, fontWeight: 600, color: status.warning.text }}>Due Today</span>
            </div>
            <div style={{ fontSize: typography.cardTitle.size, fontWeight: 700, color: status.warning.text }}>{progress.dueToday}</div>
          </div>
        )}
        
        {progress.overdue > 0 && (
          <div style={{ padding: space.sm, backgroundColor: status.danger.bg, borderRadius: '0.375rem', border: `1px solid ${status.danger.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: space.xs, marginBottom: space.xs }}>
              <AlertCircle size={16} style={{ color: status.danger.text }} />
              <span style={{ fontSize: typography.helper.size, fontWeight: 600, color: status.danger.text }}>Overdue</span>
            </div>
            <div style={{ fontSize: typography.cardTitle.size, fontWeight: 700, color: status.danger.text }}>{progress.overdue}</div>
          </div>
        )}
      </div>
    </div>
  );
});

DocumentationProgressCard.displayName = 'DocumentationProgressCard';
