/**
 * Integration Management Workspace
 * 
 * Centralized workspace for managing all platform integrations including
 * EVV, Medication, SMS, Email, Fax, Push Notifications, and Mapping services.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Eye,
  Wrench,
  RefreshCw,
  Zap,
  List,
  AlertOctagon,
  BarChart3,
  Shield,
  FileText,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  INTEGRATION_CATEGORIES,
  type IntegrationCategory,
  type IntegrationConfig,
} from '../lib/integrationTypes';
import VendorConfigurationPanel from '../components/integrations/VendorConfigurationPanel';
import IntegrationTestingInterface from '../components/integrations/IntegrationTestingInterface';
import IntegrationLogsViewer from '../components/integrations/IntegrationLogsViewer';
import IntegrationErrorMonitor from '../components/integrations/IntegrationErrorMonitor';
import IntegrationQueueMonitor from '../components/integrations/IntegrationQueueMonitor';
import IntegrationAuditLog from '../components/integrations/IntegrationAuditLog';
import IntegrationPerformanceMetrics from '../components/integrations/IntegrationPerformanceMetrics';
import IntegrationPermissionsPanel from '../components/integrations/IntegrationPermissionsPanel';
import IntegrationDocumentationPanel from '../components/integrations/IntegrationDocumentationPanel';
import IntegrationSummaryDashboard from '../components/integrations/IntegrationSummaryDashboard';
import VendorSwitchingWorkflow from '../components/integrations/VendorSwitchingWorkflow';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type EnvironmentMode = 'disabled' | 'mock' | 'test' | 'production';

export interface IntegrationCardData {
  category: IntegrationCategory;
  vendor?: string;
  connectionStatus: 'connected' | 'disconnected' | 'incomplete' | 'error';
  environmentMode: EnvironmentMode;
  lastConnected?: string;
  lastError?: string;
  config?: IntegrationConfig;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN WORKSPACE
// ═══════════════════════════════════════════════════════════════════════════

export default function IntegrationManagementWorkspace() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'logs' | 'errors' | 'queue' | 'audit' | 'metrics' | 'permissions'>('dashboard');
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationCardData | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);

  // Mock data - in production, fetch from API
  const integrations: IntegrationCardData[] = [
    {
      category: 'evv',
      vendor: 'HHAeXchange',
      connectionStatus: 'connected',
      environmentMode: 'production',
      lastConnected: '2024-03-10T14:30:00Z',
    },
    {
      category: 'medication',
      vendor: 'Medispan',
      connectionStatus: 'connected',
      environmentMode: 'production',
      lastConnected: '2024-03-10T14:25:00Z',
    },
    {
      category: 'sms',
      vendor: 'Twilio',
      connectionStatus: 'connected',
      environmentMode: 'production',
      lastConnected: '2024-03-10T14:20:00Z',
    },
    {
      category: 'email',
      vendor: 'SendGrid',
      connectionStatus: 'connected',
      environmentMode: 'production',
      lastConnected: '2024-03-10T14:15:00Z',
    },
    {
      category: 'fax',
      vendor: 'SRFax',
      connectionStatus: 'error',
      environmentMode: 'production',
      lastConnected: '2024-03-10T10:00:00Z',
      lastError: 'Authentication failed - invalid API key',
    },
    {
      category: 'push-notifications',
      vendor: 'Firebase',
      connectionStatus: 'connected',
      environmentMode: 'test',
      lastConnected: '2024-03-10T14:10:00Z',
    },
    {
      category: 'maps-routing',
      vendor: 'Google Maps',
      connectionStatus: 'connected',
      environmentMode: 'production',
      lastConnected: '2024-03-10T14:05:00Z',
    },
    {
      category: 'electronic-signatures',
      vendor: 'DocuSign',
      connectionStatus: 'incomplete',
      environmentMode: 'test',
    },
    {
      category: 'claims-clearinghouse',
      connectionStatus: 'disconnected',
      environmentMode: 'disabled',
    },
    {
      category: 'ehr',
      connectionStatus: 'disconnected',
      environmentMode: 'disabled',
    },
    {
      category: 'lab-interface',
      connectionStatus: 'disconnected',
      environmentMode: 'disabled',
    },
    {
      category: 'pharmacy',
      connectionStatus: 'disconnected',
      environmentMode: 'mock',
    },
  ];

  const connectedCount = integrations.filter((i) => i.connectionStatus === 'connected').length;
  const errorCount = integrations.filter((i) => i.connectionStatus === 'error').length;
  const incompleteCount = integrations.filter((i) => i.connectionStatus === 'incomplete').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Integration Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Configure and monitor external service integrations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{connectedCount}/12</div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
              {errorCount > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-700">{errorCount}</div>
                  <div className="text-xs text-red-600">Errors</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-900">{connectedCount}</span>
            </div>
            <div className="text-sm text-gray-600">Connected</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-2xl font-bold text-red-900">{errorCount}</span>
            </div>
            <div className="text-sm text-gray-600">Errors</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="text-2xl font-bold text-amber-900">{incompleteCount}</span>
            </div>
            <div className="text-sm text-gray-600">Incomplete</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">12</span>
            </div>
            <div className="text-sm text-gray-600">Total Categories</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid grid-cols-8 w-full mb-6">
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="overview">
              <Settings className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="logs">
              <List className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="errors">
              <AlertOctagon className="w-4 h-4 mr-2" />
              Errors
            </TabsTrigger>
            <TabsTrigger value="queue">
              <Clock className="w-4 h-4 mr-2" />
              Queue
            </TabsTrigger>
            <TabsTrigger value="audit">
              <FileText className="w-4 h-4 mr-2" />
              Audit
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Shield className="w-4 h-4 mr-2" />
              Access
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <IntegrationSummaryDashboard />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-3 gap-4">
              {integrations.map((integration) => (
                <IntegrationCard
                  key={integration.category}
                  integration={integration}
                  onConfigure={() => {
                    setSelectedIntegration(integration);
                    setShowConfigPanel(true);
                  }}
                  onTest={() => {
                    setSelectedIntegration(integration);
                    setShowTestPanel(true);
                  }}
                  onViewLogs={() => {
                    setSelectedIntegration(integration);
                    setActiveTab('logs');
                  }}
                />
              ))}
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <IntegrationLogsViewer selectedIntegration={selectedIntegration?.category} />
          </TabsContent>

          {/* Errors Tab */}
          <TabsContent value="errors">
            <IntegrationErrorMonitor />
          </TabsContent>

          {/* Queue Tab */}
          <TabsContent value="queue">
            <IntegrationQueueMonitor />
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit">
            <IntegrationAuditLog />
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics">
            <IntegrationPerformanceMetrics />
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <IntegrationPermissionsPanel />
          </TabsContent>
        </Tabs>
      </div>

      {/* Configuration Panel */}
      {showConfigPanel && selectedIntegration && (
        <VendorConfigurationPanel
          integration={selectedIntegration}
          onClose={() => {
            setShowConfigPanel(false);
            setSelectedIntegration(null);
          }}
          onSave={() => {
            setShowConfigPanel(false);
            setSelectedIntegration(null);
            // Refresh data
          }}
        />
      )}

      {/* Testing Panel */}
      {showTestPanel && selectedIntegration && (
        <IntegrationTestingInterface
          integration={selectedIntegration}
          onClose={() => {
            setShowTestPanel(false);
            setSelectedIntegration(null);
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION CARD
// ═══════════════════════════════════════════════════════════════════════════

interface IntegrationCardProps {
  integration: IntegrationCardData;
  onConfigure: () => void;
  onTest: () => void;
  onViewLogs: () => void;
}

function IntegrationCard({ integration, onConfigure, onTest, onViewLogs }: IntegrationCardProps) {
  const category = INTEGRATION_CATEGORIES[integration.category];

  const statusConfig = {
    connected: {
      icon: CheckCircle,
      color: 'green',
      label: 'Connected',
    },
    disconnected: {
      icon: XCircle,
      color: 'gray',
      label: 'Disconnected',
    },
    incomplete: {
      icon: AlertTriangle,
      color: 'amber',
      label: 'Incomplete',
    },
    error: {
      icon: XCircle,
      color: 'red',
      label: 'Error',
    },
  };

  const modeConfig = {
    disabled: { color: 'gray', label: 'Disabled' },
    mock: { color: 'purple', label: 'Mock' },
    test: { color: 'blue', label: 'Test' },
    production: { color: 'green', label: 'Production' },
  };

  const status = statusConfig[integration.connectionStatus];
  const StatusIcon = status.icon;
  const mode = modeConfig[integration.environmentMode];

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{category.label}</h3>
            {integration.vendor && (
              <p className="text-xs text-gray-600">{integration.vendor}</p>
            )}
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            status.color === 'green'
              ? 'bg-green-100 text-green-700 border-green-300'
              : status.color === 'red'
              ? 'bg-red-100 text-red-700 border-red-300'
              : status.color === 'amber'
              ? 'bg-amber-100 text-amber-700 border-amber-300'
              : 'bg-gray-100 text-gray-700 border-gray-300'
          )}
        >
          <StatusIcon className="w-3 h-3 mr-1" />
          {status.label}
        </Badge>
      </div>

      {/* Environment Mode */}
      <div className="mb-3">
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            mode.color === 'green'
              ? 'bg-green-100 text-green-700 border-green-300'
              : mode.color === 'blue'
              ? 'bg-blue-100 text-blue-700 border-blue-300'
              : mode.color === 'purple'
              ? 'bg-purple-100 text-purple-700 border-purple-300'
              : 'bg-gray-100 text-gray-700 border-gray-300'
          )}
        >
          {mode.label}
        </Badge>
      </div>

      {/* Status Details */}
      <div className="space-y-1 mb-3 text-xs text-gray-600">
        {integration.lastConnected && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Last: {new Date(integration.lastConnected).toLocaleString()}</span>
          </div>
        )}
        {integration.lastError && (
          <div className="flex items-start gap-1 text-red-700">
            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{integration.lastError}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={onConfigure}>
          <Settings className="w-3 h-3 mr-1" />
          Configure
        </Button>
        <Button variant="outline" size="sm" onClick={onTest}>
          <Play className="w-3 h-3 mr-1" />
          Test
        </Button>
        <Button variant="outline" size="sm" onClick={onViewLogs} className="col-span-2">
          <Eye className="w-3 h-3 mr-1" />
          View Logs
        </Button>
      </div>
    </Card>
  );
}