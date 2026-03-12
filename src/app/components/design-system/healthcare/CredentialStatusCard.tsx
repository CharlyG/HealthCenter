/**
 * Credential Status Card
 * Displays credential expiration and compliance status
 */
import React from 'react';
import { Award, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import { textColor, surface, borderColor, space, typography, status } from '../../../design-system/semantic/tokens';

export interface CredentialData {
  type: string;
  number?: string;
  issuedDate: string;
  expirationDate: string;
  status: 'active' | 'expiring-soon' | 'expired' | 'pending-renewal';
  daysUntilExpiration: number;
}

interface CredentialStatusCardProps {
  credentials: CredentialData[];
  caregiverName?: string;
  variant?: 'default' | 'compact';
}

export const CredentialStatusCard = React.memo(({ credentials, caregiverName, variant = 'default' }: CredentialStatusCardProps) => {
  const expired = credentials.filter(c => c.status === 'expired').length;
  const expiringSoon = credentials.filter(c => c.status === 'expiring-soon').length;
  const active = credentials.filter(c => c.status === 'active').length;
  const hasIssues = expired > 0 || expiringSoon > 0;
  
  const getCredentialColor = (cred: CredentialData) => {
    switch (cred.status) {
      case 'active': return status.success;
      case 'expiring-soon': return status.warning;
      case 'expired': return status.danger;
      case 'pending-renewal': return status.info;
    }
  };
  
  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: space.sm, backgroundColor: hasIssues ? status.warning.bg : status.success.bg, border: `1px solid ${hasIssues ? status.warning.border : status.success.border}`, borderRadius: '0.375rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
          <Award size={16} style={{ color: hasIssues ? status.warning.text : status.success.text }} />
          <span style={{ fontSize: typography.body.size, fontWeight: 500, color: textColor.primary }}>Credentials</span>
        </div>
        <span style={{ fontSize: typography.body.size, fontWeight: 600, color: hasIssues ? status.warning.text : status.success.text }}>
          {active}/{credentials.length}
        </span>
      </div>
    );
  }
  
  return (
    <div style={{ backgroundColor: surface.elevated, border: `1px solid ${hasIssues ? status.warning.border : borderColor.default}`, borderRadius: '0.5rem', padding: space.md }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md }}>
        <div>
          <h4 style={{ fontSize: typography.cardTitle.size, fontWeight: typography.cardTitle.weight, color: textColor.primary, margin: 0 }}>
            Credentials
          </h4>
          {caregiverName && <div style={{ fontSize: typography.body.size, color: textColor.secondary }}>{caregiverName}</div>}
        </div>
        {hasIssues && (
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs, padding: `${space.xs} ${space.sm}`, backgroundColor: status.warning.bg, borderRadius: '0.375rem' }}>
            <AlertTriangle size={16} style={{ color: status.warning.text }} />
            <span style={{ fontSize: typography.body.size, fontWeight: 600, color: status.warning.text }}>
              {expired + expiringSoon} Issue{expired + expiringSoon !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: space.sm, marginBottom: space.md }}>
        <div style={{ flex: 1, padding: space.sm, backgroundColor: status.success.bg, borderRadius: '0.375rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: status.success.text }}>{active}</div>
          <div style={{ fontSize: typography.helper.size, color: status.success.text }}>Active</div>
        </div>
        {expiringSoon > 0 && (
          <div style={{ flex: 1, padding: space.sm, backgroundColor: status.warning.bg, borderRadius: '0.375rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: status.warning.text }}>{expiringSoon}</div>
            <div style={{ fontSize: typography.helper.size, color: status.warning.text }}>Expiring</div>
          </div>
        )}
        {expired > 0 && (
          <div style={{ flex: 1, padding: space.sm, backgroundColor: status.danger.bg, borderRadius: '0.375rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: status.danger.text }}>{expired}</div>
            <div style={{ fontSize: typography.helper.size, color: status.danger.text }}>Expired</div>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
        {credentials.map((cred, idx) => {
          const colors = getCredentialColor(cred);
          const Icon = cred.status === 'expired' || cred.status === 'expiring-soon' ? AlertTriangle : CheckCircle2;
          
          return (
            <div key={idx} style={{ padding: space.sm, backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '0.375rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
                  <Icon size={16} style={{ color: colors.text }} />
                  <div>
                    <div style={{ fontSize: typography.body.size, fontWeight: 500, color: textColor.primary }}>{cred.type}</div>
                    {cred.number && <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>{cred.number}</div>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
                    <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Expires {new Date(cred.expirationDate).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: typography.helper.size, fontWeight: 600, color: colors.text }}>
                    {cred.daysUntilExpiration > 0 ? `${cred.daysUntilExpiration} days` : 'Expired'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

CredentialStatusCard.displayName = 'CredentialStatusCard';
