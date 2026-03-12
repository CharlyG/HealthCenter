/**
 * Vendor Configuration Panel
 * 
 * Secure configuration interface for vendor-specific settings including
 * API endpoints, credentials, account identifiers, and webhook URLs.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Settings,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  Globe,
  Key,
  Webhook,
  Save,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { INTEGRATION_CATEGORIES, VENDORS } from '../../lib/integrationTypes';
import type { IntegrationCardData, EnvironmentMode } from '../../pages/IntegrationManagementWorkspace';

interface VendorConfigurationPanelProps {
  integration: IntegrationCardData;
  onClose: () => void;
  onSave: (config: any) => void;
}

export default function VendorConfigurationPanel({
  integration,
  onClose,
  onSave,
}: VendorConfigurationPanelProps) {
  const category = INTEGRATION_CATEGORIES[integration.category];
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Mock configuration - in production, load from API
  const [config, setConfig] = useState({
    vendorId: integration.vendor || '',
    environmentMode: integration.environmentMode,
    apiEndpoint: 'https://api.example.com/v1',
    apiKey: '*********************',
    apiSecret: '*********************',
    accountId: 'ACC-12345',
    webhookUrl: 'https://yourapp.com/webhooks/integration',
    customField1: '',
    customField2: '',
  });

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setTestResult({
      success: Math.random() > 0.3,
      message: Math.random() > 0.3
        ? 'Connection successful! All credentials validated.'
        : 'Connection failed: Invalid API key or endpoint.',
    });
    setTesting(false);
  };

  const handleSave = () => {
    onSave(config);
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{category.icon}</span>
            {category.label} Configuration
          </DialogTitle>
          <DialogDescription>
            Configure vendor settings and credentials for {integration.vendor || 'this integration'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Environment Mode */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Environment Mode
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {(['disabled', 'mock', 'test', 'production'] as EnvironmentMode[]).map((mode) => (
                <Button
                  key={mode}
                  variant={config.environmentMode === mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setConfig({ ...config, environmentMode: mode })}
                  className="capitalize"
                >
                  {mode}
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {config.environmentMode === 'disabled' && 'Integration is completely disabled'}
              {config.environmentMode === 'mock' && 'Uses simulated responses, no external calls'}
              {config.environmentMode === 'test' && 'Connects to vendor test/sandbox environment'}
              {config.environmentMode === 'production' && 'Live production environment'}
            </p>
          </div>

          {/* API Endpoint */}
          <div>
            <Label htmlFor="apiEndpoint" className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4" />
              API Endpoint
            </Label>
            <Input
              id="apiEndpoint"
              value={config.apiEndpoint}
              onChange={(e) => setConfig({ ...config, apiEndpoint: e.target.value })}
              placeholder="https://api.vendor.com/v1"
            />
            <p className="text-xs text-gray-600 mt-1">Base URL for API requests</p>
          </div>

          {/* API Key */}
          <div>
            <Label htmlFor="apiKey" className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4" />
              API Key
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs ml-auto">
                <Shield className="w-3 h-3 mr-1" />
                Encrypted
              </Badge>
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showSecrets.apiKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="Enter API key"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => toggleSecretVisibility('apiKey')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showSecrets.apiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* API Secret */}
          <div>
            <Label htmlFor="apiSecret" className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4" />
              API Secret
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs ml-auto">
                <Shield className="w-3 h-3 mr-1" />
                Encrypted
              </Badge>
            </Label>
            <div className="relative">
              <Input
                id="apiSecret"
                type={showSecrets.apiSecret ? 'text' : 'password'}
                value={config.apiSecret}
                onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                placeholder="Enter API secret"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => toggleSecretVisibility('apiSecret')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showSecrets.apiSecret ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Account ID */}
          <div>
            <Label htmlFor="accountId" className="mb-2 block">
              Account Identifier
            </Label>
            <Input
              id="accountId"
              value={config.accountId}
              onChange={(e) => setConfig({ ...config, accountId: e.target.value })}
              placeholder="Your account ID or agency ID"
            />
          </div>

          {/* Webhook URL */}
          <div>
            <Label htmlFor="webhookUrl" className="flex items-center gap-2 mb-2">
              <Webhook className="w-4 h-4" />
              Webhook URL
            </Label>
            <Input
              id="webhookUrl"
              value={config.webhookUrl}
              onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
              placeholder="https://yourapp.com/webhooks/..."
            />
            <p className="text-xs text-gray-600 mt-1">
              Callback URL for async notifications and updates
            </p>
          </div>

          {/* Vendor-Specific Fields */}
          {integration.category === 'evv' && (
            <>
              <div>
                <Label htmlFor="customField1" className="mb-2 block">
                  Agency Provider ID
                </Label>
                <Input
                  id="customField1"
                  value={config.customField1}
                  onChange={(e) => setConfig({ ...config, customField1: e.target.value })}
                  placeholder="Provider ID from EVV vendor"
                />
              </div>
              <div>
                <Label htmlFor="customField2" className="mb-2 block">
                  Transmission Frequency
                </Label>
                <select
                  value={config.customField2}
                  onChange={(e) => setConfig({ ...config, customField2: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">Select frequency</option>
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </>
          )}

          {/* Connection Test */}
          <Card className="p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 text-sm">Connection Test</h4>
              <Button size="sm" onClick={handleTest} disabled={testing}>
                {testing ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Settings className="w-3 h-3 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>

            {testResult && (
              <div
                className={cn(
                  'flex items-start gap-2 p-3 rounded-lg text-sm',
                  testResult.success
                    ? 'bg-green-100 border border-green-300'
                    : 'bg-red-100 border border-red-300'
                )}
              >
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <div
                    className={cn(
                      'font-medium mb-1',
                      testResult.success ? 'text-green-900' : 'text-red-900'
                    )}
                  >
                    {testResult.success ? 'Test Passed' : 'Test Failed'}
                  </div>
                  <div
                    className={cn(
                      'text-xs',
                      testResult.success ? 'text-green-700' : 'text-red-700'
                    )}
                  >
                    {testResult.message}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
