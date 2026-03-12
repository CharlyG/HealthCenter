/**
 * Integration Queue Monitor
 * 
 * Monitor pending external operations including EVV transmissions,
 * notification deliveries, and fax transmissions with retry capabilities.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Clock,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { IntegrationCategory } from '../../lib/integrationTypes';

interface QueueItem {
  id: string;
  category: IntegrationCategory;
  vendor: string;
  actionType: string;
  status: 'pending' | 'processing' | 'retrying' | 'failed';
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  nextRetryAt?: string;
  description: string;
}

export default function IntegrationQueueMonitor() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Mock data
  const queueItems: QueueItem[] = [
    {
      id: 'queue-001',
      category: 'evv',
      vendor: 'HHAeXchange',
      actionType: 'EVV Transmission',
      status: 'retrying',
      retryCount: 2,
      maxRetries: 5,
      createdAt: '2024-03-10T14:00:00Z',
      nextRetryAt: '2024-03-10T14:35:00Z',
      description: 'Visit VST-12345 - Garcia, Maria',
    },
    {
      id: 'queue-002',
      category: 'sms',
      vendor: 'Twilio',
      actionType: 'SMS Delivery',
      status: 'pending',
      retryCount: 0,
      maxRetries: 3,
      createdAt: '2024-03-10T14:10:00Z',
      description: 'Appointment reminder for Smith, John',
    },
    {
      id: 'queue-003',
      category: 'email',
      vendor: 'SendGrid',
      actionType: 'Email Delivery',
      status: 'processing',
      retryCount: 0,
      maxRetries: 3,
      createdAt: '2024-03-10T14:15:00Z',
      description: 'Care plan update for Johnson, Sarah',
    },
    {
      id: 'queue-004',
      category: 'fax',
      vendor: 'SRFax',
      actionType: 'Fax Transmission',
      status: 'failed',
      retryCount: 5,
      maxRetries: 5,
      createdAt: '2024-03-10T13:00:00Z',
      description: 'Orders to Dr. Williams',
    },
    {
      id: 'queue-005',
      category: 'evv',
      vendor: 'HHAeXchange',
      actionType: 'EVV Transmission',
      status: 'pending',
      retryCount: 0,
      maxRetries: 5,
      createdAt: '2024-03-10T14:20:00Z',
      description: 'Visit VST-12346 - Brown, David',
    },
  ];

  const filteredItems = queueItems.filter((item) =>
    selectedStatus === 'all' ? true : item.status === selectedStatus
  );

  const handleRetry = (itemId: string) => {
    console.log('Manually retrying item:', itemId);
    // In production, trigger retry
  };

  const pendingCount = queueItems.filter((i) => i.status === 'pending').length;
  const processingCount = queueItems.filter((i) => i.status === 'processing').length;
  const retryingCount = queueItems.filter((i) => i.status === 'retrying').length;
  const failedCount = queueItems.filter((i) => i.status === 'failed').length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{pendingCount}</span>
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Loader2 className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{processingCount}</span>
          </div>
          <div className="text-sm text-gray-600">Processing</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <RefreshCw className="w-5 h-5 text-amber-600" />
            <span className="text-2xl font-bold text-amber-900">{retryingCount}</span>
          </div>
          <div className="text-sm text-gray-600">Retrying</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{failedCount}</span>
          </div>
          <div className="text-sm text-gray-600">Failed</div>
        </Card>
      </div>

      {/* Status Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('all')}
          >
            All ({queueItems.length})
          </Button>
          <Button
            variant={selectedStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('pending')}
          >
            Pending ({pendingCount})
          </Button>
          <Button
            variant={selectedStatus === 'processing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('processing')}
          >
            Processing ({processingCount})
          </Button>
          <Button
            variant={selectedStatus === 'retrying' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('retrying')}
          >
            Retrying ({retryingCount})
          </Button>
          <Button
            variant={selectedStatus === 'failed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('failed')}
          >
            Failed ({failedCount})
          </Button>
        </div>
      </Card>

      {/* Queue Items */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <QueueItemCard key={item.id} item={item} onRetry={() => handleRetry(item.id)} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <p className="text-gray-900 font-medium mb-1">Queue is empty</p>
          <p className="text-sm text-gray-600">All operations completed</p>
        </Card>
      )}
    </div>
  );
}

function QueueItemCard({ item, onRetry }: { item: QueueItem; onRetry: () => void }) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'blue',
      label: 'Pending',
      bgColor: 'bg-blue-50',
      borderColor: 'border-l-blue-500',
    },
    processing: {
      icon: Loader2,
      color: 'purple',
      label: 'Processing',
      bgColor: 'bg-purple-50',
      borderColor: 'border-l-purple-500',
    },
    retrying: {
      icon: RefreshCw,
      color: 'amber',
      label: 'Retrying',
      bgColor: 'bg-amber-50',
      borderColor: 'border-l-amber-500',
    },
    failed: {
      icon: AlertTriangle,
      color: 'red',
      label: 'Failed',
      bgColor: 'bg-red-50',
      borderColor: 'border-l-red-500',
    },
  };

  const config = statusConfig[item.status];
  const StatusIcon = config.icon;

  return (
    <Card className={cn('p-4 border-l-4', config.borderColor, config.bgColor)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StatusIcon
              className={cn(
                'w-4 h-4',
                item.status === 'processing' && 'animate-spin',
                `text-${config.color}-600`
              )}
            />
            <span className="font-semibold text-gray-900">{item.actionType}</span>
            <Badge variant="outline" className="text-xs">
              {item.vendor}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {item.category.toUpperCase()}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                config.color === 'blue'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : config.color === 'purple'
                  ? 'bg-purple-100 text-purple-700 border-purple-300'
                  : config.color === 'amber'
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-red-100 text-red-700 border-red-300'
              )}
            >
              {config.label}
            </Badge>
          </div>

          <p className="text-sm text-gray-700 mb-2">{item.description}</p>

          <div className="grid grid-cols-3 gap-3 text-xs text-gray-600">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(item.createdAt).toLocaleTimeString()}
            </div>
            <div>
              <span className="font-medium">Retry:</span> {item.retryCount}/{item.maxRetries}
            </div>
            {item.nextRetryAt && (
              <div>
                <span className="font-medium">Next retry:</span>{' '}
                {new Date(item.nextRetryAt).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {(item.status === 'failed' || item.status === 'retrying') &&
          item.retryCount < item.maxRetries && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <Play className="w-3 h-3 mr-1" />
              Retry Now
            </Button>
          )}
      </div>
    </Card>
  );
}
