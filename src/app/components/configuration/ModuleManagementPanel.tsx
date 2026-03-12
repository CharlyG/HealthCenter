/**
 * Module Management Panel
 * 
 * Enable/disable platform modules and configure module-specific settings.
 * Allows agencies to customize which features are available to their users.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import {
  Settings,
  CheckCircle,
  XCircle,
  Package,
  ChevronRight,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  category: 'clinical' | 'operations' | 'billing' | 'compliance' | 'analytics';
  enabled: boolean;
  requiredFor?: string[];
  dependencies?: string[];
  icon: string;
}

interface ModuleManagementPanelProps {
  onConfigChange: () => void;
}

export default function ModuleManagementPanel({ onConfigChange }: ModuleManagementPanelProps) {
  const [modules, setModules] = useState<ModuleConfig[]>([
    {
      id: 'patient-chart',
      name: 'Patient Chart',
      description: 'Electronic patient records and clinical documentation',
      category: 'clinical',
      enabled: true,
      requiredFor: ['visit-documentation', 'care-plan', 'medication-management'],
      icon: '📋',
    },
    {
      id: 'visit-documentation',
      name: 'Visit Documentation',
      description: 'Point of care visit notes and documentation',
      category: 'clinical',
      enabled: true,
      dependencies: ['patient-chart'],
      icon: '📝',
    },
    {
      id: 'care-plan',
      name: 'Care Plan Management',
      description: 'Patient care planning and goal tracking',
      category: 'clinical',
      enabled: true,
      dependencies: ['patient-chart'],
      icon: '🎯',
    },
    {
      id: 'medication-management',
      name: 'Medication Management',
      description: 'Medication reconciliation and tracking',
      category: 'clinical',
      enabled: true,
      dependencies: ['patient-chart'],
      icon: '💊',
    },
    {
      id: 'oasis-assessment',
      name: 'OASIS-E Assessment',
      description: 'OASIS-E assessment engine and scoring',
      category: 'clinical',
      enabled: true,
      icon: '📊',
    },
    {
      id: 'scheduling',
      name: 'Visit Scheduling',
      description: 'Schedule and manage patient visits',
      category: 'operations',
      enabled: true,
      icon: '📅',
    },
    {
      id: 'referral-pipeline',
      name: 'Referral Pipeline',
      description: 'Manage incoming referrals and admissions',
      category: 'operations',
      enabled: true,
      icon: '📥',
    },
    {
      id: 'admission-queue',
      name: 'Admission Queue',
      description: 'Admission workflow and task management',
      category: 'operations',
      enabled: true,
      icon: '✅',
    },
    {
      id: 'evv-integration',
      name: 'EVV Integration',
      description: 'Electronic visit verification',
      category: 'compliance',
      enabled: true,
      icon: '✓',
    },
    {
      id: 'qa-center',
      name: 'QA Center',
      description: 'Quality assurance and document review',
      category: 'compliance',
      enabled: true,
      icon: '🔍',
    },
    {
      id: 'billing-workspace',
      name: 'Billing Workspace',
      description: 'Claims management and billing operations',
      category: 'billing',
      enabled: false,
      icon: '💰',
    },
    {
      id: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      description: 'Business intelligence and reporting',
      category: 'analytics',
      enabled: true,
      icon: '📈',
    },
  ]);

  const [selectedModule, setSelectedModule] = useState<ModuleConfig | null>(null);

  const handleToggleModule = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return;

    // Check if disabling would break dependencies
    if (module.enabled && module.requiredFor && module.requiredFor.length > 0) {
      const dependentModules = modules.filter(
        (m) => m.enabled && module.requiredFor?.includes(m.id)
      );
      if (dependentModules.length > 0) {
        alert(
          `Cannot disable ${module.name}. The following modules depend on it:\n${dependentModules.map((m) => m.name).join('\n')}`
        );
        return;
      }
    }

    // Check if enabling requires dependencies
    if (!module.enabled && module.dependencies) {
      const missingDeps = module.dependencies.filter(
        (depId) => !modules.find((m) => m.id === depId)?.enabled
      );
      if (missingDeps.length > 0) {
        const depNames = missingDeps
          .map((depId) => modules.find((m) => m.id === depId)?.name)
          .join(', ');
        alert(`Cannot enable ${module.name}. Required dependencies: ${depNames}`);
        return;
      }
    }

    setModules(
      modules.map((m) => (m.id === moduleId ? { ...m, enabled: !m.enabled } : m))
    );
    onConfigChange();
  };

  const categories = [
    { id: 'clinical', label: 'Clinical', color: 'blue' },
    { id: 'operations', label: 'Operations', color: 'green' },
    { id: 'billing', label: 'Billing', color: 'purple' },
    { id: 'compliance', label: 'Compliance', color: 'amber' },
    { id: 'analytics', label: 'Analytics', color: 'pink' },
  ] as const;

  const enabledCount = modules.filter((m) => m.enabled).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Module Configuration</h2>
            <p className="text-sm text-gray-600">
              Enable or disable platform modules based on your agency's needs
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {enabledCount}/{modules.length}
            </div>
            <div className="text-xs text-gray-600">Modules Enabled</div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {categories.map((cat) => {
            const count = modules.filter(
              (m) => m.category === cat.id && m.enabled
            ).length;
            const total = modules.filter((m) => m.category === cat.id).length;
            return (
              <div key={cat.id} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  {count}/{total}
                </div>
                <div className="text-xs text-gray-600">{cat.label}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Modules by Category */}
      {categories.map((category) => {
        const categoryModules = modules.filter((m) => m.category === category.id);
        if (categoryModules.length === 0) return null;

        return (
          <Card key={category.id} className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'text-sm',
                  category.color === 'blue'
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : category.color === 'green'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : category.color === 'purple'
                    ? 'bg-purple-100 text-purple-700 border-purple-300'
                    : category.color === 'amber'
                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                    : 'bg-pink-100 text-pink-700 border-pink-300'
                )}
              >
                {category.label}
              </Badge>
            </h3>

            <div className="space-y-3">
              {categoryModules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onToggle={() => handleToggleModule(module.id)}
                  onConfigure={() => setSelectedModule(module)}
                />
              ))}
            </div>
          </Card>
        );
      })}

      {/* Dependency Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Module Dependencies</p>
            <p>
              Some modules require other modules to be enabled. The system will prevent you from
              disabling modules that other enabled modules depend on.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE CARD
// ═══════════════════════════════════════════════════════════════════════════

function ModuleCard({
  module,
  onToggle,
  onConfigure,
}: {
  module: ModuleConfig;
  onToggle: () => void;
  onConfigure: () => void;
}) {
  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all',
        module.enabled
          ? 'bg-white border-green-200 shadow-sm'
          : 'bg-gray-50 border-gray-200 opacity-75'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{module.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900">{module.name}</h4>
              {module.enabled ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{module.description}</p>

            {/* Dependencies */}
            {module.dependencies && module.dependencies.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>Requires: {module.dependencies.join(', ')}</span>
              </div>
            )}

            {/* Required For */}
            {module.requiredFor && module.requiredFor.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Info className="w-3 h-3 text-blue-600" />
                <span>Required by: {module.requiredFor.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor={`module-${module.id}`} className="text-sm text-gray-700">
              {module.enabled ? 'Enabled' : 'Disabled'}
            </Label>
            <Switch
              id={`module-${module.id}`}
              checked={module.enabled}
              onCheckedChange={onToggle}
            />
          </div>
          {module.enabled && (
            <Button variant="ghost" size="sm" onClick={onConfigure}>
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
