/**
 * Integration Audit Log
 * 
 * Comprehensive audit trail for all integration configuration changes including
 * user attribution, timestamps, before/after states, and detailed change tracking
 * for compliance and security monitoring.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  FileText,
  User,
  Clock,
  Search,
  Filter,
  Download,
  ChevronRight,
  Settings,
  RefreshCw,
  Shield,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { INTEGRATION_CATEGORIES } from '../../lib/integrationTypes';
import type { IntegrationCategory } from '../../lib/integrationTypes';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type ChangeType =
  | 'vendor_switched'
  | 'configuration_updated'
  | 'environment_mode_changed'
  | 'credentials_rotated'
  | 'integration_enabled'
  | 'integration_disabled'
  | 'webhook_configured'
  | 'test_executed';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: IntegrationCategory;
  changeType: ChangeType;
  description: string;
  previousConfig?: any;
  newConfig?: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function IntegrationAuditLog() {
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [filterCategory, setFilterCategory] = useState<IntegrationCategory | 'all'>('all');
  const [filterChangeType, setFilterChangeType] = useState<ChangeType | 'all'>('all');
  const [filterUser, setFilterUser] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  // Mock data - in production, fetch from API
  const auditLogs: AuditLogEntry[] = [
    {
      id: 'audit-001',
      timestamp: '2024-03-10T14:30:00Z',
      userId: 'user-001',
      userName: 'John Smith',
      userEmail: 'john.smith@agency.com',
      category: 'evv',
      changeType: 'vendor_switched',
      description: 'Switched EVV vendor from Sandata to HHAeXchange',
      previousConfig: {
        vendorId: 'sandata',
        apiEndpoint: 'https://api.sandata.com/v1',
        environmentMode: 'production',
      },
      newConfig: {
        vendorId: 'hhax',
        apiEndpoint: 'https://api.hhax.com/v2',
        environmentMode: 'test',
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      sessionId: 'sess-abc123',
    },
    {
      id: 'audit-002',
      timestamp: '2024-03-10T14:25:00Z',
      userId: 'user-002',
      userName: 'Sarah Johnson',
      userEmail: 'sarah.j@agency.com',
      category: 'sms',
      changeType: 'credentials_rotated',
      description: 'Rotated API credentials for Twilio SMS integration',
      previousConfig: {
        apiKey: 'sk_live_***old***',
        lastRotated: '2024-02-10T14:25:00Z',
      },
      newConfig: {
        apiKey: 'sk_live_***new***',
        lastRotated: '2024-03-10T14:25:00Z',
      },
      ipAddress: '192.168.1.105',
      sessionId: 'sess-def456',
    },
    {
      id: 'audit-003',
      timestamp: '2024-03-10T14:20:00Z',
      userId: 'user-001',
      userName: 'John Smith',
      userEmail: 'john.smith@agency.com',
      category: 'medication',
      changeType: 'environment_mode_changed',
      description: 'Changed Medication integration from test to production mode',
      previousConfig: {
        environmentMode: 'test',
      },
      newConfig: {
        environmentMode: 'production',
      },
      ipAddress: '192.168.1.100',
      sessionId: 'sess-abc123',
    },
    {
      id: 'audit-004',
      timestamp: '2024-03-10T13:45:00Z',
      userId: 'user-003',
      userName: 'Mike Williams',
      userEmail: 'mike.w@agency.com',
      category: 'fax',
      changeType: 'configuration_updated',
      description: 'Updated webhook URL for SRFax integration',
      previousConfig: {
        webhookUrl: 'https://old.agency.com/webhooks/fax',
      },
      newConfig: {
        webhookUrl: 'https://new.agency.com/webhooks/fax',
      },
      ipAddress: '192.168.1.110',
      sessionId: 'sess-ghi789',
    },
    {
      id: 'audit-005',
      timestamp: '2024-03-10T12:30:00Z',
      userId: 'user-002',
      userName: 'Sarah Johnson',
      userEmail: 'sarah.j@agency.com',
      category: 'email',
      changeType: 'test_executed',
      description: 'Executed connection test for SendGrid integration',
      ipAddress: '192.168.1.105',
      sessionId: 'sess-def456',
    },
    {
      id: 'audit-006',
      timestamp: '2024-03-10T11:00:00Z',
      userId: 'user-001',
      userName: 'John Smith',
      userEmail: 'john.smith@agency.com',
      category: 'push-notifications',
      changeType: 'integration_enabled',
      description: 'Enabled Firebase push notifications integration',
      previousConfig: {
        enabled: false,
      },
      newConfig: {
        enabled: true,
        environmentMode: 'test',
      },
      ipAddress: '192.168.1.100',
      sessionId: 'sess-abc123',
    },
  ];

  // Filtering
  const filteredLogs = auditLogs.filter((log) => {
    if (filterCategory !== 'all' && log.category !== filterCategory) return false;
    if (filterChangeType !== 'all' && log.changeType !== filterChangeType) return false;
    if (filterUser && !log.userName.toLowerCase().includes(filterUser.toLowerCase())) return false;
    if (
      searchQuery &&
      !log.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;

    // Date range filtering
    const logDate = new Date(log.timestamp);
    const now = new Date();
    if (dateRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (logDate < today) return false;
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (logDate < weekAgo) return false;
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (logDate < monthAgo) return false;
    }

    return true;
  });

  const handleExport = () => {
    // In production, export to CSV/JSON
    console.log('Exporting audit logs...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Integration Audit Log</h2>
              <p className="text-sm text-gray-600">
                Complete history of integration configuration changes
              </p>
            </div>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Compliance Notice */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <span className="font-medium">HIPAA Compliance:</span> All integration changes are
              logged and retained for 7 years per regulatory requirements.
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-5 gap-3 mb-3">
          {/* Search */}
          <div className="col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* User Filter */}
          <div>
            <Input
              placeholder="Filter by user..."
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          {/* Reset */}
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setFilterUser('');
              setFilterCategory('all');
              setFilterChangeType('all');
              setDateRange('week');
            }}
          >
            Reset
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-600" />

          {/* Category Filter */}
          <Button
            variant={filterCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory('all')}
          >
            All Categories
          </Button>
          {(['evv', 'sms', 'email', 'medication'] as IntegrationCategory[]).map((cat) => (
            <Button
              key={cat}
              variant={filterCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(cat)}
            >
              {INTEGRATION_CATEGORIES[cat].label}
            </Button>
          ))}

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Change Type Filter */}
          <Button
            variant={filterChangeType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterChangeType('all')}
          >
            All Changes
          </Button>
          {(['vendor_switched', 'configuration_updated', 'environment_mode_changed'] as ChangeType[]).map(
            (type) => (
              <Button
                key={type}
                variant={filterChangeType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterChangeType(type)}
              >
                {type.replace(/_/g, ' ')}
              </Button>
            )
          )}
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredLogs.length} of {auditLogs.length} entries
        </span>
        <span>Retention: 7 years</span>
      </div>

      {/* Audit Log Entries */}
      <div className="space-y-3">
        {filteredLogs.map((entry) => (
          <AuditLogEntryCard
            key={entry.id}
            entry={entry}
            onClick={() => setSelectedEntry(entry)}
          />
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No audit log entries found</p>
        </Card>
      )}

      {/* Detail Dialog */}
      {selectedEntry && (
        <AuditLogDetailDialog entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOG ENTRY CARD
// ═══════════════════════════════════════════════════════════════════════════

function AuditLogEntryCard({ entry, onClick }: { entry: AuditLogEntry; onClick: () => void }) {
  const category = INTEGRATION_CATEGORIES[entry.category];

  const changeTypeConfig = {
    vendor_switched: { color: 'purple', icon: RefreshCw, label: 'Vendor Switched' },
    configuration_updated: { color: 'blue', icon: Settings, label: 'Configuration Updated' },
    environment_mode_changed: { color: 'amber', icon: Settings, label: 'Environment Changed' },
    credentials_rotated: { color: 'green', icon: Shield, label: 'Credentials Rotated' },
    integration_enabled: { color: 'green', icon: CheckCircle, label: 'Enabled' },
    integration_disabled: { color: 'red', icon: XCircle, label: 'Disabled' },
    webhook_configured: { color: 'blue', icon: Settings, label: 'Webhook Configured' },
    test_executed: { color: 'gray', icon: Eye, label: 'Test Executed' },
  };

  const config = changeTypeConfig[entry.changeType];
  const ChangeIcon = config.icon;

  return (
    <Card
      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{category.icon}</span>
            <span className="font-medium text-gray-900">{category.label}</span>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                config.color === 'purple'
                  ? 'bg-purple-100 text-purple-700 border-purple-300'
                  : config.color === 'blue'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : config.color === 'amber'
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : config.color === 'green'
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : config.color === 'red'
                  ? 'bg-red-100 text-red-700 border-red-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              )}
            >
              <ChangeIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 mb-2">{entry.description}</p>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {entry.userName}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(entry.timestamp).toLocaleString()}
            </div>
            {entry.ipAddress && (
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {entry.ipAddress}
              </div>
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOG DETAIL DIALOG
// ═══════════════════════════════════════════════════════════════════════════

function AuditLogDetailDialog({
  entry,
  onClose,
}: {
  entry: AuditLogEntry;
  onClose: () => void;
}) {
  const category = INTEGRATION_CATEGORIES[entry.category];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Audit Log Details
          </DialogTitle>
          <DialogDescription>Complete change record with before/after states</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Entry Metadata */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">User</div>
                <div className="text-sm text-gray-900">{entry.userName}</div>
                <div className="text-xs text-gray-600">{entry.userEmail}</div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">Timestamp</div>
                <div className="text-sm text-gray-900">
                  {new Date(entry.timestamp).toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">Integration</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm text-gray-900">{category.label}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">Change Type</div>
                <div className="text-sm text-gray-900 capitalize">
                  {entry.changeType.replace(/_/g, ' ')}
                </div>
              </div>

              {entry.ipAddress && (
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">IP Address</div>
                  <div className="text-sm text-gray-900">{entry.ipAddress}</div>
                </div>
              )}

              {entry.sessionId && (
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">Session ID</div>
                  <div className="text-sm text-gray-900 font-mono">{entry.sessionId}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Change Description */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Change Description</h3>
            <p className="text-sm text-gray-700">{entry.description}</p>
          </Card>

          {/* Configuration Changes */}
          {entry.previousConfig && entry.newConfig && (
            <div className="grid grid-cols-2 gap-4">
              {/* Previous Configuration */}
              <Card className="p-4 border-l-4 border-l-red-500">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Previous Configuration
                </h3>
                <pre className="bg-gray-900 text-red-400 p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(entry.previousConfig, null, 2)}
                </pre>
              </Card>

              {/* New Configuration */}
              <Card className="p-4 border-l-4 border-l-green-500">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  New Configuration
                </h3>
                <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(entry.newConfig, null, 2)}
                </pre>
              </Card>
            </div>
          )}

          {/* Configuration Diff */}
          {entry.previousConfig && entry.newConfig && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Configuration Changes</h3>
              <ConfigurationDiff
                previous={entry.previousConfig}
                current={entry.newConfig}
              />
            </Card>
          )}

          {/* Security Information */}
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-900 mb-1">Security & Compliance</h4>
                <ul className="space-y-1 text-sm text-amber-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    Change authenticated and authorized
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    IP address and session tracked
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    Audit trail preserved for 7 years
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    HIPAA compliant logging
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION DIFF VIEWER
// ═══════════════════════════════════════════════════════════════════════════

function ConfigurationDiff({ previous, current }: { previous: any; current: any }) {
  const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);
  const changes: Array<{ key: string; type: 'added' | 'removed' | 'changed'; prev?: any; curr?: any }> = [];

  allKeys.forEach((key) => {
    if (!(key in previous)) {
      changes.push({ key, type: 'added', curr: current[key] });
    } else if (!(key in current)) {
      changes.push({ key, type: 'removed', prev: previous[key] });
    } else if (JSON.stringify(previous[key]) !== JSON.stringify(current[key])) {
      changes.push({ key, type: 'changed', prev: previous[key], curr: current[key] });
    }
  });

  if (changes.length === 0) {
    return <p className="text-sm text-gray-600">No configuration changes detected</p>;
  }

  return (
    <div className="space-y-2">
      {changes.map((change, i) => (
        <div
          key={i}
          className={cn(
            'p-3 rounded-lg border-l-4',
            change.type === 'added'
              ? 'bg-green-50 border-l-green-500'
              : change.type === 'removed'
              ? 'bg-red-50 border-l-red-500'
              : 'bg-blue-50 border-l-blue-500'
          )}
        >
          <div className="flex items-start gap-3">
            {change.type === 'added' && <CheckCircle className="w-4 h-4 text-green-700 mt-0.5" />}
            {change.type === 'removed' && <XCircle className="w-4 h-4 text-red-700 mt-0.5" />}
            {change.type === 'changed' && <ArrowRight className="w-4 h-4 text-blue-700 mt-0.5" />}

            <div className="flex-1">
              <div className="font-medium text-gray-900 text-sm mb-1">{change.key}</div>

              {change.type === 'added' && (
                <div className="text-sm text-green-800">
                  Added: <code className="bg-green-100 px-1 rounded">{JSON.stringify(change.curr)}</code>
                </div>
              )}

              {change.type === 'removed' && (
                <div className="text-sm text-red-800">
                  Removed: <code className="bg-red-100 px-1 rounded">{JSON.stringify(change.prev)}</code>
                </div>
              )}

              {change.type === 'changed' && (
                <div className="text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <code className="bg-red-100 px-1 rounded line-through">
                      {JSON.stringify(change.prev)}
                    </code>
                    <ArrowRight className="w-3 h-3" />
                    <code className="bg-green-100 px-1 rounded">{JSON.stringify(change.curr)}</code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
