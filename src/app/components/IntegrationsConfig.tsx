import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as dataGateway from '../lib/dataGateway';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { toast } from 'sonner';
import { Plug, Eye, EyeOff, Loader2, PlayCircle, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface IntegrationCategory {
  category: string;
  categoryName: string;
  vendors: Vendor[];
}

interface Vendor {
  id: string;
  name: string;
  description: string;
  credentialFields: string[];
}

interface IntegrationSetting {
  org_id: string;
  category: string;
  vendor: string;
  state: 'disabled' | 'mock' | 'live';
  credentials: Record<string, string>;
  credentialsMasked?: boolean;
}

interface ExternalOperationLog {
  user_id: string;
  integration_category: string;
  vendor: string;
  operation: string;
  success: boolean;
  details: string;
  timestamp: string;
}

const stateColors = {
  disabled: 'bg-gray-100 text-gray-700 border-gray-300',
  mock: 'bg-amber-100 text-amber-800 border-amber-300',
  live: 'bg-green-100 text-green-800 border-green-300',
};

const stateIcons = {
  disabled: XCircle,
  mock: AlertTriangle,
  live: CheckCircle2,
};

export default function IntegrationsConfig() {
  const { profile } = useAuth();
  const [catalog, setCatalog] = useState<IntegrationCategory[]>([]);
  const [settings, setSettings] = useState<IntegrationSetting[]>([]);
  const [operationLogs, setOperationLogs] = useState<ExternalOperationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editState, setEditState] = useState<'disabled' | 'mock' | 'live'>('disabled');
  const [editVendor, setEditVendor] = useState<string>('');
  const [editCredentials, setEditCredentials] = useState<Record<string, string>>({});
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [profile?.org_id]);

  const loadData = async () => {
    if (!profile?.org_id) return;

    try {
      const [catalogRes, settingsRes, logsRes] = await Promise.all([
        dataGateway.getIntegrationCatalog(),
        dataGateway.getIntegrationSettings(profile.org_id),
        dataGateway.getExternalOperationLogs(),
      ]);

      setCatalog(catalogRes.catalog || []);
      setSettings(settingsRes.settings || []);
      setOperationLogs(logsRes.logs || []);
    } catch (error) {
      console.error('Error loading integrations data:', error);
      
      // Try to initialize catalog if it doesn't exist
      try {
        await dataGateway.initializeIntegrationCatalog();
        const catalogRes = await dataGateway.getIntegrationCatalog();
        setCatalog(catalogRes.catalog || []);
      } catch (initError) {
        console.error('Error initializing catalog:', initError);
        toast.error('Failed to load integrations');
      }
    }
  };

  const getSetting = (category: string): IntegrationSetting | undefined => {
    return settings.find(s => s.category === category);
  };

  const getCategoryData = (category: string): IntegrationCategory | undefined => {
    return catalog.find(c => c.category === category);
  };

  const openEditDialog = (category: string) => {
    const setting = getSetting(category);
    const categoryData = getCategoryData(category);
    
    setEditingCategory(category);
    setEditState(setting?.state || 'disabled');
    setEditVendor(setting?.vendor || categoryData?.vendors[0]?.id || '');
    setEditCredentials(setting?.credentials || {});
    setShowCredentials({});
  };

  const handleSave = async () => {
    if (!profile?.org_id || !editingCategory) return;

    setLoading(true);
    try {
      // Only send credentials if state is live
      const credentialsToSend = editState === 'live' ? editCredentials : {};
      
      await dataGateway.updateIntegrationSetting(
        profile.org_id,
        editingCategory,
        editVendor,
        editState,
        credentialsToSend
      );

      await loadData();
      setEditingCategory(null);
      toast.success('Integration settings updated successfully');
    } catch (error) {
      console.error('Error updating integration setting:', error);
      toast.error('Failed to update integration settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (category: string) => {
    if (!profile?.org_id) return;

    const setting = getSetting(category);
    if (!setting || setting.state === 'disabled') {
      toast.error('Integration must be enabled to test connection');
      return;
    }

    setTestingConnection(category);
    try {
      const result = await dataGateway.testIntegrationConnection(
        profile.org_id,
        category,
        setting.vendor
      );

      await loadData(); // Refresh logs

      if (result.success) {
        toast.success(`Connection test successful: ${result.details}`);
      } else {
        toast.error(`Connection test failed: ${result.details}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Failed to test connection');
    } finally {
      setTestingConnection(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatFieldName = (fieldName: string) => {
    // Convert camelCase to Title Case
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Integrations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="size-5 text-blue-600" />
            Integration Management
          </CardTitle>
          <CardDescription>
            Configure third-party integrations for EVV, SMS, Email, and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {catalog.map((categoryData) => {
              const setting = getSetting(categoryData.category);
              const state = setting?.state || 'disabled';
              const StateIcon = stateIcons[state];

              return (
                <div
                  key={categoryData.category}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{categoryData.categoryName}</h3>
                        <Badge variant="outline" className={stateColors[state]}>
                          <StateIcon className="size-3 mr-1" />
                          {state.toUpperCase()}
                        </Badge>
                        {setting && (
                          <Badge variant="outline" className="text-blue-700">
                            {setting.vendor}
                          </Badge>
                        )}
                      </div>
                      {setting && (
                        <p className="text-sm text-gray-600">
                          Active vendor: {categoryData.vendors.find(v => v.id === setting.vendor)?.name || setting.vendor}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {setting && setting.state !== 'disabled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestConnection(categoryData.category)}
                          disabled={testingConnection === categoryData.category}
                        >
                          {testingConnection === categoryData.category ? (
                            <>
                              <Loader2 className="size-4 mr-2 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            <>
                              <PlayCircle className="size-4 mr-2" />
                              Test Connection
                            </>
                          )}
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(categoryData.category)}
                          >
                            Configure
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Configure {categoryData.categoryName}</DialogTitle>
                            <DialogDescription>
                              Select a vendor and configure integration settings
                            </DialogDescription>
                          </DialogHeader>

                          {editingCategory === categoryData.category && (
                            <div className="space-y-4">
                              {/* State Selection */}
                              <div className="space-y-2">
                                <Label>Integration State</Label>
                                <Select value={editState} onValueChange={(value: any) => setEditState(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="disabled">
                                      <div className="flex items-center gap-2">
                                        <XCircle className="size-4" />
                                        <span>Disabled - Integration not active</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="mock">
                                      <div className="flex items-center gap-2">
                                        <AlertTriangle className="size-4" />
                                        <span>Mock Mode - Enabled without credentials</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="live">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4" />
                                        <span>Live Mode - Active with credentials</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Vendor Selection */}
                              {editState !== 'disabled' && (
                                <div className="space-y-2">
                                  <Label>Vendor</Label>
                                  <Select value={editVendor} onValueChange={setEditVendor}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categoryData.vendors.map((vendor) => (
                                        <SelectItem key={vendor.id} value={vendor.id}>
                                          <div>
                                            <div className="font-medium">{vendor.name}</div>
                                            <div className="text-xs text-gray-500">{vendor.description}</div>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {/* Credentials (only for live mode) */}
                              {editState === 'live' && editVendor && (
                                <div className="space-y-3">
                                  <Label>Credentials</Label>
                                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                                    <strong>⚠️ Security Note:</strong> In this POC, credentials are stored in the database 
                                    and marked as sensitive. In production, use encrypted storage or a secrets manager.
                                  </div>
                                  {(() => {
                                    const vendor = categoryData.vendors.find(v => v.id === editVendor);
                                    if (!vendor || vendor.credentialFields.length === 0) {
                                      return <p className="text-sm text-gray-500">No credentials required</p>;
                                    }

                                    return vendor.credentialFields.map((field) => (
                                      <div key={field} className="space-y-2">
                                        <Label htmlFor={field}>{formatFieldName(field)}</Label>
                                        <div className="relative">
                                          <Input
                                            id={field}
                                            type={showCredentials[field] ? 'text' : 'password'}
                                            value={editCredentials[field] || ''}
                                            onChange={(e) =>
                                              setEditCredentials({ ...editCredentials, [field]: e.target.value })
                                            }
                                            placeholder={`Enter ${formatFieldName(field)}`}
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() =>
                                              setShowCredentials({ ...showCredentials, [field]: !showCredentials[field] })
                                            }
                                          >
                                            {showCredentials[field] ? (
                                              <EyeOff className="size-4" />
                                            ) : (
                                              <Eye className="size-4" />
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    ));
                                  })()}
                                </div>
                              )}
                            </div>
                          )}

                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setEditingCategory(null)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={loading}>
                              {loading ? (
                                <>
                                  <Loader2 className="size-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save Changes'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* External Operation Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>External Operation Logs</CardTitle>
              <CardDescription>
                Connection tests and external API operations
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadData}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {operationLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No operation logs yet. Test a connection to see logs here.
                </div>
              ) : (
                operationLogs.map((log, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle2 className="size-4 text-green-600" />
                        ) : (
                          <XCircle className="size-4 text-red-600" />
                        )}
                        <Badge variant="outline" className="font-mono text-xs">
                          {log.operation}
                        </Badge>
                        <span className="text-sm font-medium text-gray-900">
                          {log.integration_category} / {log.vendor}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{log.details}</p>
                      <div className="text-xs text-gray-500 mt-1">User: {log.user_id}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
