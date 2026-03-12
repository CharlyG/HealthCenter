/**
 * Medication Summary Card
 * Displays medication summary with alerts and status
 * 
 * COMPLIANT WITH:
 * - HEALTHCARE_COMPONENTS.md - Standard medication display
 * - SCREEN_GENERATION.md - Uses semantic tokens
 * - WCAG 2.1 AA - Accessible alerts
 */
import React from 'react';
import { Pill, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { PriorityIndicator } from '../PriorityIndicator';
import { 
  textColor, 
  surface, 
  borderColor, 
  space, 
  typography,
  status 
} from '../../../design-system/semantic/tokens';

export interface MedicationData {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  lastReviewDate?: string;
  alerts?: {
    type: 'high-risk' | 'interaction' | 'duplicate' | 'review-needed';
    message: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
  }[];
  status: 'active' | 'discontinued' | 'on-hold';
}

interface MedicationSummaryCardProps {
  medications: MedicationData[];
  variant?: 'default' | 'compact';
  showAlerts?: boolean;
  maxDisplay?: number;
}

export const MedicationSummaryCard = React.memo(({ 
  medications, 
  variant = 'default',
  showAlerts = true,
  maxDisplay = 5
}: MedicationSummaryCardProps) => {
  
  const displayMeds = medications.slice(0, maxDisplay);
  const hasMore = medications.length > maxDisplay;
  
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'high-risk':
      case 'interaction':
        return status.danger;
      case 'duplicate':
      case 'review-needed':
        return status.warning;
      default:
        return status.info;
    }
  };
  
  const totalAlerts = medications.reduce((sum, med) => sum + (med.alerts?.length || 0), 0);
  const criticalAlerts = medications.filter(m => 
    m.alerts?.some(a => a.priority === 'critical')
  ).length;
  
  if (variant === 'compact') {
    return (
      <div style={{
        padding: space.md,
        backgroundColor: surface.elevated,
        border: `1px solid ${borderColor.default}`,
        borderRadius: '0.5rem',
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: space.sm
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
            <Pill size={18} style={{ color: textColor.secondary }} />
            <span style={{ 
              fontSize: typography.cardTitle.size, 
              fontWeight: 600,
              color: textColor.primary 
            }}>
              Medications ({medications.length})
            </span>
          </div>
          
          {totalAlerts > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: space.xs,
              padding: `${space.xs} ${space.sm}`,
              backgroundColor: status.warning.bg,
              borderRadius: '0.375rem',
            }}>
              <AlertTriangle size={14} style={{ color: status.warning.text }} />
              <span style={{ 
                fontSize: typography.helper.size, 
                fontWeight: 600,
                color: status.warning.text 
              }}>
                {totalAlerts} Alert{totalAlerts !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        
        <div style={{ fontSize: typography.body.size, color: textColor.secondary }}>
          Active: {medications.filter(m => m.status === 'active').length}
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
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: space.md,
        paddingBottom: space.md,
        borderBottom: `1px solid ${borderColor.subtle}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
          <Pill size={20} />
          <h4 style={{ 
            fontSize: typography.cardTitle.size, 
            fontWeight: typography.cardTitle.weight,
            color: textColor.primary,
            margin: 0
          }}>
            Current Medications
          </h4>
          <span style={{
            padding: `2px 8px`,
            backgroundColor: surface.subtle,
            borderRadius: '12px',
            fontSize: typography.helper.size,
            fontWeight: 500,
            color: textColor.secondary
          }}>
            {medications.length}
          </span>
        </div>
        
        {criticalAlerts > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: space.xs,
            padding: `${space.xs} ${space.sm}`,
            backgroundColor: status.danger.bg,
            border: `1px solid ${status.danger.border}`,
            borderRadius: '0.375rem',
          }}>
            <AlertTriangle size={16} style={{ color: status.danger.text }} />
            <span style={{ 
              fontSize: typography.body.size, 
              fontWeight: 600,
              color: status.danger.text 
            }}>
              {criticalAlerts} Critical Alert{criticalAlerts !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      
      {/* Medications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
        {displayMeds.map((med) => (
          <div 
            key={med.id}
            style={{
              padding: space.md,
              backgroundColor: surface.subtle,
              borderRadius: '0.375rem',
              border: med.alerts && med.alerts.length > 0 
                ? `1px solid ${status.warning.border}`
                : `1px solid ${borderColor.subtle}`,
            }}
          >
            {/* Medication Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              justifyContent: 'space-between',
              marginBottom: space.sm
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: typography.body.size, 
                  fontWeight: 600,
                  color: textColor.primary,
                  marginBottom: space.xs
                }}>
                  {med.name}
                </div>
                <div style={{ 
                  fontSize: typography.body.size, 
                  color: textColor.secondary 
                }}>
                  {med.dosage} | {med.frequency} | {med.route}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: space.sm
              }}>
                {med.status === 'active' && (
                  <CheckCircle2 size={16} style={{ color: status.success.text }} />
                )}
                {med.status === 'on-hold' && (
                  <Clock size={16} style={{ color: status.warning.text }} />
                )}
              </div>
            </div>
            
            {/* Alerts */}
            {showAlerts && med.alerts && med.alerts.length > 0 && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: space.xs,
                marginTop: space.sm,
                paddingTop: space.sm,
                borderTop: `1px solid ${borderColor.subtle}`
              }}>
                {med.alerts.map((alert, idx) => {
                  const alertColor = getAlertColor(alert.type);
                  
                  return (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: space.sm,
                        padding: space.sm,
                        backgroundColor: alertColor.bg,
                        border: `1px solid ${alertColor.border}`,
                        borderRadius: '0.375rem',
                      }}
                    >
                      <PriorityIndicator 
                        priority={alert.priority} 
                        variant="dot"
                        size="sm"
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: typography.helper.size, 
                          fontWeight: 600,
                          color: alertColor.text,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: space.xs
                        }}>
                          {alert.type.replace('-', ' ')}
                        </div>
                        <div style={{ 
                          fontSize: typography.body.size, 
                          color: textColor.primary 
                        }}>
                          {alert.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Last Review */}
            {med.lastReviewDate && (
              <div style={{ 
                marginTop: space.sm,
                fontSize: typography.helper.size, 
                color: textColor.muted 
              }}>
                Last reviewed: {new Date(med.lastReviewDate).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
        
        {hasMore && (
          <div style={{ 
            textAlign: 'center',
            padding: space.sm,
            fontSize: typography.body.size,
            color: textColor.link,
            cursor: 'pointer'
          }}>
            + {medications.length - maxDisplay} more medications
          </div>
        )}
      </div>
    </div>
  );
});

MedicationSummaryCard.displayName = 'MedicationSummaryCard';
