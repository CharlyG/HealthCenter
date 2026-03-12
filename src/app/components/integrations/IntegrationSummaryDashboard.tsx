/**
 * Integration Summary Dashboard
 * 
 * High-level overview of integration health including connected integrations,
 * failed integrations, pending configurations, and recent errors.
 */

import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { INTEGRATION_CATEGORIES } from '../../lib/integrationTypes';
import type { IntegrationCategory } from '../../lib/integrationTypes';

interface IntegrationSummaryDashboardProps {
  onNavigateToIntegration?: (category: IntegrationCategory) => void;
}

export default function IntegrationSummaryDashboard({
  onNavigateToIntegration,
}: IntegrationSummaryDashboardProps) {
  // Mock data
  const summary = {
    connected: 7,
    disconnected: 3,
    errors: 2,
    pending: 2,
    totalCategories: 12,
    healthScore: 85,
    last24Hours: {
      transactions: 12450,
      errors: 187,
      avgResponseTime: 245,
    },
  };

  const connectedIntegrations: IntegrationCategory[] = [
    'evv',
    'medication',
    'sms',
    'email',
    'push-notifications',
    'maps-routing',
    'electronic-signatures',
  ];

  const failedIntegrations = [
    {
      category: 'fax' as IntegrationCategory,
      vendor: 'SRFax',
      error: 'Authentication failed - API key expired',
      timestamp: '2024-03-10T14:20:00Z',
    },
  ];

  const pendingConfigurations: IntegrationCategory[] = ['claims-clearinghouse', 'ehr'];

  const recentErrors = [
    {
      category: 'evv' as IntegrationCategory,
      vendor: 'HHAeXchange',
      error: 'Visit transmission timeout',
      timestamp: '2024-03-10T14:30:00Z',
      severity: 'medium' as const,
    },
    {
      category: 'fax' as IntegrationCategory,
      vendor: 'SRFax',
      error: 'Authentication failed',
      timestamp: '2024-03-10T14:20:00Z',
      severity: 'high' as const,
    },
    {
      category: 'sms' as IntegrationCategory,
      vendor: 'Twilio',
      error: 'Rate limit exceeded',
      timestamp: '2024-03-10T13:45:00Z',
      severity: 'low' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Health Score */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Integration Health</h2>
            <p className="text-sm text-gray-600">Overall system integration status</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-900">{summary.healthScore}%</div>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 mt-2">
              <TrendingUp className="w-3 h-3 mr-1" />
              Healthy
            </Badge>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{summary.connected}</span>
          </div>
          <div className="text-sm text-gray-600">Connected</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{summary.errors}</span>
          </div>
          <div className="text-sm text-gray-600">Failed</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-2xl font-bold text-amber-900">{summary.pending}</span>
          </div>
          <div className="text-sm text-gray-600">Pending Setup</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">
              {summary.last24Hours.transactions.toLocaleString()}
            </span>
          </div>
          <div className="text-sm text-gray-600">24h Transactions</div>
        </Card>
      </div>

      {/* Connected Integrations */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Connected Integrations ({summary.connected})
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {connectedIntegrations.map((categoryId) => {
            const category = INTEGRATION_CATEGORIES[categoryId];
            return (
              <div
                key={categoryId}
                className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => onNavigateToIntegration?.(categoryId)}
              >
                <span className="text-xl">{category.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {category.label}
                  </div>
                </div>
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Failed Integrations */}
      {failedIntegrations.length > 0 && (
        <Card className="p-6 border-l-4 border-l-red-500">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            Failed Integrations ({failedIntegrations.length})
          </h3>
          <div className="space-y-3">
            {failedIntegrations.map((integration, i) => {
              const category = INTEGRATION_CATEGORIES[integration.category];
              return (
                <div
                  key={i}
                  className="flex items-start justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{category.label}</div>
                      <div className="text-sm text-gray-700">{integration.vendor}</div>
                      <div className="text-xs text-red-700 mt-1">{integration.error}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(integration.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigateToIntegration?.(integration.category)}
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Fix
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Pending Configurations */}
      {pendingConfigurations.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Pending Configurations ({pendingConfigurations.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {pendingConfigurations.map((categoryId) => {
              const category = INTEGRATION_CATEGORIES[categoryId];
              return (
                <div
                  key={categoryId}
                  className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
                  onClick={() => onNavigateToIntegration?.(categoryId)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{category.label}</div>
                      <div className="text-xs text-gray-600">Not configured</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent Errors */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Errors (Last 24h)</h3>
        <div className="space-y-2">
          {recentErrors.map((error, i) => {
            const category = INTEGRATION_CATEGORIES[error.category];
            return (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border-l-4',
                  error.severity === 'high'
                    ? 'bg-red-50 border-l-red-500'
                    : error.severity === 'medium'
                    ? 'bg-amber-50 border-l-amber-500'
                    : 'bg-blue-50 border-l-blue-500'
                )}
              >
                <span className="text-xl">{category.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{category.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {error.vendor}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        error.severity === 'high'
                          ? 'bg-red-100 text-red-700 border-red-300'
                          : error.severity === 'medium'
                          ? 'bg-amber-100 text-amber-700 border-amber-300'
                          : 'bg-blue-100 text-blue-700 border-blue-300'
                      )}
                    >
                      {error.severity}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-700">{error.error}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {new Date(error.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
