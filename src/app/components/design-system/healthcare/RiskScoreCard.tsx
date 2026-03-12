/**
 * Risk Score Card
 * Displays patient risk assessment scores with trending
 */
import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { textColor, surface, borderColor, space, typography, status } from '../../../design-system/semantic/tokens';

export interface RiskScore {
  category: 'fall-risk' | 'hospitalization' | 'readmission' | 'pressure-ulcer' | 'infection';
  score: number; // 0-100
  level: 'low' | 'moderate' | 'high' | 'critical';
  trend: 'increasing' | 'decreasing' | 'stable';
  lastAssessed: string;
  factors?: string[];
}

interface RiskScoreCardProps {
  scores: RiskScore[];
  patientName?: string;
  variant?: 'default' | 'compact';
}

const categoryLabels: Record<RiskScore['category'], string> = {
  'fall-risk': 'Fall Risk',
  'hospitalization': 'Hospitalization Risk',
  'readmission': 'Readmission Risk',
  'pressure-ulcer': 'Pressure Ulcer Risk',
  'infection': 'Infection Risk'
};

export const RiskScoreCard = React.memo(({ scores, patientName, variant = 'default' }: RiskScoreCardProps) => {
  const getRiskColor = (level: RiskScore['level']) => {
    switch (level) {
      case 'low': return status.success;
      case 'moderate': return status.warning;
      case 'high': return status.danger;
      case 'critical': return status.danger;
    }
  };
  
  const getTrendIcon = (trend: RiskScore['trend']) => {
    switch (trend) {
      case 'increasing': return TrendingUp;
      case 'decreasing': return TrendingDown;
      case 'stable': return Minus;
    }
  };
  
  const getTrendColor = (trend: RiskScore['trend']) => {
    switch (trend) {
      case 'increasing': return status.danger.text;
      case 'decreasing': return status.success.text;
      case 'stable': return textColor.secondary;
    }
  };
  
  const highRiskCount = scores.filter(s => s.level === 'high' || s.level === 'critical').length;
  
  if (variant === 'compact') {
    return (
      <div style={{
        padding: space.md,
        backgroundColor: surface.elevated,
        border: `1px solid ${highRiskCount > 0 ? status.danger.border : borderColor.default}`,
        borderRadius: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: typography.cardTitle.size, fontWeight: typography.cardTitle.weight, color: textColor.primary }}>
              Risk Assessment
            </div>
            {patientName && <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>{patientName}</div>}
          </div>
          {highRiskCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: space.xs, padding: `${space.xs} ${space.sm}`, backgroundColor: status.danger.bg, borderRadius: '0.375rem' }}>
              <AlertTriangle size={16} style={{ color: status.danger.text }} />
              <span style={{ fontSize: typography.body.size, fontWeight: 600, color: status.danger.text }}>
                {highRiskCount} High Risk
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      backgroundColor: surface.elevated,
      border: `1px solid ${highRiskCount > 0 ? status.danger.border : borderColor.default}`,
      borderRadius: '0.5rem',
      padding: space.md,
    }}>
      <div style={{ marginBottom: space.md }}>
        <h4 style={{ fontSize: typography.cardTitle.size, fontWeight: typography.cardTitle.weight, color: textColor.primary, margin: 0 }}>
          Risk Assessment
        </h4>
        {patientName && <div style={{ fontSize: typography.body.size, color: textColor.secondary, marginTop: space.xs }}>{patientName}</div>}
      </div>
      
      {highRiskCount > 0 && (
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
          <AlertTriangle size={18} style={{ color: status.danger.text }} />
          <span style={{ fontSize: typography.body.size, fontWeight: 600, color: status.danger.text }}>
            {highRiskCount} high risk area{highRiskCount !== 1 ? 's' : ''} identified - immediate attention required
          </span>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
        {scores.map((risk, idx) => {
          const colors = getRiskColor(risk.level);
          const TrendIcon = getTrendIcon(risk.trend);
          const trendColor = getTrendColor(risk.trend);
          
          return (
            <div key={idx} style={{
              padding: space.md,
              backgroundColor: surface.subtle,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.375rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: space.sm }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: typography.body.size, fontWeight: 600, color: textColor.primary, marginBottom: space.xs }}>
                    {categoryLabels[risk.category]}
                  </div>
                  <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
                    Last assessed: {new Date(risk.lastAssessed).toLocaleDateString()}
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: colors.text }}>
                    {risk.score}
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: space.xs,
                    padding: `2px ${space.sm}`,
                    backgroundColor: colors.bg,
                    borderRadius: '12px',
                    fontSize: typography.helper.size,
                    fontWeight: 600,
                    color: colors.text,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {risk.level}
                  </div>
                </div>
              </div>
              
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: surface.default,
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: space.sm
              }}>
                <div style={{
                  width: `${risk.score}%`,
                  height: '100%',
                  backgroundColor: colors.text,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
                <TrendIcon size={14} style={{ color: trendColor }} />
                <span style={{ fontSize: typography.helper.size, color: trendColor, textTransform: 'capitalize' }}>
                  {risk.trend}
                </span>
              </div>
              
              {risk.factors && risk.factors.length > 0 && (
                <div style={{ marginTop: space.sm, paddingTop: space.sm, borderTop: `1px solid ${borderColor.subtle}` }}>
                  <div style={{ fontSize: typography.helper.size, fontWeight: 600, color: textColor.secondary, marginBottom: space.xs }}>
                    Contributing Factors:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: space.md, fontSize: typography.helper.size, color: textColor.secondary }}>
                    {risk.factors.map((factor, i) => (
                      <li key={i}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

RiskScoreCard.displayName = 'RiskScoreCard';
