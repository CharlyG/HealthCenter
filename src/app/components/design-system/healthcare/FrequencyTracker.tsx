/**
 * Frequency Tracker
 * Displays visit frequency compliance and tracking
 * 
 * COMPLIANT WITH:
 * - HEALTHCARE_COMPONENTS.md - Standard frequency tracking
 * - SCREEN_GENERATION.md - Uses semantic tokens
 * - WCAG 2.1 AA - Accessible indicators
 */
import React from 'react';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { 
  textColor, 
  surface, 
  borderColor, 
  space, 
  typography,
  status 
} from '../../../design-system/semantic/tokens';

export interface FrequencyData {
  discipline: string;
  ordered: string; // e.g., "3x/week" or "PRN"
  scheduled: number;
  completed: number;
  missed: number;
  compliancePercentage: number;
  nextVisitDue?: string;
  status: 'compliant' | 'at-risk' | 'non-compliant';
}

interface FrequencyTrackerProps {
  frequencies: FrequencyData[];
  variant?: 'default' | 'compact';
}

export const FrequencyTracker = React.memo(({ 
  frequencies, 
  variant = 'default' 
}: FrequencyTrackerProps) => {
  
  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return status.success;
    if (percentage >= 75) return status.warning;
    return status.danger;
  };
  
  const getStatusInfo = (freq: FrequencyData) => {
    switch (freq.status) {
      case 'compliant':
        return { icon: CheckCircle2, color: status.success.text };
      case 'at-risk':
        return { icon: AlertTriangle, color: status.warning.text };
      case 'non-compliant':
        return { icon: AlertTriangle, color: status.danger.text };
    }
  };
  
  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
        {frequencies.map((freq, idx) => {
          const statusInfo = getStatusInfo(freq);
          const Icon = statusInfo.icon;
          
          return (
            <div 
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: space.sm,
                backgroundColor: surface.subtle,
                borderRadius: '0.375rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
                <Icon size={16} style={{ color: statusInfo.color }} />
                <span style={{ 
                  fontSize: typography.body.size, 
                  fontWeight: 500,
                  color: textColor.primary 
                }}>
                  {freq.discipline}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: space.md }}>
                <span style={{ 
                  fontSize: typography.helper.size, 
                  color: textColor.secondary 
                }}>
                  {freq.completed}/{freq.scheduled}
                </span>
                <span style={{ 
                  fontSize: typography.body.size, 
                  fontWeight: 600,
                  color: getComplianceColor(freq.compliancePercentage).text
                }}>
                  {freq.compliancePercentage}%
                </span>
              </div>
            </div>
          );
        })}
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
      <h4 style={{ 
        fontSize: typography.cardTitle.size, 
        fontWeight: typography.cardTitle.weight,
        color: textColor.primary,
        margin: 0,
        marginBottom: space.md,
        display: 'flex',
        alignItems: 'center',
        gap: space.sm
      }}>
        <Calendar size={20} />
        Visit Frequency Compliance
      </h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
        {frequencies.map((freq, idx) => {
          const statusInfo = getStatusInfo(freq);
          const Icon = statusInfo.icon;
          const complianceColor = getComplianceColor(freq.compliancePercentage);
          
          return (
            <div 
              key={idx}
              style={{
                padding: space.md,
                backgroundColor: surface.subtle,
                borderRadius: '0.375rem',
                border: `1px solid ${borderColor.subtle}`,
              }}
            >
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: space.sm
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
                  <Icon size={18} style={{ color: statusInfo.color }} />
                  <span style={{ 
                    fontSize: typography.cardTitle.size, 
                    fontWeight: 600,
                    color: textColor.primary 
                  }}>
                    {freq.discipline}
                  </span>
                  <StatusBadge status={freq.status} size="sm" />
                </div>
                
                <div style={{
                  fontSize: typography.helper.size,
                  color: textColor.secondary,
                  fontWeight: 500
                }}>
                  Ordered: {freq.ordered}
                </div>
              </div>
              
              {/* Stats Row */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: space.md,
                marginBottom: space.sm
              }}>
                <div>
                  <div style={{ 
                    fontSize: typography.helper.size, 
                    color: textColor.secondary,
                    marginBottom: space.xs
                  }}>
                    Scheduled
                  </div>
                  <div style={{ 
                    fontSize: typography.cardTitle.size, 
                    fontWeight: 600,
                    color: textColor.primary 
                  }}>
                    {freq.scheduled}
                  </div>
                </div>
                
                <div>
                  <div style={{ 
                    fontSize: typography.helper.size, 
                    color: textColor.secondary,
                    marginBottom: space.xs
                  }}>
                    Completed
                  </div>
                  <div style={{ 
                    fontSize: typography.cardTitle.size, 
                    fontWeight: 600,
                    color: status.success.text 
                  }}>
                    {freq.completed}
                  </div>
                </div>
                
                <div>
                  <div style={{ 
                    fontSize: typography.helper.size, 
                    color: textColor.secondary,
                    marginBottom: space.xs
                  }}>
                    Missed
                  </div>
                  <div style={{ 
                    fontSize: typography.cardTitle.size, 
                    fontWeight: 600,
                    color: freq.missed > 0 ? status.danger.text : textColor.primary 
                  }}>
                    {freq.missed}
                  </div>
                </div>
                
                <div>
                  <div style={{ 
                    fontSize: typography.helper.size, 
                    color: textColor.secondary,
                    marginBottom: space.xs
                  }}>
                    Compliance
                  </div>
                  <div style={{ 
                    fontSize: typography.cardTitle.size, 
                    fontWeight: 600,
                    color: complianceColor.text 
                  }}>
                    {freq.compliancePercentage}%
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: surface.default,
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: space.sm
              }}>
                <div style={{
                  width: `${freq.compliancePercentage}%`,
                  height: '100%',
                  backgroundColor: complianceColor.text,
                  transition: 'width 0.3s ease',
                  borderRadius: '4px'
                }} />
              </div>
              
              {/* Next Visit */}
              {freq.nextVisitDue && (
                <div style={{ 
                  fontSize: typography.body.size, 
                  color: textColor.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: space.xs
                }}>
                  <TrendingUp size={14} />
                  Next visit due: {freq.nextVisitDue}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

FrequencyTracker.displayName = 'FrequencyTracker';
