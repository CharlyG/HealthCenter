/**
 * Integration Logs Viewer
 * 
 * View all external service interactions with filtering by type, status,
 * date range, and vendor. Includes detailed log entry inspection.
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
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  ChevronRight,
  Code,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { IntegrationCategory } from '../../lib/integrationTypes';

interface LogEntry {
  id: string;
  timestamp: string;
  category: IntegrationCategory;
  vendor: string;
  action: string;
  status: 'success' | 'failure';
  requestSummary: string;
  responseSummary: string;
  requestPayload?: any;
  responsePayload?: any;
  duration: number;
}

interface IntegrationLogsViewerProps {
  selectedIntegration?: IntegrationCategory;
}

export default function IntegrationLogsViewer({ selectedIntegration }: IntegrationLogsViewerProps) {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failure'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const mockLogs: LogEntry[] = [
    {
      id: 'log-001',
      timestamp: '2024-03-10T14:30:00Z',
      category: 'evv',
      vendor: 'HHAeXchange',
      action: 'Submit Visit',
      status: 'success',
      requestSummary: 'Visit VST-12345 for Patient PT-001',
      responseSummary: 'Accepted - Confirmation CONF-ABC123',
      duration: 245,
    },
    {
      id: 'log-002',
      timestamp: '2024-03-10T14:25:00Z',
      category: 'sms',
      vendor: 'Twilio',
      action: 'Send SMS',
      status: 'success',
      requestSummary: 'Appointment reminder to +15551234567',
      responseSummary: 'Message delivered',
      duration: 180,
    },
    {
      id: 'log-003',
      timestamp: '2024-03-10T14:20:00Z',
      category: 'medication',
      vendor: 'Medispan',
      action: 'Drug Lookup',
      status: 'success',
      requestSummary: 'Search query: Lisinopril',
      responseSummary: '15 results returned',
      duration: 120,
    },
    {
      id: 'log-004',
      timestamp: '2024-03-10T14:15:00Z',
      category: 'fax',
      vendor: 'SRFax',
      action: 'Send Fax',
      status: 'failure',
      requestSummary: 'Fax order to +15559876543',
      responseSummary: 'Authentication failed',
      duration: 3000,
    },
    {
      id: 'log-005',
      timestamp: '2024-03-10T14:10:00Z',
      category: 'email',
      vendor: 'SendGrid',
      action: 'Send Email',
      status: 'success',
      requestSummary: 'Care plan update to patient@example.com',
      responseSummary: 'Email queued for delivery',
      duration: 95,
    },
  ];

  const filteredLogs = mockLogs.filter((log) => {
    if (selectedIntegration && log.category !== selectedIntegration) return false;
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    if (searchQuery && !log.action.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All ({mockLogs.length})
            </Button>
            <Button
              variant={filterStatus === 'success' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('success')}
            >
              Success ({mockLogs.filter((l) => l.status === 'success').length})
            </Button>
            <Button
              variant={filterStatus === 'failure' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('failure')}
            >
              Failure ({mockLogs.filter((l) => l.status === 'failure').length})
            </Button>
          </div>
        </div>
      </Card>

      {/* Log Entries */}
      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <LogEntryCard
            key={log.id}
            log={log}
            onClick={() => setSelectedLog(log)}
          />
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-600">No logs found matching your filters</p>
        </Card>
      )}

      {/* Log Detail Dialog */}
      {selectedLog && (
        <LogDetailDialog log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}

function LogEntryCard({ log, onClick }: { log: LogEntry; onClick: () => void }) {
  return (
    <Card
      className={cn(
        'p-3 cursor-pointer hover:bg-gray-50 transition-colors border-l-4',
        log.status === 'success' ? 'border-l-green-500' : 'border-l-red-500'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {log.status === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span className="font-medium text-gray-900">{log.action}</span>
            <Badge variant="outline" className="text-xs">
              {log.vendor}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {log.category.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-1">
            <div>Request: {log.requestSummary}</div>
            <div>Response: {log.responseSummary}</div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(log.timestamp).toLocaleString()}
            </div>
            <div>{log.duration}ms</div>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </Card>
  );
}

function LogDetailDialog({ log, onClose }: { log: LogEntry; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Log Entry Details
          </DialogTitle>
          <DialogDescription>
            {log.action} via {log.vendor}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Status</div>
              <Badge
                variant="outline"
                className={cn(
                  log.status === 'success'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-red-100 text-red-700 border-red-300'
                )}
              >
                {log.status}
              </Badge>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Duration</div>
              <div className="text-sm text-gray-900">{log.duration}ms</div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Timestamp</div>
              <div className="text-sm text-gray-900">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Category</div>
              <div className="text-sm text-gray-900">{log.category}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Request Summary</div>
            <div className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {log.requestSummary}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Response Summary</div>
            <div className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {log.responseSummary}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Request Payload</div>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(
                {
                  action: log.action,
                  vendor: log.vendor,
                  category: log.category,
                  timestamp: log.timestamp,
                },
                null,
                2
              )}
            </pre>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Response Payload</div>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(
                {
                  status: log.status,
                  duration: log.duration,
                  summary: log.responseSummary,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
