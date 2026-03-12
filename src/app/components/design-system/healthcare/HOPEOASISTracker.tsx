/**
 * Healthcare Design System - HOPE OASIS Timeline Tracker
 * Displays hospice assessment timeline and status
 */
import React from 'react';
import { FileText, Calendar, User } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { QueueCard } from '../QueueCard';

export type AssessmentType = 'HOPE' | 'OASIS-D' | 'OASIS-E';
export type AssessmentReason = 'SOC' | 'ROC' | 'Recert' | 'Transfer' | 'Discharge';

interface HOPEOASISTrackerProps {
  patient_name: string;
  patient_mrn: string;
  assessment_type: AssessmentType;
  reason: AssessmentReason;
  due_date: Date;
  assigned_clinician?: string;
  days_until_due?: number;
  onClick?: () => void;
  className?: string;
}

export const HOPEOASISTracker = React.memo(({
  patient_name,
  patient_mrn,
  assessment_type,
  reason,
  due_date,
  assigned_clinician,
  days_until_due,
  onClick,
  className = '',
}: HOPEOASISTrackerProps) => {
  const today = new Date();
  const daysUntil = days_until_due ?? Math.ceil((due_date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntil < 0;
  const isDueToday = daysUntil === 0;
  const isDueSoon = daysUntil > 0 && daysUntil <= 3;

  let priority: 'critical' | 'high' | 'medium' | 'low';
  if (isOverdue) priority = 'critical';
  else if (isDueToday) priority = 'high';
  else if (isDueSoon) priority = 'high';
  else priority = 'medium';

  const labels = [
    { text: `${assessment_type} - ${reason}`, variant: 'default' as const },
  ];

  if (isOverdue) {
    labels.push({ text: `${Math.abs(daysUntil)} days overdue`, variant: 'danger' as const });
  }

  return (
    <QueueCard
      title={patient_name}
      subtitle={`MRN: ${patient_mrn}`}
      description={`${assessment_type} assessment ${reason} due ${isOverdue ? 'was' : 'is'} ${due_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
      priority={priority}
      status={isOverdue ? 'blocked' : isDueToday ? 'in_progress' : 'new'}
      dueDate={due_date}
      assignee={assigned_clinician}
      icon={<FileText className="size-5 text-blue-600" />}
      labels={labels}
      onClick={onClick}
      className={className}
    />
  );
});

HOPEOASISTracker.displayName = 'HOPEOASISTracker';