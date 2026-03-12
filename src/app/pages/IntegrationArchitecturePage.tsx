/**
 * Integration Architecture Management Page
 * 
 * Centralized interface for configuring and managing external vendor integrations
 * across EVV, Medication, SMS, Email, Fax, Signatures, and more.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Plus,
  Settings,
  Check,
  AlertTriangle,
  XCircle,
  Activity,
  Shield,
  Eye,
  TestTube,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  INTEGRATION_CATEGORIES,
  VENDORS,
  type IntegrationCategory,
  type IntegrationConfig,
  type IntegrationStatus,
  type VendorId,
} from '../lib/integrationTypes';

export default function IntegrationArchitecturePage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'overview' | 'configure' | 'monitoring'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | null>(null);

  // Mock data - in production, fetch from API
  const mockConfigurations: IntegrationConfig[] = [
    {
      id: 'int-001',
      category: 'evv',
      vendorId: 'hhax',
      name: 'HHAeXchange Production',
      status: 'active',
      authType: 'api-key',
      credentials: { apiKey: '***' },
      endpoints: { baseUrl: 'https://api.hhaexchange.com/v1' },
      settings: { timeout: 30000, retryAttempts: 3 },
      isDefault: true,
      priority: 1,
      createdAt: '2024-01-15',
      updatedAt: '2024-03-01',
      lastTestedAt: '2024-03-10',
      lastTestResult: {
        success: true,
        timestamp: '2024-03-10T10:30:00Z',
        responseTime: 245,
        statusCode: 200,
        message: 'Connection successful',
      },
      createdBy: 'admin@agency.com',
      updatedBy: 'admin@agency.com',
    },
    {
      id: 'int-002',
      category: 'medication',
      vendorId: 'medispan',
      name: 'Medispan Drug Database',
      status: 'active',
      authType: 'oauth2',
      credentials: { clientId: '***', clientSecret: '***' },
      endpoints: { baseUrl: 'https://api.medispan.com' },
      settings: {},
      isDefault: true,
      priority: 1,
      createdAt: '2024-01-20',
      updatedAt: '2024-02-15',
      lastTestedAt: '2024-03-09',
      lastTestResult: {
        success: true,
        timestamp: '2024-03-09T14:20:00Z',
        responseTime: 180,
        statusCode: 200,
        message: 'Connection successful',
      },
      createdBy: 'admin@agency.com',
      updatedBy: 'admin@agency.com',
    },
    {
      id: 'int-003',
      category: 'sms',
      vendorId: 'twilio',
      name: 'Twilio SMS - Primary',
      status: 'active',
      authType: 'api-key',
      credentials: { accountSid: '***', authToken: '***' },
      endpoints: { baseUrl: 'https://api.twilio.com/2010-04-01' },
      settings: { fromNumber: '+15551234567' },
      isDefault: true,
      priority: 1,
      createdAt: '2024-02-01',
      updatedAt: '2024-02-28',
      createdBy: 'admin@agency.com',
      updatedBy: 'admin@agency.com',
    },
    {
      id: 'int-004',
      category: 'email',
      vendorId: 'sendgrid',
      name: 'SendGrid Transactional',
      status: 'active',
      authType: 'api-key',
      credentials: { apiKey: '***' },
      endpoints: { baseUrl: 'https://api.sendgrid.com/v3' },
      settings: { fromEmail: 'notifications@agency.com', fromName: 'Agency Notifications' },
      isDefault: true,
      priority: 1,
      createdAt: '2024-01-10',
      updatedAt: '2024-03-05',
      createdBy: 'admin@agency.com',
      updatedBy: 'admin@agency.com',
    },
    {
      id: 'int-005',
      category: 'electronic-signatures',
      vendorId: 'docusign',
      name: 'DocuSign eSignature',
      status: 'testing',
      authType: 'oauth2',
      credentials: { integrationKey: '***', clientSecret: '***' },
      endpoints: { baseUrl: 'https://demo.docusign.net/restapi' },
      settings: {},
      isDefault: true,
      priority: 1,
      createdAt: '2024-03-01',
      updatedAt: '2024-03-08',
      createdBy: 'admin@agency.com',
      updatedBy: 'admin@agency.com',
    },
  ];

  const categoriesWithIntegrations = Array.from(
    new Set(mockConfigurations.map((c) => c.category))
  );

  const categoriesWithoutIntegrations = Object.keys(INTEGRATION_CATEGORIES).filter(
    (cat) => !categoriesWithIntegrations.includes(cat as IntegrationCategory)
  ) as IntegrationCategory[];

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
                <h1 className="text-xl font-bold text-gray-900">Integration Architecture</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Configure external vendor integrations across the platform
                </p>
              </div>
            </div>

            <Button onClick={() => setActiveView('configure')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Architecture Overview */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Integration Architecture Overview</h2>
          <p className="text-sm text-gray-600 mb-4">
            The platform uses a vendor-agnostic abstraction layer that allows switching between
            providers without changing core application workflows. Each integration category
            implements a standard interface that vendors must conform to.
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm">12 Categories</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• EVV, Medication, Communication</li>
                <li>• Maps, Signatures, Claims</li>
                <li>• EHR, Lab, Pharmacy interfaces</li>
                <li>• Configurable vendor selection</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2 text-sm">25+ Vendors</h3>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• HHAeXchange, Sandata, WellSky</li>
                <li>• Medispan, First Databank</li>
                <li>• Twilio, SendGrid, DocuSign</li>
                <li>• Enterprise & standard tiers</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2 text-sm">Abstraction Layer</h3>
              <ul className="text-xs text-purple-800 space-y-1">
                <li>• Standard interfaces per category</li>
                <li>• Vendor adapters implement interfaces</li>
                <li>• Switch vendors without code changes</li>
                <li>• Multi-vendor support (failover)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* View Tabs */}
        <Card className="p-6 mb-6">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">
                <Activity className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="configure">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </TabsTrigger>
              <TabsTrigger value="monitoring">
                <Zap className="w-4 h-4 mr-2" />
                Monitoring
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        {/* Overview View */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Active Integrations */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Active Integrations ({mockConfigurations.length})
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {mockConfigurations.map((config) => (
                  <IntegrationCard
                    key={config.id}
                    config={config}
                    onClick={() => {
                      setSelectedCategory(config.category);
                      setActiveView('configure');
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Available Categories */}
            {categoriesWithoutIntegrations.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Available Integration Categories ({categoriesWithoutIntegrations.length})
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {categoriesWithoutIntegrations.map((categoryId) => {
                    const category = INTEGRATION_CATEGORIES[categoryId];
                    return (
                      <Card
                        key={categoryId}
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setSelectedCategory(categoryId);
                          setActiveView('configure');
                        }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{category.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{category.label}</h4>
                            {category.required && (
                              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs mt-1">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">{category.description}</p>
                        <Button variant="ghost" size="sm" className="w-full mt-3">
                          <Plus className="w-3 h-3 mr-1" />
                          Configure
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configure View */}
        {activeView === 'configure' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Select Integration Category</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(INTEGRATION_CATEGORIES).map(([id, category]) => (
                  <Card
                    key={id}
                    className={cn(
                      'p-4 cursor-pointer transition-all',
                      selectedCategory === id
                        ? 'border-2 border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    )}
                    onClick={() => setSelectedCategory(id as IntegrationCategory)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{category.icon}</span>
                      <h4 className="font-medium text-gray-900 text-sm">{category.label}</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{category.description}</p>
                    <div className="flex items-center gap-2">
                      {category.required && (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
                          Required
                        </Badge>
                      )}
                      {category.allowMultiple && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                          Multi-vendor
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {selectedCategory && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Available Vendors for {INTEGRATION_CATEGORIES[selectedCategory].label}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.values(VENDORS)
                    .filter((vendor) => vendor.categories.includes(selectedCategory))
                    .map((vendor) => (
                      <VendorCard
                        key={vendor.id}
                        vendor={vendor}
                        onSelect={() => alert(`Configure ${vendor.name}`)}
                      />
                    ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Monitoring View */}
        {activeView === 'monitoring' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Integration Health Status</h3>
              <div className="space-y-3">
                {mockConfigurations.map((config) => (
                  <IntegrationHealthCard key={config.id} config={config} />
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION CARD
// ═══════════════════════════════════════════════════════════════════════════

function IntegrationCard({
  config,
  onClick,
}: {
  config: IntegrationConfig;
  onClick: () => void;
}) {
  const category = INTEGRATION_CATEGORIES[config.category];
  const vendor = VENDORS[config.vendorId];

  const statusConfig: Record<IntegrationStatus, { color: string; icon: any }> = {
    active: { color: 'green', icon: Check },
    inactive: { color: 'gray', icon: XCircle },
    testing: { color: 'blue', icon: TestTube },
    error: { color: 'red', icon: AlertTriangle },
    'pending-setup': { color: 'amber', icon: Settings },
  };

  const status = statusConfig[config.status];
  const StatusIcon = status.icon;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h4 className="font-medium text-gray-900">{config.name}</h4>
            <p className="text-xs text-gray-600">{vendor.name}</p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            status.color === 'green'
              ? 'bg-green-100 text-green-700 border-green-300'
              : status.color === 'blue'
              ? 'bg-blue-100 text-blue-700 border-blue-300'
              : status.color === 'red'
              ? 'bg-red-100 text-red-700 border-red-300'
              : status.color === 'amber'
              ? 'bg-amber-100 text-amber-700 border-amber-300'
              : 'bg-gray-100 text-gray-700 border-gray-300'
          )}
        >
          <StatusIcon className="w-3 h-3 mr-1" />
          {config.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
        <div>
          <span className="font-medium">Category:</span> {category.label}
        </div>
        <div>
          <span className="font-medium">Auth:</span> {config.authType}
        </div>
        {config.lastTestedAt && (
          <div className="col-span-2">
            <span className="font-medium">Last tested:</span>{' '}
            {new Date(config.lastTestedAt).toLocaleDateString()}
            {config.lastTestResult && (
              <span
                className={cn(
                  'ml-2',
                  config.lastTestResult.success ? 'text-green-700' : 'text-red-700'
                )}
              >
                ({config.lastTestResult.responseTime}ms)
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); alert('Test connection'); }}>
          <TestTube className="w-3 h-3 mr-1" />
          Test
        </Button>
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          <Settings className="w-3 h-3 mr-1" />
          Configure
        </Button>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VENDOR CARD
// ═══════════════════════════════════════════════════════════════════════════

function VendorCard({ vendor, onSelect }: { vendor: any; onSelect: () => void }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{vendor.name}</h4>
          <p className="text-xs text-gray-600 mt-1">{vendor.description}</p>
        </div>

        <Badge variant="outline" className="text-xs">
          {vendor.tier}
        </Badge>
      </div>

      <div className="space-y-2 mb-3">
        <div className="text-xs">
          <span className="text-gray-600">Popularity:</span>{' '}
          <span className="text-amber-600">{'★'.repeat(vendor.popularity)}</span>
        </div>
        <div className="text-xs text-gray-600">
          Setup time: {vendor.estimatedSetupTime}
        </div>
        {vendor.requiresContract && (
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
            Requires Contract
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onSelect} className="flex-1">
          Select Vendor
        </Button>
        <Button variant="outline" size="sm">
          <Eye className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION HEALTH CARD
// ═══════════════════════════════════════════════════════════════════════════

function IntegrationHealthCard({ config }: { config: IntegrationConfig }) {
  const category = INTEGRATION_CATEGORIES[config.category];
  const vendor = VENDORS[config.vendorId];

  const isHealthy = config.status === 'active' && config.lastTestResult?.success;

  return (
    <div className={cn(
      'p-4 rounded-lg border-l-4',
      isHealthy ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xl">{category.icon}</span>
          <div>
            <h4 className="font-medium text-gray-900">{config.name}</h4>
            <p className="text-xs text-gray-600">{vendor.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <div className="text-gray-600 text-xs">Response Time</div>
            <div className="font-medium text-gray-900">
              {config.lastTestResult?.responseTime || '—'}ms
            </div>
          </div>

          <div className="text-right">
            <div className="text-gray-600 text-xs">Last Checked</div>
            <div className="font-medium text-gray-900">
              {config.lastTestedAt
                ? new Date(config.lastTestedAt).toLocaleTimeString()
                : '—'}
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              isHealthy
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'bg-red-100 text-red-700 border-red-300'
            )}
          >
            {isHealthy ? 'Healthy' : 'Down'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
