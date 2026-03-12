/**
 * Credential Renewal Workflow
 * 
 * Complete workflow for renewing expiring credentials including document upload,
 * expiration date updates, and progress tracking.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  RefreshCw,
  Upload,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Credential, CredentialType } from '../../lib/credentialTypes';
import { CREDENTIAL_TYPE_CONFIG } from '../../lib/credentialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type RenewalStatus =
  | 'not-started'
  | 'document-uploaded'
  | 'under-review'
  | 'approved'
  | 'rejected';

export interface CredentialRenewal {
  id: string;
  credentialId: string;
  credentialType: CredentialType;
  currentExpirationDate: string;
  newExpirationDate?: string;
  status: RenewalStatus;
  uploadedDocumentUrl?: string;
  uploadedDocumentName?: string;
  uploadDate?: string;
  uploadedBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  initiatedBy: string;
  initiatedAt: string;
  completedAt?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// RENEWAL WORKFLOW MODAL
// ═══════════════════════════════════════════════════════════════════════════

interface CredentialRenewalWorkflowProps {
  credential: Credential;
  renewal?: CredentialRenewal;
  onUploadDocument?: (file: File) => void;
  onUpdateExpiration?: (newDate: string) => void;
  onSubmitForReview?: () => void;
  onApprove?: (notes: string) => void;
  onReject?: (notes: string) => void;
  onCancel?: () => void;
}

export default function CredentialRenewalWorkflow({
  credential,
  renewal,
  onUploadDocument,
  onUpdateExpiration,
  onSubmitForReview,
  onApprove,
  onReject,
  onCancel,
}: CredentialRenewalWorkflowProps) {
  const [newExpirationDate, setNewExpirationDate] = useState(
    renewal?.newExpirationDate || ''
  );
  const [reviewNotes, setReviewNotes] = useState('');

  const config = CREDENTIAL_TYPE_CONFIG[credential.credentialType];
  const daysUntilExpiration = Math.ceil(
    (new Date(credential.expirationDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const steps = [
    {
      key: 'upload',
      label: 'Upload Document',
      status: renewal?.uploadedDocumentUrl ? 'complete' : 'pending',
    },
    {
      key: 'update-date',
      label: 'Update Expiration',
      status: renewal?.newExpirationDate ? 'complete' : 'pending',
    },
    {
      key: 'review',
      label: 'Review & Approve',
      status:
        renewal?.status === 'approved'
          ? 'complete'
          : renewal?.status === 'under-review'
          ? 'active'
          : 'pending',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl">
              {config.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Credential Renewal</h2>
              <p className="text-sm text-gray-600">{config.label}</p>
            </div>
          </div>

          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Current Status */}
        <div className="mt-4 p-4 bg-white rounded-lg border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-600 mb-1">Current Expiration</div>
              <div className={cn(
                'font-medium',
                daysUntilExpiration < 0
                  ? 'text-red-700'
                  : daysUntilExpiration <= 30
                  ? 'text-amber-700'
                  : 'text-gray-900'
              )}>
                {new Date(credential.expirationDate).toLocaleDateString()}
                {daysUntilExpiration < 0 && (
                  <span className="ml-2 text-xs">(Expired)</span>
                )}
                {daysUntilExpiration >= 0 && daysUntilExpiration <= 30 && (
                  <span className="ml-2 text-xs">({daysUntilExpiration}d)</span>
                )}
              </div>
            </div>

            {credential.credentialNumber && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Credential Number</div>
                <div className="font-medium text-gray-900">{credential.credentialNumber}</div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Progress Steps */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Renewal Progress</h3>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <RenewalStep
              key={step.key}
              step={step}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </Card>

      {/* Upload Document */}
      {(!renewal || renewal.status === 'not-started') && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Renewal Document
          </h3>

          {renewal?.uploadedDocumentUrl ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Document Uploaded</span>
              </div>
              <div className="text-sm text-green-800">
                {renewal.uploadedDocumentName} •{' '}
                {new Date(renewal.uploadDate!).toLocaleDateString()} •{' '}
                Uploaded by {renewal.uploadedBy}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-4">
                Upload the renewed credential document (PDF, JPG, PNG)
              </p>
              <Button onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && onUploadDocument) {
                    onUploadDocument(file);
                  }
                }}
              />
            </div>
          )}
        </Card>
      )}

      {/* Update Expiration Date */}
      {renewal?.uploadedDocumentUrl && !renewal.newExpirationDate && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Update Expiration Date
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Expiration Date
              </label>
              <input
                type="date"
                value={newExpirationDate}
                onChange={(e) => setNewExpirationDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <Button
              onClick={() => {
                if (newExpirationDate && onUpdateExpiration) {
                  onUpdateExpiration(newExpirationDate);
                }
              }}
              disabled={!newExpirationDate}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Update Expiration Date
            </Button>
          </div>
        </Card>
      )}

      {/* Review & Approve */}
      {renewal?.newExpirationDate && renewal.status !== 'approved' && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Review & Approve
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-900 mb-2">
                <strong>New Expiration Date:</strong>{' '}
                {new Date(renewal.newExpirationDate).toLocaleDateString()}
              </div>
              <div className="text-sm text-blue-800">
                Valid for{' '}
                {Math.ceil(
                  (new Date(renewal.newExpirationDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                days from today
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Notes (Optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Add any notes about this renewal..."
              />
            </div>

            <div className="flex items-center gap-2">
              {onApprove && (
                <Button
                  onClick={() => onApprove(reviewNotes)}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve Renewal
                </Button>
              )}

              {onReject && (
                <Button
                  variant="outline"
                  onClick={() => onReject(reviewNotes)}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Completed Status */}
      {renewal?.status === 'approved' && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Renewal Completed</h3>
              <p className="text-sm text-green-800">
                Credential renewed successfully on{' '}
                {new Date(renewal.completedAt!).toLocaleDateString()}
              </p>
            </div>
          </div>

          {renewal.reviewNotes && (
            <div className="p-3 bg-white rounded-lg border border-green-200">
              <div className="text-xs text-gray-600 mb-1">Review Notes:</div>
              <div className="text-sm text-gray-900">{renewal.reviewNotes}</div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RENEWAL STEP
// ═══════════════════════════════════════════════════════════════════════════

function RenewalStep({
  step,
  isLast,
}: {
  step: { label: string; status: string };
  isLast: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
            step.status === 'complete'
              ? 'bg-green-100 text-green-700'
              : step.status === 'active'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-500'
          )}
        >
          {step.status === 'complete' ? (
            <CheckCircle className="w-5 h-5" />
          ) : step.status === 'active' ? (
            <Clock className="w-5 h-5" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-gray-400" />
          )}
        </div>
        {!isLast && (
          <div className={cn(
            'w-0.5 h-12 mt-1',
            step.status === 'complete' ? 'bg-green-300' : 'bg-gray-200'
          )} />
        )}
      </div>

      <div className="flex-1 pt-1">
        <div
          className={cn(
            'font-medium',
            step.status === 'complete'
              ? 'text-green-900'
              : step.status === 'active'
              ? 'text-blue-900'
              : 'text-gray-600'
          )}
        >
          {step.label}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {step.status === 'complete' && 'Completed'}
          {step.status === 'active' && 'In Progress'}
          {step.status === 'pending' && 'Pending'}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RENEWAL STATUS INDICATOR (For Profile/Lists)
// ═══════════════════════════════════════════════════════════════════════════

interface RenewalStatusIndicatorProps {
  renewal: CredentialRenewal;
  size?: 'sm' | 'md';
}

export function RenewalStatusIndicator({ renewal, size = 'sm' }: RenewalStatusIndicatorProps) {
  const statusConfig: Record<
    RenewalStatus,
    { label: string; color: string; icon: any }
  > = {
    'not-started': { label: 'Not Started', color: 'gray', icon: Clock },
    'document-uploaded': { label: 'Document Uploaded', color: 'blue', icon: FileText },
    'under-review': { label: 'Under Review', color: 'amber', icon: Clock },
    'approved': { label: 'Approved', color: 'green', icon: CheckCircle },
    'rejected': { label: 'Rejected', color: 'red', icon: X },
  };

  const config = statusConfig[renewal.status];
  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'text-xs',
          config.color === 'green'
            ? 'bg-green-100 text-green-700 border-green-300'
            : config.color === 'blue'
            ? 'bg-blue-100 text-blue-700 border-blue-300'
            : config.color === 'amber'
            ? 'bg-amber-100 text-amber-700 border-amber-300'
            : config.color === 'red'
            ? 'bg-red-100 text-red-700 border-red-300'
            : 'bg-gray-100 text-gray-700 border-gray-300'
        )}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-2 rounded-lg border',
      config.color === 'green'
        ? 'bg-green-50 border-green-200'
        : config.color === 'blue'
        ? 'bg-blue-50 border-blue-200'
        : config.color === 'amber'
        ? 'bg-amber-50 border-amber-200'
        : config.color === 'red'
        ? 'bg-red-50 border-red-200'
        : 'bg-gray-50 border-gray-200'
    )}>
      <Icon className={cn('w-5 h-5', `text-${config.color}-600`)} />
      <div>
        <div className={cn('text-sm font-medium', `text-${config.color}-900`)}>
          {config.label}
        </div>
        {renewal.initiatedAt && (
          <div className="text-xs text-gray-600">
            Started {new Date(renewal.initiatedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
