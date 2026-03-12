/**
 * Signature Status Card
 * Displays signature requirements and status for orders/documents
 */
import React from 'react';
import { FileSignature, CheckCircle2, Clock, AlertCircle, User } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { textColor, surface, borderColor, space, typography, status } from '../../../design-system/semantic/tokens';

export interface SignatureRequirement {
  id: string;
  role: string;
  required: boolean;
  signedBy?: string;
  signedAt?: string;
  status: 'signed' | 'pending' | 'overdue' | 'not-required';
  dueDate?: string;
}

interface SignatureStatusCardProps {
  documentType: string;
  documentId: string;
  requirements: SignatureRequirement[];
  variant?: 'default' | 'compact';
}

export const SignatureStatusCard = React.memo(({ 
  documentType,
  documentId,
  requirements,
  variant = 'default'
}: SignatureStatusCardProps) => {
  
  const signed = requirements.filter(r => r.status === 'signed').length;
  const pending = requirements.filter(r => r.status === 'pending').length;
  const overdue = requirements.filter(r => r.status === 'overdue').length;
  const total = requirements.filter(r => r.required).length;
  
  const isComplete = signed === total;
  const hasOverdue = overdue > 0;
  
  const getStatusIcon = (req: SignatureRequirement) => {
    switch (req.status) {
      case 'signed': return CheckCircle2;
      case 'pending': return Clock;
      case 'overdue': return AlertCircle;
      default: return User;
    }
  };
  
  const getStatusColor = (req: SignatureRequirement) => {
    switch (req.status) {
      case 'signed': return status.success;
      case 'pending': return status.info;
      case 'overdue': return status.danger;
      default: return { text: textColor.muted, bg: surface.subtle, border: borderColor.default };
    }
  };
  
  if (variant === 'compact') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: space.sm,
        backgroundColor: hasOverdue ? status.danger.bg : isComplete ? status.success.bg : surface.subtle,
        border: `1px solid ${hasOverdue ? status.danger.border : isComplete ? status.success.border : borderColor.default}`,
        borderRadius: '0.375rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
          <FileSignature size={16} style={{ color: hasOverdue ? status.danger.text : isComplete ? status.success.text : textColor.secondary }} />
          <span style={{ fontSize: typography.body.size, fontWeight: 500, color: textColor.primary }}>
            Signatures
          </span>
        </div>
        <div style={{ fontSize: typography.body.size, fontWeight: 600, color: hasOverdue ? status.danger.text : isComplete ? status.success.text : textColor.primary }}>
          {signed}/{total}
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      backgroundColor: surface.elevated,
      border: `1px solid ${hasOverdue ? status.danger.border : borderColor.default}`,
      borderRadius: '0.5rem',
      padding: space.md,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md }}>
        <div>
          <h4 style={{ fontSize: typography.cardTitle.size, fontWeight: typography.cardTitle.weight, color: textColor.primary, margin: 0, marginBottom: space.xs }}>
            Signature Status
          </h4>
          <div style={{ fontSize: typography.body.size, color: textColor.secondary }}>
            {documentType} #{documentId}
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: isComplete ? status.success.text : hasOverdue ? status.danger.text : textColor.primary }}>
            {signed}/{total}
          </div>
          <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
            Signatures
          </div>
        </div>
      </div>
      
      {hasOverdue && (
        <div style={{
          padding: space.sm,
          backgroundColor: status.danger.bg,
          border: `1px solid ${status.danger.border}`,
          borderRadius: '0.375rem',
          marginBottom: space.md,
          display: 'flex',
          alignItems: 'center',
          gap: space.sm
        }}>
          <AlertCircle size={16} style={{ color: status.danger.text }} />
          <span style={{ fontSize: typography.body.size, fontWeight: 600, color: status.danger.text }}>
            {overdue} signature{overdue !== 1 ? 's' : ''} overdue
          </span>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
        {requirements.map((req) => {
          const Icon = getStatusIcon(req);
          const colors = getStatusColor(req);
          
          return (
            <div key={req.id} style={{
              padding: space.sm,
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, flex: 1 }}>
                <Icon size={16} style={{ color: colors.text }} />
                <div>
                  <div style={{ fontSize: typography.body.size, fontWeight: 500, color: textColor.primary }}>
                    {req.role}
                  </div>
                  {req.signedBy && req.signedAt && (
                    <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
                      Signed by {req.signedBy} • {new Date(req.signedAt).toLocaleString()}
                    </div>
                  )}
                  {req.status === 'pending' && req.dueDate && (
                    <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
                      Due {new Date(req.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              
              <StatusBadge status={req.status} size="sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
});

SignatureStatusCard.displayName = 'SignatureStatusCard';
