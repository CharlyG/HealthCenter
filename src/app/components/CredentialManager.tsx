/**
 * Credential Manager Component
 * 
 * Complete credential management interface for individual caregiver profiles
 * including upload, tracking, and expiration monitoring.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Shield,
  Plus,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type {
  Credential,
  CredentialType,
  CredentialStatus,
} from '../lib/credentialTypes';
import {
  CREDENTIAL_TYPE_CONFIG,
  calculateCredentialStatus,
  getDaysUntilExpiration,
} from '../lib/credentialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CredentialManagerProps {
  caregiverId: string;
  credentials: Credential[];
  onAddCredential?: () => void;
  onEditCredential?: (credentialId: string) => void;
  onDeleteCredential?: (credentialId: string) => void;
  onUploadDocument?: (credentialId: string) => void;
  onViewDocument?: (credentialId: string) => void;
  mode?: 'full' | 'compact';
}

export default function CredentialManager({
  caregiverId,
  credentials,
  onAddCredential,
  onEditCredential,
  onDeleteCredential,
  onUploadDocument,
  onViewDocument,
  mode = 'full',
}: CredentialManagerProps) {
  const [selectedType, setSelectedType] = useState<CredentialType | 'all'>('all');

  const filteredCredentials =
    selectedType === 'all'
      ? credentials
      : credentials.filter((c) => c.credentialType === selectedType);

  // Calculate summary stats
  const activeCount = credentials.filter((c) => c.status === 'active').length;
  const expiringSoonCount = credentials.filter((c) => c.status === 'expiring-soon').length;
  const expiredCount = credentials.filter((c) => c.status === 'expired').length;

  // Group credentials by type
  const credentialsByType = credentials.reduce((acc, credential) => {
    if (!acc[credential.credentialType]) {
      acc[credential.credentialType] = [];
    }
    acc[credential.credentialType].push(credential);
    return acc;
  }, {} as Record<CredentialType, Credential[]>);

  if (mode === 'compact') {
    return <CompactCredentialView credentials={credentials} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Credential Management</h2>
              <p className="text-sm text-gray-600">
                Track licenses, certifications, and required credentials
              </p>
            </div>
          </div>

          {onAddCredential && (
            <Button onClick={onAddCredential}>
              <Plus className="w-4 h-4 mr-2" />
              Add Credential
            </Button>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Total Credentials"
            value={credentials.length}
            icon={FileText}
            color="blue"
          />
          <StatCard
            label="Active"
            value={activeCount}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            label="Expiring Soon"
            value={expiringSoonCount}
            icon={AlertTriangle}
            color="amber"
          />
          <StatCard
            label="Expired"
            value={expiredCount}
            icon={XCircle}
            color="red"
          />
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filter by type:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedType('all')}
            className={cn(selectedType === 'all' && 'bg-blue-100 border-blue-300 text-blue-700')}
          >
            All ({credentials.length})
          </Button>
          {Object.keys(credentialsByType).map((type) => {
            const config = CREDENTIAL_TYPE_CONFIG[type as CredentialType];
            const count = credentialsByType[type as CredentialType].length;

            return (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => setSelectedType(type as CredentialType)}
                className={cn(
                  selectedType === type && 'bg-blue-100 border-blue-300 text-blue-700'
                )}
              >
                {config.icon} {config.label} ({count})
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Credentials List */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          {selectedType === 'all' ? 'All Credentials' : CREDENTIAL_TYPE_CONFIG[selectedType].label}
        </h3>

        {filteredCredentials.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="font-medium mb-1">No credentials found</p>
            <p className="text-sm">
              {selectedType === 'all'
                ? 'Add your first credential to get started'
                : `No ${CREDENTIAL_TYPE_CONFIG[selectedType].label} credentials on file`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCredentials.map((credential) => (
              <CredentialCard
                key={credential.id}
                credential={credential}
                onEdit={onEditCredential}
                onDelete={onDeleteCredential}
                onUploadDocument={onUploadDocument}
                onViewDocument={onViewDocument}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════════

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          colorClasses[color as keyof typeof colorClasses]
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs text-gray-600">{label}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CREDENTIAL CARD
// ═══════════════════════════════════════════════════════════════════════════

function CredentialCard({
  credential,
  onEdit,
  onDelete,
  onUploadDocument,
  onViewDocument,
}: {
  credential: Credential;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUploadDocument?: (id: string) => void;
  onViewDocument?: (id: string) => void;
}) {
  const config = CREDENTIAL_TYPE_CONFIG[credential.credentialType];
  const daysUntilExpiration = getDaysUntilExpiration(credential.expirationDate);

  const statusConfig: Record<
    CredentialStatus,
    { label: string; icon: any; color: string }
  > = {
    active: { label: 'Active', icon: CheckCircle, color: 'green' },
    'expiring-soon': { label: 'Expiring Soon', icon: AlertTriangle, color: 'amber' },
    expired: { label: 'Expired', icon: XCircle, color: 'red' },
    pending: { label: 'Pending', icon: Calendar, color: 'blue' },
    suspended: { label: 'Suspended', icon: XCircle, color: 'red' },
  };

  const statusInfo = statusConfig[credential.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2 bg-white',
        credential.status === 'expired'
          ? 'border-red-300 bg-red-50'
          : credential.status === 'expiring-soon'
          ? 'border-amber-300 bg-amber-50'
          : 'border-gray-200'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0',
          `bg-${config.color}-100`
        )}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{config.label}</h4>
              {credential.credentialNumber && (
                <div className="text-xs text-gray-600">
                  #{credential.credentialNumber}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  statusInfo.color === 'green'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : statusInfo.color === 'amber'
                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                    : statusInfo.color === 'red'
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : 'bg-blue-100 text-blue-700 border-blue-300'
                )}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.label}
              </Badge>

              {credential.required && (
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                  Required
                </Badge>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
            <div>
              <div className="text-xs text-gray-600">Issuing Authority</div>
              <div className="font-medium text-gray-900">{credential.issuingAuthority}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Issue Date</div>
              <div className="font-medium text-gray-900">
                {new Date(credential.issueDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Expiration Date</div>
              <div
                className={cn(
                  'font-medium',
                  credential.status === 'expired'
                    ? 'text-red-700'
                    : credential.status === 'expiring-soon'
                    ? 'text-amber-700'
                    : 'text-gray-900'
                )}
              >
                {new Date(credential.expirationDate).toLocaleDateString()}
                {credential.status === 'expiring-soon' && daysUntilExpiration > 0 && (
                  <span className="text-xs ml-1">({daysUntilExpiration}d)</span>
                )}
              </div>
            </div>
          </div>

          {/* Document Status */}
          {credential.documentUrl ? (
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">
                  {credential.documentName || 'Document on file'}
                </span>
              </div>
              {onViewDocument && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDocument(credential.id)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-dashed">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">No document uploaded</span>
              </div>
              {onUploadDocument && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUploadDocument(credential.id)}
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
              )}
            </div>
          )}

          {/* Expiration Warning */}
          {(credential.status === 'expiring-soon' || credential.status === 'expired') && (
            <div
              className={cn(
                'mt-3 p-2 rounded-lg text-sm flex items-start gap-2',
                credential.status === 'expired'
                  ? 'bg-red-100 text-red-900'
                  : 'bg-amber-100 text-amber-900'
              )}
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                {credential.status === 'expired' ? (
                  <span className="font-medium">
                    This credential has expired. Caregiver cannot be scheduled until renewed.
                  </span>
                ) : (
                  <span className="font-medium">
                    This credential expires in {daysUntilExpiration} days. Renewal required to
                    maintain scheduling eligibility.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(credential.id)}>
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
            {!credential.documentUrl && onUploadDocument && (
              <Button variant="outline" size="sm" onClick={() => onUploadDocument(credential.id)}>
                <Upload className="w-3 h-3 mr-1" />
                Upload Document
              </Button>
            )}
            {credential.documentUrl && onViewDocument && (
              <Button variant="outline" size="sm" onClick={() => onViewDocument(credential.id)}>
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(credential.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT VIEW
// ═══════════════════════════════════════════════════════════════════════════

function CompactCredentialView({ credentials }: { credentials: Credential[] }) {
  const activeCount = credentials.filter((c) => c.status === 'active').length;
  const expiringSoonCount = credentials.filter((c) => c.status === 'expiring-soon').length;
  const expiredCount = credentials.filter((c) => c.status === 'expired').length;

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
        <Shield className="w-4 h-4" />
        Credentials Summary
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total:</span>
          <span className="font-semibold text-gray-900">{credentials.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Active:</span>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
            {activeCount}
          </Badge>
        </div>
        {expiringSoonCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Expiring Soon:</span>
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {expiringSoonCount}
            </Badge>
          </div>
        )}
        {expiredCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Expired:</span>
            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
              <XCircle className="w-3 h-3 mr-1" />
              {expiredCount}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
