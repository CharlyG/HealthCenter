/**
 * Healthcare Design System - Open Shift Queue Item
 * Displays unassigned or unfilled shifts requiring coverage
 */
import React from 'react';
import { QueueCard } from '../QueueCard';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

export type ShiftType = 'Visit' | 'On-Call' | 'Admission' | 'Recert';
export type ServiceLine = 'Skilled Nursing' | 'Physical Therapy' | 'Occupational Therapy' | 'Speech Therapy' | 'MSW' | 'Home Health Aide';

interface OpenShiftQueueItemProps {
  patient_name: string;
  shift_type: ShiftType;
  service_line: ServiceLine;
  shift_date: Date;
  shift_time: string;
  location?: string;
  hours_until_shift?: number;
  requested_clinicians?: string[];
  onClick?: () => void;
  className?: string;
}

export const OpenShiftQueueItem = React.memo(({
  patient_name,
  shift_type,
  service_line,
  shift_date,
  shift_time,
  location,
  hours_until_shift,
  requested_clinicians,
  onClick,
  className = '',
}: OpenShiftQueueItemProps) => {
  const now = new Date();
  const hoursUntil = hours_until_shift ?? Math.ceil((shift_date.getTime() - now.getTime()) / (1000 * 60 * 60));

  let priority: 'critical' | 'high' | 'medium' | 'low';
  if (hoursUntil <= 4) priority = 'critical';
  else if (hoursUntil <= 24) priority = 'high';
  else if (hoursUntil <= 48) priority = 'medium';
  else priority = 'low';

  const labels = [
    { text: service_line, variant: 'default' as const },
    { text: shift_type, variant: 'default' as const },
  ];

  if (hoursUntil <= 4) {
    labels.push({ text: 'URGENT', variant: 'danger' as const });
  }

  const description = `${shift_time}${location ? ` at ${location}` : ''}${requested_clinicians && requested_clinicians.length > 0 ? ` • Requested: ${requested_clinicians.join(', ')}` : ''}`;

  return (
    <QueueCard
      title={patient_name}
      subtitle={`${service_line} ${shift_type}`}
      description={description}
      priority={priority}
      status="new"
      dueDate={shift_date}
      icon={<Calendar className="size-5 text-blue-600" />}
      labels={labels}
      onClick={onClick}
      className={className}
    />
  );
});

OpenShiftQueueItem.displayName = 'OpenShiftQueueItem';
