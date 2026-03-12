import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import * as dataGateway from '../lib/dataGateway';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { Settings, History, Building2, CheckCircle2, XCircle, Plug, Eye, EyeOff, Loader2, PlayCircle, ShieldAlert } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';
import IntegrationsConfig from '../components/IntegrationsConfig';
import RiskThresholdsConfig from '../components/RiskThresholdsConfig';

interface Office {
  id: string;
  name: string;
  org_id: string;
}

interface AuditLog {
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: string | null;
  new_value: string | null;
  timestamp: string;
}

export default function PlatformConfig() {
  const { profile } = useAuth();
  const { modules, features, moduleSettings, featureSettings, refreshConfig, loadFeatures, featuresLoading } = useConfig();
  const [offices, setOffices] = useState<Office[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('modules');

  useEffect(() => {
    loadData();
  }, [profile?.org_id]);

  // Lazy load features when user navigates to Features tab
  useEffect(() => {
    if (currentTab === 'features' && features.length === 0 && !featuresLoading) {
      console.log('[PlatformConfig] Lazy loading features for Features tab');
      loadFeatures();
    }
  }, [currentTab, features.length, featuresLoading, loadFeatures]);

  const loadData = async () => {
    if (!profile?.org_id) return;

    try {
      const [officesRes, auditRes] = await Promise.all([
        dataGateway.getOffices(profile.org_id),
        dataGateway.getAuditLogs(),
      ]);

      setOffices(officesRes.offices || []);
      setAuditLogs(auditRes.logs || []);
    } catch (error) {
      console.error('Error loading platform config data:', error);
      toast.error('Failed to load configuration data');
    }
  };

  const handleModuleToggle = async (moduleId: string, enabled: boolean) => {
    if (!profile?.org_id) return;

    setLoading(true);
    try {
      const existingSetting = moduleSettings.find(s => s.module_id === moduleId);
      
      await dataGateway.updateModuleSetting(
        profile.org_id,
        moduleId,
        enabled,
        existingSetting?.office_overrides
      );

      await refreshConfig();
      await loadData();
      
      toast.success(`Module ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating module setting:', error);
      toast.error('Failed to update module setting');
    } finally {
      setLoading(false);
    }
  };

  const handleOfficeOverride = async (
    moduleId: string,
    officeId: string,
    enabled: boolean
  ) => {
    if (!profile?.org_id) return;

    setLoading(true);
    try {
      const existingSetting = moduleSettings.find(s => s.module_id === moduleId);
      const officeOverrides = {
        ...(existingSetting?.office_overrides || {}),
        [officeId]: enabled,
      };

      await dataGateway.updateModuleSetting(
        profile.org_id,
        moduleId,
        existingSetting?.enabled ?? true,
        officeOverrides
      );

      await refreshConfig();
      await loadData();
      
      toast.success(`Office override ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating office override:', error);
      toast.error('Failed to update office override');
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = async (featureId: string, enabled: boolean) => {
    if (!profile?.org_id) return;

    setLoading(true);
    try {
      const existingSetting = featureSettings.find(s => s.feature_id === featureId);
      
      await dataGateway.updateFeatureSetting(
        profile.org_id,
        featureId,
        enabled,
        existingSetting?.office_overrides
      );

      await refreshConfig();
      await loadData();
      
      toast.success(`Feature ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating feature setting:', error);
      toast.error('Failed to update feature setting');
    } finally {
      setLoading(false);
    }
  };

  const getModuleSetting = (moduleId: string) => {
    return moduleSettings.find(s => s.module_id === moduleId);
  };

  const getFeatureSetting = (featureId: string) => {
    return featureSettings.find(s => s.feature_id === featureId);
  };

  const isModuleEnabledForOrg = (moduleId: string): boolean => {
    const setting = getModuleSetting(moduleId);
    return setting?.enabled ?? true;
  };

  const isFeatureEnabledForOrg = (featureId: string): boolean => {
    const setting = getFeatureSetting(featureId);
    return setting?.enabled ?? true;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Group features by module
  const featuresByModule = features.reduce((acc, feature) => {
    if (!acc[feature.moduleId]) {
      acc[feature.moduleId] = [];
    }
    acc[feature.moduleId].push(feature);
    return acc;
  }, {} as Record<string, typeof features>);

  return (
    <div className="size-full bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="size-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Platform Configuration</h1>
          </div>
          <p className="text-gray-600">
            Manage module and feature availability across your organization
          </p>
        </div>

        <Tabs defaultValue="modules" className="space-y-6" onValueChange={setCurrentTab}>
          <TabsList>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="risk-scoring">
              <ShieldAlert className="size-3.5 mr-1.5" />
              Risk Scoring
            </TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Module Management</CardTitle>
                <CardDescription>
                  Enable or disable modules at organization level, with optional office overrides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modules.map((module) => {
                    const setting = getModuleSetting(module.id);
                    const isEnabled = isModuleEnabledForOrg(module.id);
                    const hasOverrides = setting?.office_overrides && 
                      Object.keys(setting.office_overrides).length > 0;

                    return (
                      <div
                        key={module.id}
                        className="border border-gray-200 rounded-lg p-4 bg-white"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-gray-900">{module.name}</h3>
                              {isEnabled ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle2 className="size-3 mr-1" />
                                  Enabled
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  <XCircle className="size-3 mr-1" />
                                  Disabled
                                </Badge>
                              )}
                              {hasOverrides && (
                                <Badge variant="outline" className="text-blue-700 border-blue-300">
                                  <Building2 className="size-3 mr-1" />
                                  {Object.keys(setting.office_overrides).length} overrides
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Organization:</span>
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={(checked) => handleModuleToggle(module.id, checked)}
                                disabled={loading || module.id === 'admin'}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Office Overrides */}
                        {offices.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                              <Building2 className="size-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">Office Overrides</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {offices.map((office) => {
                                const officeEnabled = setting?.office_overrides?.[office.id] ?? isEnabled;
                                
                                return (
                                  <div
                                    key={office.id}
                                    className="flex items-center justify-between p-2 rounded bg-gray-50"
                                  >
                                    <span className="text-sm text-gray-700">{office.name}</span>
                                    <Switch
                                      checked={officeEnabled}
                                      onCheckedChange={(checked) =>
                                        handleOfficeOverride(module.id, office.id, checked)
                                      }
                                      disabled={loading || module.id === 'admin'}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Management</CardTitle>
                <CardDescription>
                  Enable or disable specific features within each module
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {modules.map((module) => {
                    const moduleFeatures = featuresByModule[module.id] || [];
                    
                    if (moduleFeatures.length === 0) return null;

                    return (
                      <AccordionItem
                        key={module.id}
                        value={module.id}
                        className="border border-gray-200 rounded-lg px-4 bg-white"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{module.name}</span>
                            <Badge variant="outline">
                              {moduleFeatures.length} features
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            {moduleFeatures.map((feature) => {
                              const isEnabled = isFeatureEnabledForOrg(feature.id);
                              
                              return (
                                <div
                                  key={feature.id}
                                  className="flex items-center justify-between p-3 rounded bg-gray-50"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900">{feature.name}</span>
                                      {isEnabled ? (
                                        <CheckCircle2 className="size-4 text-green-600" />
                                      ) : (
                                        <XCircle className="size-4 text-red-600" />
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">{feature.description}</p>
                                  </div>
                                  <Switch
                                    checked={isEnabled}
                                    onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked)}
                                    disabled={loading}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Configure and manage third-party integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IntegrationsConfig />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Scoring Tab */}
          <TabsContent value="risk-scoring">
            <RiskThresholdsConfig />
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="size-5" />
                      Audit Logs
                    </CardTitle>
                    <CardDescription>
                      Track all configuration changes made to the system
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadData}>
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {auditLogs.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No audit logs available
                      </div>
                    ) : (
                      auditLogs.map((log, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 bg-white"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {log.action}
                              </Badge>
                              <span className="text-sm font-medium text-gray-900">
                                {log.entity_type}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div>Entity ID: <span className="font-mono text-xs">{log.entity_id}</span></div>
                            <div className="text-xs text-gray-500 mt-1">User: {log.user_id}</div>
                          </div>
                          {log.old_value && log.new_value && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <div className="font-medium text-gray-700 mb-1">Old Value:</div>
                                  <pre className="bg-gray-50 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(JSON.parse(log.old_value), null, 2)}
                                  </pre>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-700 mb-1">New Value:</div>
                                  <pre className="bg-gray-50 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(JSON.parse(log.new_value), null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}