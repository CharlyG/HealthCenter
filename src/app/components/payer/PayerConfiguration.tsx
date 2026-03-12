/**
 * Payer Configuration
 * Admin screen to configure clearinghouse provider, payer endpoints, credentials
 */
import React, { useState, useEffect } from 'react';
import { cn } from '../ui/utils';
import {
  Building2, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, XCircle, Loader2, Key, Globe,
  Shield, AlertCircle, Eye, EyeOff, Copy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { LoadingState } from '../design-system/LoadingState';
import { fetchPayerConfig, savePayerConfig, testPayerConnection } from '../../lib/payerApi';
import { toast } from 'sonner';

interface ClearinghouseConfig {
  provider: 'change_healthcare' | 'availity' | 'waystar' | 'trizetto' | 'other';
  apiUrl: string;
  submitterId: string;
  username: string;
  password: string;
  apiKey?: string;
  testMode: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

interface PayerEndpoint {
  id: string;
  payerName: string;
  payerId: string;
  eligibilityEnabled: boolean;
  authorizationEnabled: boolean;
  claimSubmissionEnabled: boolean;
  claimStatusEnabled: boolean;
  eraEnabled: boolean;
  endpoint?: string;
  credentials?: {
    username?: string;
    password?: string;
    apiKey?: string;
  };
  customSettings?: Record<string, any>;
}

const CLEARINGHOUSE_PROVIDERS = [
  { value: 'change_healthcare', label: 'Change Healthcare' },
  { value: 'availity', label: 'Availity' },
  { value: 'waystar', label: 'Waystar' },
  { value: 'trizetto', label: 'TriZetto' },
  { value: 'other', label: 'Other' },
];

const MAJOR_PAYERS = [
  'Medicare',
  'Medicaid',
  'Blue Cross Blue Shield',
  'UnitedHealthcare',
  'Aetna',
  'Cigna',
  'Humana',
  'Anthem',
  'WellCare',
  'Centene',
];

// ─── Clearinghouse Configuration ───────────────────────────────────────────

const ClearinghouseConfiguration = React.memo(function ClearinghouseConfiguration({
  config,
  onSave,
  onTest,
}: {
  config: ClearinghouseConfig;
  onSave: (config: ClearinghouseConfig) => void;
  onTest: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ClearinghouseConfig>(config);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    onSave(formData);
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData(config);
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Clearinghouse Configuration
          </CardTitle>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit2 className="size-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className={cn(
          'p-4 rounded-lg border-2 flex items-center justify-between',
          config.status === 'connected' ? 'bg-green-50 border-green-200' :
          config.status === 'error' ? 'bg-red-50 border-red-200' :
          'bg-gray-50 border-gray-200'
        )}>
          <div className="flex items-center gap-3">
            {config.status === 'connected' ? (
              <CheckCircle2 className="size-6 text-green-600" />
            ) : config.status === 'error' ? (
              <XCircle className="size-6 text-red-600" />
            ) : (
              <AlertCircle className="size-6 text-gray-600" />
            )}
            <div>
              <p className={cn(
                'font-semibold',
                config.status === 'connected' ? 'text-green-900' :
                config.status === 'error' ? 'text-red-900' :
                'text-gray-900'
              )}>
                {config.status === 'connected' ? 'Connected' :
                 config.status === 'error' ? 'Connection Error' :
                 'Not Connected'}
              </p>
              {config.lastSync && (
                <p className="text-xs text-gray-600 mt-0.5">
                  Last sync: {new Date(config.lastSync).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onTest}>
            Test Connection
          </Button>
        </div>

        {/* Provider Selection */}
        <div>
          <Label htmlFor="provider">Clearinghouse Provider *</Label>
          <Select
            value={formData.provider}
            onValueChange={(value: any) => setFormData({ ...formData, provider: value })}
            disabled={!editing}
          >
            <SelectTrigger id="provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLEARINGHOUSE_PROVIDERS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* API URL */}
        <div>
          <Label htmlFor="apiUrl">API URL *</Label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Globe className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="apiUrl"
                value={formData.apiUrl}
                onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                disabled={!editing}
                className="pl-10"
                placeholder="https://api.clearinghouse.com"
              />
            </div>
            {editing && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(formData.apiUrl);
                  toast.success('Copied to clipboard');
                }}
              >
                <Copy className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Submitter ID */}
        <div>
          <Label htmlFor="submitterId">Submitter ID *</Label>
          <Input
            id="submitterId"
            value={formData.submitterId}
            onChange={(e) => setFormData({ ...formData, submitterId: e.target.value })}
            disabled={!editing}
            placeholder="Your submitter/sender ID"
          />
        </div>

        {/* Credentials */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={!editing}
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={!editing}
                autoComplete="off"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* API Key (Optional) */}
        <div>
          <Label htmlFor="apiKey">API Key (Optional)</Label>
          <div className="relative">
            <Key className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              value={formData.apiKey || ''}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              disabled={!editing}
              className="pl-10 pr-10"
              placeholder="Optional API key for enhanced security"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Test Mode */}
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <input
            type="checkbox"
            id="testMode"
            checked={formData.testMode}
            onChange={(e) => setFormData({ ...formData, testMode: e.target.checked })}
            disabled={!editing}
            className="w-4 h-4"
          />
          <label htmlFor="testMode" className="text-sm text-amber-900 flex-1">
            <span className="font-semibold">Test Mode</span>
            <p className="text-xs mt-0.5">Enable to use sandbox/testing environment</p>
          </label>
        </div>

        {/* Actions */}
        {editing && (
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              <X className="size-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Save className="size-4 mr-1" />
              Save Configuration
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// ─── Payer Endpoint Card ───────────────────────────────────────────────────

const PayerEndpointCard = React.memo(function PayerEndpointCard({
  endpoint,
  onEdit,
  onDelete,
}: {
  endpoint: PayerEndpoint;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const enabledCount = [
    endpoint.eligibilityEnabled,
    endpoint.authorizationEnabled,
    endpoint.claimSubmissionEnabled,
    endpoint.claimStatusEnabled,
    endpoint.eraEnabled,
  ].filter(Boolean).length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">{endpoint.payerName}</h3>
              <Badge variant="outline" className="text-xs">
                ID: {endpoint.payerId}
              </Badge>
            </div>
            
            {/* Enabled Services */}
            <div className="flex flex-wrap gap-2 mb-3">
              {endpoint.eligibilityEnabled && (
                <Badge className="text-xs bg-blue-50 text-blue-700">Eligibility</Badge>
              )}
              {endpoint.authorizationEnabled && (
                <Badge className="text-xs bg-green-50 text-green-700">Authorization</Badge>
              )}
              {endpoint.claimSubmissionEnabled && (
                <Badge className="text-xs bg-purple-50 text-purple-700">Claims</Badge>
              )}
              {endpoint.claimStatusEnabled && (
                <Badge className="text-xs bg-amber-50 text-amber-700">Status</Badge>
              )}
              {endpoint.eraEnabled && (
                <Badge className="text-xs bg-emerald-50 text-emerald-700">ERA</Badge>
              )}
            </div>

            <p className="text-xs text-gray-600">
              {enabledCount} service{enabledCount !== 1 ? 's' : ''} enabled
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="size-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="size-3 text-red-600" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// ─── Main Component ────────────────────────────────────────────────────────

export const PayerConfiguration = React.memo(function PayerConfiguration() {
  const [clearinghouseConfig, setClearinghouseConfig] = useState<ClearinghouseConfig | null>(null);
  const [payerEndpoints, setPayerEndpoints] = useState<PayerEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await fetchPayerConfig();
      setClearinghouseConfig(data.clearinghouse);
      setPayerEndpoints(data.payers || []);
    } catch (err: any) {
      console.error('[PayerConfiguration] Error:', err);
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClearinghouse = async (config: ClearinghouseConfig) => {
    try {
      await savePayerConfig({ clearinghouse: config, payers: payerEndpoints });
      setClearinghouseConfig(config);
      toast.success('Clearinghouse configuration saved');
    } catch (err: any) {
      console.error('[PayerConfiguration] Save error:', err);
      toast.error('Failed to save configuration');
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const result = await testPayerConnection();
      if (result.success) {
        toast.success('Connection test successful');
        if (clearinghouseConfig) {
          setClearinghouseConfig({
            ...clearinghouseConfig,
            status: 'connected',
            lastSync: new Date().toISOString(),
          });
        }
      } else {
        toast.error(result.message || 'Connection test failed');
        if (clearinghouseConfig) {
          setClearinghouseConfig({
            ...clearinghouseConfig,
            status: 'error',
          });
        }
      }
    } catch (err: any) {
      console.error('[PayerConfiguration] Test error:', err);
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading payer configuration..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payer Configuration</h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure clearinghouse provider, payer endpoints, and authentication credentials
        </p>
      </div>

      {/* Security Notice */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="size-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Security Notice</p>
              <p className="text-sm text-blue-800 mt-1">
                All credentials are encrypted and stored securely. API keys and passwords are never exposed in logs or error messages.
                Test connections thoroughly before enabling production mode.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clearinghouse Configuration */}
      {clearinghouseConfig && (
        <ClearinghouseConfiguration
          config={clearinghouseConfig}
          onSave={handleSaveClearinghouse}
          onTest={handleTestConnection}
        />
      )}

      {/* Payer Endpoints */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payer Endpoints</CardTitle>
            <Button size="sm">
              <Plus className="size-4 mr-1" />
              Add Payer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payerEndpoints.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="size-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No payer endpoints configured</p>
              <p className="text-sm text-gray-500 mt-1">
                Add payers to enable direct integrations for eligibility, authorizations, and claims
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {payerEndpoints.map((endpoint) => (
                <PayerEndpointCard
                  key={endpoint.id}
                  endpoint={endpoint}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
