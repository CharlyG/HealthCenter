/**
 * Document Header Component
 * 
 * Displays comprehensive document information at the top of any clinical document.
 * Shows patient context, document metadata, status, and signature information.
 * 
 * Required for all clinical documentation to maintain consistency and compliance.
 */

import { memo } from 'react';
import { 
  FileText, 
  User, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  Clock,
  FileSignature,
  UserCheck,
  Building2,
  ClipboardList
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { 
  ClinicalDocument,
  DocumentStatus,
  SignatureStatus 
} from '../../lib/documentationTypes';
import { formatDate } from '../../lib/utils/dateUtils';

interface DocumentHeaderProps {
  document: ClinicalDocument;
  className?: string;
  compact?: boolean;
}

export const DocumentHeader = memo<DocumentHeaderProps>(({ 
  document, 
  className = '',
  compact = false 
}) => {
  return (
    <Card className={`border-l-4 ${getStatusBorderColor(document.status)} ${className}`}>
      <div className={compact ? 'p-3' : 'p-4'}>
        {/* Top row: Document type and status badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-semibold text-base text-gray-900 truncate">
                {formatDocumentType(document.documentType)}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                Document ID: {document.id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <DocumentStatusBadge status={document.status} />
            <SignatureStatusBadge status={document.signatureStatus} />
          </div>
        </div>

        {/* Patient and admission information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3 text-sm">
          <InfoItem
            icon={<User className="w-4 h-4" />}
            label="Patient"
            value={document.patientName}
          />
          
          <InfoItem
            icon={<Building2 className="w-4 h-4" />}
            label="Admission Start"
            value={formatDate(document.admissionStartDate)}
          />
          
          <InfoItem
            icon={<Calendar className="w-4 h-4" />}
            label="Document Date"
            value={formatDate(document.documentDate)}
          />
        </div>

        {/* Clinician information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <InfoItem
            icon={<FileSignature className="w-4 h-4" />}
            label="Created By"
            value={
              <span>
                {document.createdByName}
                {document.createdByCredentials && (
                  <span className="text-gray-500 ml-1">
                    {document.createdByCredentials}
                  </span>
                )}
                <span className="text-gray-500 block text-xs mt-0.5">
                  {document.createdByRole}
                </span>
              </span>
            }
          />

          {document.signedBy && (
            <InfoItem
              icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
              label="Signed By"
              value={
                <span>
                  {document.signedByName}
                  {document.signedAt && (
                    <span className="text-gray-500 block text-xs mt-0.5">
                      {formatDate(document.signedAt)}
                    </span>
                  )}
                </span>
              }
            />
          )}

          {document.cosignRequired && document.cosignedBy && (
            <InfoItem
              icon={<UserCheck className="w-4 h-4 text-green-600" />}
              label="Co-Signed By"
              value={
                <span>
                  {document.cosignedByName}
                  {document.cosignedAt && (
                    <span className="text-gray-500 block text-xs mt-0.5">
                      {formatDate(document.cosignedAt)}
                    </span>
                  )}
                </span>
              }
            />
          )}
        </div>

        {/* Validation status */}
        {!compact && (document.validationErrors.length > 0 || document.validationWarnings.length > 0) && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-4 text-sm">
              {document.validationErrors.length > 0 && (
                <div className="flex items-center gap-1.5 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">
                    {document.validationErrors.length} error{document.validationErrors.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              {document.validationWarnings.length > 0 && (
                <div className="flex items-center gap-1.5 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">
                    {document.validationWarnings.length} warning{document.validationWarnings.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-blue-600 ml-auto">
                <ClipboardList className="w-4 h-4" />
                <span className="font-medium">
                  {document.completionPercentage}% complete
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Lock status */}
        {document.lockedBy && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>
                Locked by {document.lockedBy}
                {document.lockedAt && ` on ${formatDate(document.lockedAt)}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
});

DocumentHeader.displayName = 'DocumentHeader';

// ─── Helper Components ──────────────────────────────────────────────────────

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const InfoItem = memo<InfoItemProps>(({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <div className="text-gray-400 mt-0.5">{icon}</div>
    <div className="min-w-0 flex-1">
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="font-medium text-gray-900 truncate">{value}</div>
    </div>
  </div>
));

InfoItem.displayName = 'InfoItem';

// ─── Status Badges ──────────────────────────────────────────────────────────

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
}

const DocumentStatusBadge = memo<DocumentStatusBadgeProps>(({ status }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  return (
    <Badge className={`${config.className} gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
});

DocumentStatusBadge.displayName = 'DocumentStatusBadge';

interface SignatureStatusBadgeProps {
  status: SignatureStatus;
}

const SignatureStatusBadge = memo<SignatureStatusBadgeProps>(({ status }) => {
  const config = getSignatureStatusConfig(status);
  const Icon = config.icon;
  
  return (
    <Badge variant="outline" className={`${config.className} gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
});

SignatureStatusBadge.displayName = 'SignatureStatusBadge';

// ─── Helper Functions ───────────────────────────────────────────────────────

function getStatusConfig(status: DocumentStatus) {
  const configs = {
    in_progress: {
      label: 'In Progress',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
    },
    pending_review: {
      label: 'Pending Review',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertCircle,
    },
    ready_to_sign: {
      label: 'Ready to Sign',
      className: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: FileSignature,
    },
    signed: {
      label: 'Signed',
      className: 'bg-green-50 text-green-700 border-green-200',
      icon: CheckCircle2,
    },
    pending_cosign: {
      label: 'Pending Co-Sign',
      className: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: UserCheck,
    },
    cosigned: {
      label: 'Co-Signed',
      className: 'bg-green-50 text-green-700 border-green-200',
      icon: CheckCircle2,
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-red-50 text-red-700 border-red-200',
      icon: AlertCircle,
    },
    locked: {
      label: 'Locked',
      className: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: Lock,
    },
  };

  return configs[status];
}

function getSignatureStatusConfig(status: SignatureStatus) {
  const configs = {
    unsigned: {
      label: 'Unsigned',
      className: 'text-gray-600 border-gray-300',
      icon: FileSignature,
    },
    signed: {
      label: 'Signed',
      className: 'text-green-600 border-green-300',
      icon: CheckCircle2,
    },
    pending_cosign: {
      label: 'Pending Co-Sign',
      className: 'text-orange-600 border-orange-300',
      icon: UserCheck,
    },
    cosigned: {
      label: 'Co-Signed',
      className: 'text-green-600 border-green-300',
      icon: CheckCircle2,
    },
    electronic_signature: {
      label: 'E-Signature',
      className: 'text-blue-600 border-blue-300',
      icon: FileSignature,
    },
    wet_signature: {
      label: 'Wet Signature',
      className: 'text-purple-600 border-purple-300',
      icon: FileSignature,
    },
  };

  return configs[status];
}

function getStatusBorderColor(status: DocumentStatus): string {
  const colors = {
    in_progress: 'border-l-blue-500',
    pending_review: 'border-l-amber-500',
    ready_to_sign: 'border-l-purple-500',
    signed: 'border-l-green-500',
    pending_cosign: 'border-l-orange-500',
    cosigned: 'border-l-green-500',
    rejected: 'border-l-red-500',
    locked: 'border-l-gray-500',
  };

  return colors[status];
}

function formatDocumentType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
