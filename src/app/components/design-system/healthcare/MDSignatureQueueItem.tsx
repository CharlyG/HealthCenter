/**
 * Healthcare Design System - Medical Director Signature Queue Item
 * Tracks documents requiring MD signature
 */
import React from 'react';
import { QueueCard } from '../QueueCard';
import { FileSignature, User, Calendar } from 'lucide-react';

export type DocumentType = 'Plan of Care' | '485' | 'Orders' | 'Recertification' | 'Discharge Summary';

interface MDSignatureQueueItemProps {
  patient_name: string;
  patient_mrn: string;
  document_type: DocumentType;
  submitted_date: Date;
  medical_director?: string;
  days_pending?: number;
  admission_date?: string;
  onClick?: () => void;
  className?: string;
}

export const MDSignatureQueueItem = React.memo(({
  patient_name,
  patient_mrn,
  document_type,
  submitted_date,
  medical_director,
  days_pending,
  admission_date,
  onClick,
  className = '',
}: MDSignatureQueueItemProps) => {
  const today = new Date();
  const daysPending = days_pending ?? Math.ceil((today.getTime() - submitted_date.getTime()) / (1000 * 60 * 60 * 24));

  let priority: 'critical' | 'high' | 'medium' | 'low';
  if (daysPending >= 5) priority = 'critical';
  else if (daysPending >= 3) priority = 'high';
  else priority = 'medium';

  const labels = [
    { text: document_type, variant: 'default' as const },
    { text: `${daysPending} day${daysPending !== 1 ? 's' : ''} pending`, variant: daysPending >= 5 ? 'danger' as const : daysPending >= 3 ? 'warning' as const : 'default' as const },
  ];

  return (
    <QueueCard
      title={`${patient_name} - ${document_type}`}
      subtitle={`MRN: ${patient_mrn}${admission_date ? ` • Admitted: ${admission_date}` : ''}`}
      description={`Submitted for signature on ${submitted_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
      priority={priority}
      status={daysPending >= 5 ? 'blocked' : 'in_progress'}
      assignee={medical_director}
      icon={<FileSignature className="size-5 text-purple-600" />}
      labels={labels}
      onClick={onClick}
      className={className}
    />
  );
});

MDSignatureQueueItem.displayName = 'MDSignatureQueueItem';
