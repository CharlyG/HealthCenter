/**
 * HR Operational Queue for Credential Issues
 * 
 * Dedicated queue for HR staff to manage expiring credentials, expired items,
 * and missing certifications with priority sorting and quick actions.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  ClipboardList,
  Shield,
  AlertTriangle,
  XCircle,
  User,
  Calendar,
  Filter,
  ChevronRight,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { DisciplineType } from '../../lib/caregiverTypes';
import type { CredentialType } from '../../lib/credentialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CredentialQueueItem {
  id: string;
  caregiverId: string;
  caregiverName: string;
  discipline: DisciplineType;
  office: string;
  credentialType: CredentialType;
  credentialName: string;
  expirationDate: string;
  daysUntilExpiration: number;
  priority: 'critical' | 'high' | 'medium';
  status: 'expiring-soon' | 'expired' | 'missing';
  renewalStatus?: 'not-started' | 'in-progress' | 'completed';
  lastContactedDate?: string;
  assignedTo?: string;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface HROperationalQueueProps {
  items: CredentialQueueItem[];
  onStartRenewal?: (itemId: string) => void;
  onContactCaregiver?: (itemId: string) => void;
  onMarkResolved?: (itemId: string) => void;
  onViewCaregiver?: (caregiverId: string) => void;
}

export default function HROperationalQueue({
  items,
  onStartRenewal,
  onContactCaregiver,
  onMarkResolved,
  onViewCaregiver,
}: HROperationalQueueProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'expiring-soon' | 'expired' | 'missing'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'critical' | 'high' | 'medium'>('all');

  // Filter items
  const filteredItems = items.filter((item) => {
    if (activeTab !== 'all' && item.status !== activeTab) return false;
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
    return true;
  });

  // Group by priority
  const criticalItems = filteredItems.filter((i) => i.priority === 'critical');
  const highItems = filteredItems.filter((i) => i.priority === 'high');
  const mediumItems = filteredItems.filter((i) => i.priority === 'medium');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">HR Credential Queue</h2>
              <p className="text-sm text-gray-600">
                Manage expiring, expired, and missing credentials
              </p>
            </div>
          </div>

          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Items</div>
            <div className="text-2xl font-bold text-gray-900">{items.length}</div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <div className="text-sm text-red-700 mb-1">Critical</div>
            <div className="text-2xl font-bold text-red-900">{criticalItems.length}</div>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="text-sm text-amber-700 mb-1">High Priority</div>
            <div className="text-2xl font-bold text-amber-900">{highItems.length}</div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700 mb-1">Medium Priority</div>
            <div className="text-2xl font-bold text-blue-900">{mediumItems.length}</div>
          </div>
        </div>
      </Card>

      {/* Tabs & Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('all')}
            >
              All ({items.length})
            </Button>
            <Button
              variant={activeTab === 'expiring-soon' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('expiring-soon')}
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              Expiring Soon ({items.filter((i) => i.status === 'expiring-soon').length})
            </Button>
            <Button
              variant={activeTab === 'expired' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('expired')}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Expired ({items.filter((i) => i.status === 'expired').length})
            </Button>
            <Button
              variant={activeTab === 'missing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('missing')}
            >
              <Shield className="w-3 h-3 mr-1" />
              Missing ({items.filter((i) => i.status === 'missing').length})
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Queue Items */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-gray-900 font-medium mb-1">All caught up!</p>
            <p className="text-sm text-gray-600">No credential issues in this queue</p>
          </Card>
        ) : (
          filteredItems
            .sort((a, b) => {
              // Sort by priority first
              const priorityOrder = { critical: 0, high: 1, medium: 2 };
              if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              }
              // Then by days until expiration
              return a.daysUntilExpiration - b.daysUntilExpiration;
            })
            .map((item) => (
              <QueueItemCard
                key={item.id}
                item={item}
                onStartRenewal={onStartRenewal}
                onContactCaregiver={onContactCaregiver}
                onMarkResolved={onMarkResolved}
                onViewCaregiver={onViewCaregiver}
              />
            ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUEUE ITEM CARD
// ═══════════════════════════════════════════════════════════════════════════

function QueueItemCard({
  item,
  onStartRenewal,
  onContactCaregiver,
  onMarkResolved,
  onViewCaregiver,
}: {
  item: CredentialQueueItem;
  onStartRenewal?: (itemId: string) => void;
  onContactCaregiver?: (itemId: string) => void;
  onMarkResolved?: (itemId: string) => void;
  onViewCaregiver?: (caregiverId: string) => void;
}) {
  const priorityConfig = {
    critical: {
      borderColor: 'border-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-900',
      badgeColor: 'bg-red-100 text-red-700 border-red-300',
    },
    high: {
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-900',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-300',
    },
    medium: {
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-300',
    },
  };

  const config = priorityConfig[item.priority];

  const statusConfig = {
    'expiring-soon': {
      icon: AlertTriangle,
      label: 'Expiring Soon',
      color: 'amber',
    },
    expired: {
      icon: XCircle,
      label: 'Expired',
      color: 'red',
    },
    missing: {
      icon: Shield,
      label: 'Missing',
      color: 'purple',
    },
  };

  const statusInfo = statusConfig[item.status];
  const StatusIcon = statusInfo.icon;

  return (
    <Card className={cn('p-4 border-l-4', config.borderColor, config.bgColor)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-gray-600" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4
                className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                onClick={() => onViewCaregiver?.(item.caregiverId)}
              >
                {item.caregiverName}
              </h4>
              <Badge variant="outline" className="text-xs">
                {item.discipline}
              </Badge>
              <Badge variant="outline" className={cn('text-xs', config.badgeColor)}>
                {item.priority}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  statusInfo.color === 'red'
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : statusInfo.color === 'amber'
                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                    : 'bg-purple-100 text-purple-700 border-purple-300'
                )}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>

            <div className="mb-2">
              <div className="font-medium text-gray-900 mb-1">{item.credentialName}</div>
              <div className="text-sm text-gray-600">{item.office}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-3 h-3" />
                <span>
                  {item.status === 'missing'
                    ? 'Not on file'
                    : `Expires: ${new Date(item.expirationDate).toLocaleDateString()}`}
                </span>
              </div>

              {item.status !== 'missing' && (
                <div>
                  <span
                    className={cn(
                      'font-medium',
                      item.daysUntilExpiration < 0
                        ? 'text-red-700'
                        : item.daysUntilExpiration <= 30
                        ? 'text-amber-700'
                        : 'text-gray-700'
                    )}
                  >
                    {item.daysUntilExpiration < 0
                      ? `${Math.abs(item.daysUntilExpiration)} days overdue`
                      : `${item.daysUntilExpiration} days remaining`}
                  </span>
                </div>
              )}

              {item.renewalStatus && (
                <div className="text-xs">
                  <span className="text-gray-600">Renewal:</span>{' '}
                  <span className="font-medium text-gray-900">
                    {item.renewalStatus.replace('-', ' ')}
                  </span>
                </div>
              )}

              {item.lastContactedDate && (
                <div className="text-xs text-gray-600">
                  Last contact: {new Date(item.lastContactedDate).toLocaleDateString()}
                </div>
              )}

              {item.assignedTo && (
                <div className="text-xs">
                  <span className="text-gray-600">Assigned to:</span>{' '}
                  <span className="font-medium text-gray-900">{item.assignedTo}</span>
                </div>
              )}
            </div>

            {item.notes && (
              <div className="mt-2 p-2 bg-white rounded border text-xs text-gray-700">
                {item.notes}
              </div>
            )}
          </div>
        </div>

        <ChevronRight
          className="w-5 h-5 text-gray-400 cursor-pointer"
          onClick={() => onViewCaregiver?.(item.caregiverId)}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-3 border-t">
        {onStartRenewal && !item.renewalStatus && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStartRenewal(item.id)}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Start Renewal
          </Button>
        )}

        {onContactCaregiver && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onContactCaregiver(item.id)}
          >
            Contact Caregiver
          </Button>
        )}

        {onMarkResolved && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMarkResolved(item.id)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Mark Resolved
          </Button>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE SUMMARY PANEL (For Profile & Dashboard)
// ═══════════════════════════════════════════════════════════════════════════

export interface ComplianceSummaryData {
  totalCredentials: number;
  validCredentials: number;
  expiringCredentials: number;
  expiredCredentials: number;
  totalTraining: number;
  completedTraining: number;
  expiringTraining: number;
  overdueTraining: number;
  complianceScore: number;
  complianceLevel: 'fully-compliant' | 'minor-issues' | 'non-compliant';
}

interface ComplianceSummaryPanelProps {
  data: ComplianceSummaryData;
  size?: 'sm' | 'md' | 'lg';
  onViewDetails?: () => void;
}

export function ComplianceSummaryPanel({
  data,
  size = 'md',
  onViewDetails,
}: ComplianceSummaryPanelProps) {
  const levelConfig = {
    'fully-compliant': {
      color: 'green',
      label: 'Fully Compliant',
      icon: CheckCircle,
    },
    'minor-issues': {
      color: 'amber',
      label: 'Minor Issues',
      icon: AlertTriangle,
    },
    'non-compliant': {
      color: 'red',
      label: 'Non-Compliant',
      icon: XCircle,
    },
  };

  const config = levelConfig[data.complianceLevel];
  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <div className="p-3 bg-white border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Compliance Status</span>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              config.color === 'green'
                ? 'bg-green-100 text-green-700 border-green-300'
                : config.color === 'amber'
                ? 'bg-amber-100 text-amber-700 border-amber-300'
                : 'bg-red-100 text-red-700 border-red-300'
            )}
          >
            <Icon className="w-3 h-3 mr-1" />
            {data.complianceScore}%
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Credentials:</span>
            <span
              className={cn(
                'font-medium',
                data.validCredentials === data.totalCredentials ? 'text-green-700' : 'text-red-700'
              )}
            >
              {data.validCredentials}/{data.totalCredentials}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Training:</span>
            <span
              className={cn(
                'font-medium',
                data.completedTraining === data.totalTraining ? 'text-green-700' : 'text-red-700'
              )}
            >
              {data.completedTraining}/{data.totalTraining}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center',
              `bg-${config.color}-100`
            )}
          >
            <Shield className={cn('w-6 h-6', `text-${config.color}-600`)} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Compliance Summary</h3>
            <Badge
              variant="outline"
              className={cn(
                'text-xs mt-1',
                config.color === 'green'
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : config.color === 'amber'
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-red-100 text-red-700 border-red-300'
              )}
            >
              <Icon className="w-3 h-3 mr-1" />
              {config.label} ({data.complianceScore}%)
            </Badge>
          </div>
        </div>
      </div>

      {/* Credentials Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Credentials</span>
          <span
            className={cn(
              'text-sm font-bold',
              data.validCredentials === data.totalCredentials ? 'text-green-700' : 'text-red-700'
            )}
          >
            {data.validCredentials}/{data.totalCredentials} Valid
          </span>
        </div>

        <div className="space-y-1 text-sm">
          {data.expiringCredentials > 0 && (
            <div className="flex justify-between text-amber-700">
              <span>Expiring Soon:</span>
              <span className="font-medium">{data.expiringCredentials}</span>
            </div>
          )}
          {data.expiredCredentials > 0 && (
            <div className="flex justify-between text-red-700">
              <span>Expired:</span>
              <span className="font-medium">{data.expiredCredentials}</span>
            </div>
          )}
        </div>
      </div>

      {/* Training Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Training</span>
          <span
            className={cn(
              'text-sm font-bold',
              data.completedTraining === data.totalTraining ? 'text-green-700' : 'text-red-700'
            )}
          >
            {data.completedTraining}/{data.totalTraining} Complete
          </span>
        </div>

        <div className="space-y-1 text-sm">
          {data.expiringTraining > 0 && (
            <div className="flex justify-between text-amber-700">
              <span>Expiring Soon:</span>
              <span className="font-medium">{data.expiringTraining}</span>
            </div>
          )}
          {data.overdueTraining > 0 && (
            <div className="flex justify-between text-red-700">
              <span>Overdue:</span>
              <span className="font-medium">{data.overdueTraining}</span>
            </div>
          )}
        </div>
      </div>

      {onViewDetails && (
        <Button variant="outline" size="sm" onClick={onViewDetails} className="w-full">
          View Full Compliance Report
        </Button>
      )}
    </Card>
  );
}
