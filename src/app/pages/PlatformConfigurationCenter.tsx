/**
 * Platform Configuration Center
 * 
 * Centralized control center for system administrators to configure platform
 * behavior without code changes. Includes module management, vendor integrations,
 * clinical settings, scheduling, notifications, RBAC, and feature flags.
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
  Shield,
  Download,
  Upload,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Package,
  Zap,
  Stethoscope,
  Calendar,
  Bell,
  Users,
  Flag,
  History,
  Lock,
} from 'lucide-react';
import { cn } from '../lib/utils';
import ModuleManagementPanel from '../components/configuration/ModuleManagementPanel';
import ModuleManagementPanelV2 from '../components/configuration/ModuleManagementPanelV2';
import VendorIntegrationsPanel from '../components/configuration/VendorIntegrationsPanel';
import ClinicalSettingsPanel from '../components/configuration/ClinicalSettingsPanel';
import ClinicalConfigurationPanel from '../components/configuration/ClinicalConfigurationPanel';
import SchedulingSettingsPanel from '../components/configuration/SchedulingSettingsPanel';
import NotificationsConfigPanel from '../components/configuration/NotificationsConfigPanel';
import NotificationConfigurationPanel from '../components/configuration/NotificationConfigurationPanel';
import UserRolesPermissionsPanel from '../components/configuration/UserRolesPermissionsPanel';
import FeatureFlagsPanel from '../components/configuration/FeatureFlagsPanel';
import FeatureFlagsPanelV2 from '../components/configuration/FeatureFlagsPanelV2';
import VisitAlertRulesPanel from '../components/configuration/VisitAlertRulesPanel';
import ConfigurationHistoryPanel from '../components/configuration/ConfigurationHistoryPanel';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type ConfigTab =
  | 'modules'
  | 'integrations'
  | 'clinical'
  | 'scheduling'
  | 'notifications'
  | 'roles'
  | 'features'
  | 'history';

interface ConfigurationState {
  lastModified: string;
  lastModifiedBy: string;
  version: string;
  hasUnsavedChanges: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════

export default function PlatformConfigurationCenter() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ConfigTab>('modules');
  const [configState, setConfigState] = useState<ConfigurationState>({
    lastModified: '2024-03-10T14:30:00Z',
    lastModifiedBy: 'John Smith',
    version: '1.2.5',
    hasUnsavedChanges: false,
  });

  const handleSaveAll = () => {
    console.log('Saving all configuration changes...');
    setConfigState({ ...configState, hasUnsavedChanges: false });
  };

  const handleExportConfig = () => {
    console.log('Exporting configuration...');
    // In production, export as JSON
  };

  const handleImportConfig = () => {
    console.log('Importing configuration...');
    // In production, show file upload dialog
  };

  const handleResetToDefaults = () => {
    if (
      confirm(
        'Are you sure you want to reset all configuration to defaults? This action cannot be undone.'
      )
    ) {
      console.log('Resetting to defaults...');
    }
  };

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
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">
                    Platform Configuration Center
                  </h1>
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                    <Lock className="w-3 h-3 mr-1" />
                    Admin Only
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Customize platform behavior and features
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-xs text-gray-600">
                <div>Version {configState.version}</div>
                <div>
                  Modified by {configState.lastModifiedBy} •{' '}
                  {new Date(configState.lastModified).toLocaleDateString()}
                </div>
              </div>
              {configState.hasUnsavedChanges && (
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Action Bar */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveAll} disabled={!configState.hasUnsavedChanges}>
                <Save className="w-4 h-4 mr-2" />
                Save All Changes
              </Button>
              <Button variant="outline" onClick={handleExportConfig}>
                <Download className="w-4 h-4 mr-2" />
                Export Config
              </Button>
              <Button variant="outline" onClick={handleImportConfig}>
                <Upload className="w-4 h-4 mr-2" />
                Import Config
              </Button>
            </div>

            <Button variant="outline" onClick={handleResetToDefaults} className="text-red-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </Card>

        {/* Warning Notice */}
        <Card className="p-4 mb-6 border-l-4 border-l-amber-500 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Administrator Access Required</h3>
              <p className="text-sm text-amber-800">
                Configuration changes affect all users and workflows. Changes are logged and may
                require system restart. Test changes in a staging environment before applying to
                production.
              </p>
            </div>
          </div>
        </Card>

        {/* Configuration Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ConfigTab)}>
          <TabsList className="grid grid-cols-8 w-full mb-6">
            <TabsTrigger value="modules">
              <Package className="w-4 h-4 mr-2" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Zap className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="clinical">
              <Stethoscope className="w-4 h-4 mr-2" />
              Clinical
            </TabsTrigger>
            <TabsTrigger value="scheduling">
              <Calendar className="w-4 h-4 mr-2" />
              Scheduling
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Users className="w-4 h-4 mr-2" />
              Roles & Permissions
            </TabsTrigger>
            <TabsTrigger value="features">
              <Flag className="w-4 h-4 mr-2" />
              Feature Flags
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Module Management */}
          <TabsContent value="modules">
            <ModuleManagementPanelV2
              onConfigChange={() => setConfigState({ ...configState, hasUnsavedChanges: true })}
            />
          </TabsContent>

          {/* Vendor Integrations */}
          <TabsContent value="integrations">
            <VendorIntegrationsPanel
              onConfigChange={() => setConfigState({ ...configState, hasUnsavedChanges: true })}
            />
          </TabsContent>

          {/* Clinical Settings */}
          <TabsContent value="clinical">
            <ClinicalConfigurationPanel
              onConfigChange={() => setConfigState({ ...configState, hasUnsavedChanges: true })}
            />
          </TabsContent>

          {/* Scheduling Settings */}
          <TabsContent value="scheduling">
            <div className="space-y-6">
              <SchedulingSettingsPanel
                onConfigChange={() => setConfigState({ ...configState, hasUnsavedChanges: true })}
              />
              <VisitAlertRulesPanel
                onConfigChange={() => setConfigState({ ...configState, hasUnsavedChanges: true })}
              />
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <NotificationConfigurationPanel
              onConfigChange={() => setConfigState({ ...configState, hasUnsavedChanges: true })}
            />
          </TabsContent>

          {/* Roles & Permissions */}
          <TabsContent value="roles">
            <UserRolesPermissionsPanel
              onConfigChange={() => setConfigState({ ...configState, hasUnsavedChanges: true })}
            />
          </TabsContent>

          {/* Feature Flags */}
          <TabsContent value="features">
            <FeatureFlagsPanelV2
              onConfigChange={() => setConfigState({ ...configState, hasUnsavedChanges: true })}
            />
          </TabsContent>

          {/* Configuration History */}
          <TabsContent value="history">
            <ConfigurationHistoryPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}