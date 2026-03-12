/**
 * Healthcare Design System - Delayed Visit Alert Item
 * Tracks visits that are overdue or missed
 */
import React from 'react';
import { QueueCard } from '../QueueCard';
import { AlertTriangle, Calendar, Phone } from 'lucide-react';

export type DelayReason = 'No Show' | 'Patient Refused' | 'Patient Unavailable' | 'Clinician Unavailable' | 'Weather' | 'Other';

interface DelayedVisitAlertProps {
  patient_name: string;
  patient_mrn: string;
  patient_phone?: string;
  scheduled_date: Date;
  scheduled_time: string;
  service_type: string;
  assigned_clinician: string;
  delay_reason?: DelayReason;
  days_delayed?: number;
  last_contact_attempt?: Date;
  onClick?: () => void;
  className?: string;
}

export const DelayedVisitAlert = React.memo(({
  patient_name,
  patient_mrn,
  patient_phone,
  scheduled_date,
  scheduled_time,
  service_type,
  assigned_clinician,
  delay_reason,
  days_delayed,
  last_contact_attempt,
  onClick,
  className = '',
}: DelayedVisitAlertProps) => {
  const today = new Date();
  const daysDelayed = days_delayed ?? Math.ceil((today.getTime() - scheduled_date.getTime()) / (1000 * 60 * 60 * 24));

  let priority: 'critical' | 'high' | 'medium' | 'low';
  if (daysDelayed >= 3) priority = 'critical';
  else if (daysDelayed >= 2) priority = 'high';
  else priority = 'medium';

  const labels = [
    { text: service_type, variant: 'default' as const },
    { text: `${daysDelayed} day${daysDelayed !== 1 ? 's' : ''} delayed`, variant: 'danger' as const },
  ];

  if (delay_reason) {
    labels.push({ text: delay_reason, variant: 'warning' as const });
  }

  let description = `Originally scheduled for ${scheduled_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${scheduled_time}`;
  
  if (last_contact_attempt) {
    description += ` • Last contact: ${last_contact_attempt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  if (patient_phone) {
    description += ` • ${patient_phone}`;
  }

  return (
    <QueueCard
      title={patient_name}
      subtitle={`MRN: ${patient_mrn} • Assigned: ${assigned_clinician}`}
      description={description}
      priority={priority}
      status={daysDelayed >= 3 ? 'blocked' : 'in_progress'}
      icon={<AlertTriangle className="size-5 text-red-600" />}
      labels={labels}
      onClick={onClick}
      actions={
        patient_phone && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `tel:${patient_phone}`;
            }}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Call patient"
          >
            <Phone className="size-4 text-blue-600" />
          </button>
        )
      }
      className={className}
    />
  );
});

DelayedVisitAlert.displayName = 'DelayedVisitAlert';
