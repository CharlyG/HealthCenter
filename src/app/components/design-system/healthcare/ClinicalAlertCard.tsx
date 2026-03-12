/**
 * Clinical Alert Card
 * Displays clinical alerts with priority and actions
 * 
 * COMPLIANT WITH:
 * - HEALTHCARE_COMPONENTS.md - Standard alert display
 * - SCREEN_GENERATION.md - Uses semantic tokens
 * - WCAG 2.1 AA - High contrast alerts
 */
import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, X } from 'lucide-react';
import { PriorityIndicator } from '../PriorityIndicator';
import { 
  textColor, 
  surface, 
  borderColor, 
  space, 
  typography,
  status 
} from '../../../design-system/semantic/tokens';

export interface ClinicalAlert {
  id: string;
  type: 'vital-sign' | 'lab-result' | 'medication' | 'fall-risk' | 'infection' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: string;
  acknowledged?: boolean;
  actionRequired?: string;
}

interface ClinicalAlertCardProps {
  alert: ClinicalAlert;
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  variant?: 'default' | 'compact';
}

export const ClinicalAlertCard = React.memo(({ 
  alert, 
  onAcknowledge,
  onDismiss,
  variant = 'default'
}: ClinicalAlertCardProps) => {
  
  const getAlertConfig = () => {
    switch (alert.priority) {
      case 'critical':
        return {
          icon: AlertTriangle,
          color: status.danger,
          borderColor: status.danger.border,
          bgColor: status.danger.bg
        };
      case 'high':
        return {
          icon: AlertCircle,
          color: status.warning,
          borderColor: status.warning.border,
          bgColor: status.warning.bg
        };
      case 'medium':
        return {
          icon: Info,
          color: status.info,
          borderColor: status.info.border,
          bgColor: status.info.bg
        };
      case 'low':
        return {
          icon: Info,
          color: { ...status.info, text: textColor.secondary },
          borderColor: borderColor.default,
          bgColor: surface.subtle
        };
    }
  };
  
  const config = getAlertConfig();
  const Icon = config.icon;
  
  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };
  
  if (variant === 'compact') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: space.sm,
        padding: space.sm,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: '0.375rem',
      }}>
        <Icon size={16} style={{ color: config.color.text, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontSize: typography.body.size, 
            fontWeight: 600,
            color: textColor.primary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {alert.title}
          </div>
        </div>
        <PriorityIndicator priority={alert.priority} variant="dot" size="sm" />
      </div>
    );
  }
  
  return (
    <div style={{
      backgroundColor: surface.elevated,
      border: `2px solid ${config.borderColor}`,
      borderRadius: '0.5rem',
      padding: space.md,
      position: 'relative',
      opacity: alert.acknowledged ? 0.7 : 1
    }}>
      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={() => onDismiss(alert.id)}
          style={{
            position: 'absolute',
            top: space.sm,
            right: space.sm,
            padding: space.xs,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: textColor.muted,
            display: 'flex',
            alignItems: 'center',
            borderRadius: '0.25rem'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = surface.hover}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label="Dismiss alert"
        >
          <X size={18} />
        </button>
      )}
      
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: space.md,
        marginBottom: space.md,
        paddingRight: space.xl
      }}>
        <div style={{
          padding: space.sm,
          backgroundColor: config.bgColor,
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} style={{ color: config.color.text }} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: space.sm,
            marginBottom: space.xs
          }}>
            <h4 style={{ 
              fontSize: typography.cardTitle.size, 
              fontWeight: typography.cardTitle.weight,
              color: textColor.primary,
              margin: 0
            }}>
              {alert.title}
            </h4>
            <PriorityIndicator priority={alert.priority} variant="badge" size="sm" />
          </div>
          
          <div style={{ 
            fontSize: typography.helper.size, 
            color: textColor.muted,
            display: 'flex',
            alignItems: 'center',
            gap: space.sm
          }}>
            <span style={{ textTransform: 'capitalize' }}>
              {alert.type.replace('-', ' ')}
            </span>
            <span>•</span>
            <span>{formatTimestamp(alert.timestamp)}</span>
            {alert.acknowledged && (
              <>
                <span>•</span>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: space.xs,
                  color: status.success.text
                }}>
                  <CheckCircle2 size={14} />
                  Acknowledged
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Message */}
      <div style={{
        padding: space.md,
        backgroundColor: config.bgColor,
        borderRadius: '0.375rem',
        marginBottom: alert.actionRequired || !alert.acknowledged ? space.md : 0
      }}>
        <p style={{ 
          fontSize: typography.body.size, 
          color: textColor.primary,
          margin: 0,
          lineHeight: typography.body.lineHeight
        }}>
          {alert.message}
        </p>
      </div>
      
      {/* Action Required */}
      {alert.actionRequired && (
        <div style={{
          padding: space.sm,
          backgroundColor: surface.subtle,
          borderRadius: '0.375rem',
          marginBottom: !alert.acknowledged ? space.md : 0
        }}>
          <div style={{ 
            fontSize: typography.helper.size, 
            fontWeight: 600,
            color: textColor.secondary,
            marginBottom: space.xs,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Action Required
          </div>
          <div style={{ 
            fontSize: typography.body.size, 
            color: textColor.primary 
          }}>
            {alert.actionRequired}
          </div>
        </div>
      )}
      
      {/* Acknowledge Button */}
      {onAcknowledge && !alert.acknowledged && (
        <button
          onClick={() => onAcknowledge(alert.id)}
          style={{
            width: '100%',
            padding: `${space.sm} ${space.md}`,
            fontSize: typography.body.size,
            fontWeight: 500,
            color: 'white',
            backgroundColor: config.color.text,
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          Acknowledge Alert
        </button>
      )}
    </div>
  );
});

ClinicalAlertCard.displayName = 'ClinicalAlertCard';
