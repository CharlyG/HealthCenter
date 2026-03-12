/**
 * QA Queue Item
 * Standard queue item for QA review workflows
 */
import React from 'react';
import { FileText, User, Calendar, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { PriorityIndicator } from '../PriorityIndicator';
import { textColor, surface, borderColor, space, typography, status } from '../../../design-system/semantic/tokens';

export interface QAQueueItemData {
  id: string;
  documentType: string;
  patientName: string;
  patientMrn: string;
  submittedBy: string;
  submittedAt: string;
  assignedTo?: string;
  dueDate: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-review' | 'completed' | 'returned';
  findings?: number;
  daysInQueue: number;
}

interface QAQueueItemProps {
  item: QAQueueItemData;
  onClick?: () => void;
  variant?: 'default' | 'compact';
}

export const QAQueueItem = React.memo(({ 
  item, 
  onClick,
  variant = 'default'
}: QAQueueItemProps) => {
  
  const isOverdue = new Date(item.dueDate) < new Date();
  const isDueSoon = !isOverdue && new Date(item.dueDate).getTime() - new Date().getTime() < 86400000; // 24h
  
  if (variant === 'compact') {
    return (
      <div 
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: space.sm,
          backgroundColor: surface.elevated,
          border: `1px solid ${borderColor.default}`,
          borderRadius: '0.375rem',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'background-color 0.15s'
        }}
        onMouseEnter={(e) => onClick && (e.currentTarget.style.backgroundColor = surface.hover)}
        onMouseLeave={(e) => onClick && (e.currentTarget.style.backgroundColor = surface.elevated)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
          <PriorityIndicator priority={item.priority} variant="dot" size="sm" />
          <div>
            <div style={{ fontSize: typography.body.size, fontWeight: 500, color: textColor.primary }}>
              {item.patientName}
            </div>
            <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
              {item.documentType}
            </div>
          </div>
        </div>
        <StatusBadge status={item.status} size="sm" />
      </div>
    );
  }
  
  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: surface.elevated,
        border: `1px solid ${isOverdue ? status.danger.border : isDueSoon ? status.warning.border : borderColor.default}`,
        borderRadius: '0.5rem',
        padding: space.md,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = surface.hover;
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = surface.elevated;
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: space.md }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, marginBottom: space.xs }}>
            <PriorityIndicator priority={item.priority} variant="badge" size="sm" />
            <h4 style={{ fontSize: typography.cardTitle.size, fontWeight: typography.cardTitle.weight, color: textColor.primary, margin: 0 }}>
              {item.patientName}
            </h4>
          </div>
          <div style={{ fontSize: typography.body.size, color: textColor.secondary }}>
            MRN: {item.patientMrn}
          </div>
        </div>
        
        <StatusBadge status={item.status} size="sm" />
      </div>
      
      {/* Document Type */}
      <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, marginBottom: space.md, padding: space.sm, backgroundColor: surface.subtle, borderRadius: '0.375rem' }}>
        <FileText size={16} style={{ color: textColor.secondary }} />
        <span style={{ fontSize: typography.body.size, fontWeight: 500, color: textColor.primary }}>
          {item.documentType}
        </span>
      </div>
      
      {/* Metadata Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: space.md, marginBottom: space.md }}>
        <div>
          <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>
            Submitted By
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
            <User size={14} style={{ color: textColor.muted }} />
            <span style={{ fontSize: typography.body.size, color: textColor.primary }}>
              {item.submittedBy}
            </span>
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>
            Submitted
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
            <Calendar size={14} style={{ color: textColor.muted }} />
            <span style={{ fontSize: typography.body.size, color: textColor.primary }}>
              {new Date(item.submittedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {item.assignedTo && (
          <div>
            <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>
              Assigned To
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
              <User size={14} style={{ color: textColor.muted }} />
              <span style={{ fontSize: typography.body.size, color: textColor.primary }}>
                {item.assignedTo}
              </span>
            </div>
          </div>
        )}
        
        <div>
          <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>
            Due Date
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
            <Calendar size={14} style={{ color: isOverdue ? status.danger.text : isDueSoon ? status.warning.text : textColor.muted }} />
            <span style={{ fontSize: typography.body.size, fontWeight: isOverdue || isDueSoon ? 600 : 400, color: isOverdue ? status.danger.text : isDueSoon ? status.warning.text : textColor.primary }}>
              {new Date(item.dueDate).toLocaleDateString()}
              {isOverdue && ' (Overdue)'}
              {isDueSoon && ' (Due Soon)'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: space.md, borderTop: `1px solid ${borderColor.subtle}` }}>
        <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
          {item.daysInQueue} day{item.daysInQueue !== 1 ? 's' : ''} in queue
        </div>
        
        {item.findings !== undefined && item.findings > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs, padding: `${space.xs} ${space.sm}`, backgroundColor: status.warning.bg, borderRadius: '0.375rem' }}>
            <AlertTriangle size={14} style={{ color: status.warning.text }} />
            <span style={{ fontSize: typography.helper.size, fontWeight: 600, color: status.warning.text }}>
              {item.findings} Finding{item.findings !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

QAQueueItem.displayName = 'QAQueueItem';
