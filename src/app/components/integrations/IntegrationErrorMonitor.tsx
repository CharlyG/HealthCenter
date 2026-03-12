/**
 * Integration Error Monitor
 * 
 * Dashboard displaying recent integration failures including EVV transmission
 * errors, SMS delivery failures, fax errors, and medication lookup failures.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/badge';
import { Badge } from '../ui/badge';
import {
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { IntegrationCategory } from '../../lib/integrationTypes';

interface IntegrationError {
  id: string;
  category: IntegrationCategory;
  vendor: string;
  timestamp: string;
  errorType: string;
  description: string;
  retryCount: number;
  canRetry: boolean;
  affectedResource?: string;
}

export default function IntegrationErrorMonitor() {
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'all'>('all');

  // Mock data
  const errors: IntegrationError[] = [
    {
      id: 'err-001',
      category: 'evv',
      vendor: 'HHAeXchange',
      timestamp: '2024-03-10T14:30:00Z',
      errorType: 'Transmission Failed',
      description: 'EVV visit VST-12345 failed to transmit - network timeout after 30s',
      retryCount: 2,
      canRetry: true,
      affectedResource: 'Visit VST-12345',
    },
    {
      id: 'err-002',
      category: 'sms',
      vendor: 'Twilio',
      timestamp: '2024-03-10T14:25:00Z',
      errorType: 'Delivery Failed',
      description: 'SMS to +15551234567 failed - invalid phone number format',
      retryCount: 0,
      canRetry: false,
      affectedResource: 'Message MSG-789',
    },
    {
      id: 'err-003',
      category: 'fax',
      vendor: 'SRFax',
      timestamp: '2024-03-10T14:20:00Z',
      errorType: 'Authentication Error',
      description: 'Fax transmission failed - API key expired or invalid',
      retryCount: 3,
      canRetry: false,
      affectedResource: 'Fax FAX-456',
    },
    {
      id: 'err-004',
      category: 'medication',
      vendor: 'Medispan',
      timestamp: '2024-03-10T14:15:00Z',
      errorType: 'Lookup Failed',
      description: 'Drug interaction check failed - service temporarily unavailable',
      retryCount: 1,
      canRetry: true,
      affectedResource: 'Query for Lisinopril',
    },
    {
      id: 'err-005',
      category: 'email',
      vendor: 'SendGrid',
      timestamp: '2024-03-10T14:10:00Z',
      errorType: 'Bounce',
      description: 'Email bounced - recipient mailbox full',
      retryCount: 0,
      canRetry: false,
      affectedResource: 'Email to patient@example.com',
    },
  ];

  const filteredErrors = errors.filter((err) =>
    selectedCategory === 'all' ? true : err.category === selectedCategory
  );

  const handleRetry = (errorId: string) => {
    console.log('Retrying error:', errorId);
    // In production, trigger retry logic
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{errors.length}</span>
          </div>
          <div className="text-sm text-gray-600">Total Errors</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">
              {errors.filter((e) => e.canRetry).length}
            </span>
          </div>
          <div className="text-sm text-gray-600">Retryable</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-gray-600" />
            <span className="text-2xl font-bold text-gray-900">
              {errors.filter((e) => !e.canRetry).length}
            </span>
          </div>
          <div className="text-sm text-gray-600">Permanent</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-2xl font-bold text-amber-900">
              {errors.reduce((sum, e) => sum + e.retryCount, 0)}
            </span>
          </div>
          <div className="text-sm text-gray-600">Total Retries</div>
        </Card>
      </div>

      {/* Category Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All ({errors.length})
          </Button>
          {(['evv', 'sms', 'email', 'fax', 'medication'] as IntegrationCategory[]).map((cat) => {
            const count = errors.filter((e) => e.category === cat).length;
            return count > 0 ? (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.toUpperCase()} ({count})
              </Button>
            ) : null;
          })}
        </div>
      </Card>

      {/* Error List */}
      <div className="space-y-3">
        {filteredErrors.map((error) => (
          <IntegrationErrorCard
            key={error.id}
            error={error}
            onRetry={() => handleRetry(error.id)}
          />
        ))}
      </div>

      {filteredErrors.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-600">No errors found</p>
        </Card>
      )}
    </div>
  );
}

function IntegrationErrorCard({
  error,
  onRetry,
}: {
  error: IntegrationError;
  onRetry: () => void;
}) {
  return (
    <Card className="p-4 border-l-4 border-l-red-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="font-semibold text-gray-900">{error.errorType}</span>
            <Badge variant="outline" className="text-xs">
              {error.vendor}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {error.category.toUpperCase()}
            </Badge>
            {error.retryCount > 0 && (
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                {error.retryCount} retries
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-700 mb-2">{error.description}</p>

          {error.affectedResource && (
            <div className="text-xs text-gray-600 mb-2">
              Affected: {error.affectedResource}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(error.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        {error.canRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </Card>
  );
}
