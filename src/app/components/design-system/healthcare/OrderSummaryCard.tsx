/**
 * Order Summary Card - Clinical order display with status and actions
 */
import React from 'react';
import { FileText, User, Calendar, Clock } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { PriorityIndicator } from '../PriorityIndicator';
import { textColor, surface, borderColor, space, typography } from '../../../design-system/semantic/tokens';

export interface OrderData {
  id: string;
  type: 'skilled-nursing' | 'physical-therapy' | 'occupational-therapy' | 'speech-therapy' | 'home-health-aide' | 'medical-social-worker';
  frequency: string;
  duration?: string;
  startDate: string;
  endDate?: string;
  orderedBy: string;
  orderedDate: string;
  status: 'active' | 'pending' | 'discontinued' | 'completed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  notes?: string;
}

interface OrderSummaryCardProps {
  order: OrderData;
  onClick?: () => void;
  variant?: 'default' | 'compact';
}

const orderTypeLabels: Record<OrderData['type'], string> = {
  'skilled-nursing': 'Skilled Nursing',
  'physical-therapy': 'Physical Therapy',
  'occupational-therapy': 'Occupational Therapy',
  'speech-therapy': 'Speech Therapy',
  'home-health-aide': 'Home Health Aide',
  'medical-social-worker': 'Medical Social Worker'
};

export const OrderSummaryCard = React.memo(({ order, onClick, variant = 'default' }: OrderSummaryCardProps) => {
  if (variant === 'compact') {
    return (
      <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: space.sm, backgroundColor: surface.elevated, border: `1px solid ${borderColor.default}`, borderRadius: '0.375rem', cursor: onClick ? 'pointer' : 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
          <PriorityIndicator priority={order.priority} variant="dot" size="sm" />
          <div>
            <div style={{ fontSize: typography.body.size, fontWeight: 500, color: textColor.primary }}>{orderTypeLabels[order.type]}</div>
            <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>{order.frequency}</div>
          </div>
        </div>
        <StatusBadge status={order.status} size="sm" />
      </div>
    );
  }
  
  return (
    <div onClick={onClick} style={{ backgroundColor: surface.elevated, border: `1px solid ${borderColor.default}`, borderRadius: '0.5rem', padding: space.md, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: space.md }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, marginBottom: space.xs }}>
            <PriorityIndicator priority={order.priority} variant="badge" size="sm" />
            <h4 style={{ fontSize: typography.cardTitle.size, fontWeight: typography.cardTitle.weight, color: textColor.primary, margin: 0 }}>
              {orderTypeLabels[order.type]}
            </h4>
          </div>
          <div style={{ fontSize: typography.body.size, color: textColor.secondary }}>{order.frequency}</div>
        </div>
        <StatusBadge status={order.status} size="sm" />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: space.md, marginBottom: order.notes ? space.md : 0 }}>
        <div>
          <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>Ordered By</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
            <User size={14} style={{ color: textColor.muted }} />
            <span style={{ fontSize: typography.body.size, color: textColor.primary }}>{order.orderedBy}</span>
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>Order Date</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
            <Calendar size={14} style={{ color: textColor.muted }} />
            <span style={{ fontSize: typography.body.size, color: textColor.primary }}>{new Date(order.orderedDate).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>Start Date</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
            <Clock size={14} style={{ color: textColor.muted }} />
            <span style={{ fontSize: typography.body.size, color: textColor.primary }}>{new Date(order.startDate).toLocaleDateString()}</span>
          </div>
        </div>
        
        {order.endDate && (
          <div>
            <div style={{ fontSize: typography.helper.size, color: textColor.secondary, marginBottom: space.xs }}>End Date</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
              <Clock size={14} style={{ color: textColor.muted }} />
              <span style={{ fontSize: typography.body.size, color: textColor.primary }}>{new Date(order.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
      
      {order.notes && (
        <div style={{ marginTop: space.md, padding: space.sm, backgroundColor: surface.subtle, borderRadius: '0.375rem', fontSize: typography.body.size, color: textColor.secondary }}>
          {order.notes}
        </div>
      )}
    </div>
  );
});

OrderSummaryCard.displayName = 'OrderSummaryCard';
