/**
 * Module Management Panel V2
 * 
 * Enable/disable major platform modules. When disabled, navigation items
 * and workflows are hidden from all users.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import {
  CheckCircle,
  XCircle,
  Info,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface PlatformModule {
  id: string;
  name: string;
  description: string;
  status: 'enabled' | 'disabled';
  navigationPaths: string[];
  dependsOn?: string[];
  requiredBy?: string[];
}

interface ModuleManagementPanelV2Props {
  onConfigChange: () => void;
}

export default function ModuleManagementPanelV2({ onConfigChange }: ModuleManagementPanelV2Props) {
  const [modules, setModules] = useState<PlatformModule[]>([
    {
      id: 'admissions',
      name: 'Admissions',
      description: 'Referral intake, admission pipeline, and new patient setup workflows',
      status: 'enabled',
      navigationPaths: ['/referral-pipeline', '/admission-pipeline', '/admissions', '/new-admission'],
    },
    {
      id: 'scheduling',
      name: 'Scheduling',
      description: 'Visit scheduling, caregiver assignment, and route optimization',
      status: 'enabled',
      navigationPaths: ['/scheduling'],
      requiredBy: ['evv'],
    },
    {
      id: 'clinical-documentation',
      name: 'Clinical Documentation',
      description: 'Visit notes, assessments, care plans, and clinical records',
      status: 'enabled',
      navigationPaths: ['/clinical', '/clinical-documentation-workspace', '/visit-notes'],
      requiredBy: ['qa-review', 'billing'],
    },
    {
      id: 'medications',
      name: 'Medications',
      description: 'Medication management, reconciliation, and tracking',
      status: 'enabled',
      navigationPaths: ['/patient-medication-profile', '/medication-reconciliation-workflow'],
      dependsOn: ['clinical-documentation'],
    },
    {
      id: 'care-plans',
      name: 'Care Plans',
      description: 'Patient care planning, goals, and interventions',
      status: 'enabled',
      navigationPaths: ['/care-plan-management', '/care-plan-editor'],
      dependsOn: ['clinical-documentation'],
    },
    {
      id: 'orders-certification',
      name: 'Orders and Certification',
      description: 'Physician orders, plan of care (485), and certification periods',
      status: 'enabled',
      navigationPaths: ['/orders-workspace', '/orders-certification', '/plan-of-care-485'],
      requiredBy: ['billing'],
    },
    {
      id: 'qa-review',
      name: 'QA Review',
      description: 'Quality assurance, document review, and compliance checking',
      status: 'enabled',
      navigationPaths: ['/qa-workspace', '/qa-center', '/document-review-interface'],
      dependsOn: ['clinical-documentation'],
    },
    {
      id: 'billing',
      name: 'Billing',
      description: 'Claims management, billing operations, and revenue cycle',
      status: 'enabled',
      navigationPaths: ['/billing'],
      dependsOn: ['clinical-documentation', 'orders-certification'],
    },
    {
      id: 'payroll',
      name: 'Payroll',
      description: 'Caregiver payroll, time tracking, and compensation',
      status: 'disabled',
      navigationPaths: ['/payroll'],
      dependsOn: ['evv'],
    },
    {
      id: 'evv',
      name: 'EVV',
      description: 'Electronic visit verification and compliance',
      status: 'enabled',
      navigationPaths: ['/poc', '/poc/monitor'],
      dependsOn: ['scheduling'],
    },
    {
      id: 'integrations',
      name: 'Integrations',
      description: 'External system integrations and vendor management',
      status: 'enabled',
      navigationPaths: ['/integration-management', '/integration-architecture'],
    },
  ]);

  const [showHiddenPaths, setShowHiddenPaths] = useState(false);

  const handleToggle = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return;

    // Check if disabling would break dependencies
    if (module.status === 'enabled' && module.requiredBy && module.requiredBy.length > 0) {
      const dependentModules = modules.filter(
        (m) => m.status === 'enabled' && module.requiredBy?.includes(m.id)
      );
      if (dependentModules.length > 0) {
        alert(
          `Cannot disable "${module.name}" module.\n\nThe following enabled modules depend on it:\n${dependentModules.map((m) => `• ${m.name}`).join('\n')}\n\nDisable those modules first.`
        );
        return;
      }
    }

    // Check if enabling requires dependencies
    if (module.status === 'disabled' && module.dependsOn) {
      const missingDeps = module.dependsOn.filter(
        (depId) => modules.find((m) => m.id === depId)?.status !== 'enabled'
      );
      if (missingDeps.length > 0) {
        const depNames = missingDeps
          .map((depId) => modules.find((m) => m.id === depId)?.name)
          .join(', ');
        alert(
          `Cannot enable "${module.name}" module.\n\nRequired dependencies must be enabled first:\n${missingDeps.map((depId) => `• ${modules.find((m) => m.id === depId)?.name}`).join('\n')}`
        );
        return;
      }
    }

    setModules(
      modules.map((m) =>
        m.id === moduleId
          ? { ...m, status: m.status === 'enabled' ? 'disabled' : 'enabled' }
          : m
      )
    );
    onConfigChange();
  };

  const enabledCount = modules.filter((m) => m.status === 'enabled').length;
  const totalHiddenPaths = modules
    .filter((m) => m.status === 'disabled')
    .reduce((acc, m) => acc + m.navigationPaths.length, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Platform Modules</h2>
            <p className="text-sm text-gray-600">
              Control which major modules are available to users
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {enabledCount}/{modules.length}
            </div>
            <div className="text-xs text-gray-600">Modules Enabled</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Info className="w-4 h-4 text-blue-700" />
            <span>
              When a module is disabled, its navigation items and workflows are hidden from all
              users
            </span>
          </div>
          {totalHiddenPaths > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHiddenPaths(!showHiddenPaths)}
            >
              {showHiddenPaths ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Paths
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show {totalHiddenPaths} Hidden Paths
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Module Grid */}
      <div className="grid grid-cols-2 gap-4">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onToggle={() => handleToggle(module.id)}
            showPaths={showHiddenPaths}
          />
        ))}
      </div>

      {/* Dependency Info */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Module Dependencies</p>
            <p>
              Some modules require other modules to be enabled. For example, "Billing" requires
              "Clinical Documentation" and "Orders and Certification" to function properly. The
              system will prevent you from creating invalid configurations.
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
  showPaths,
}: {
  module: PlatformModule;
  onToggle: () => void;
  showPaths: boolean;
}) {
  const isEnabled = module.status === 'enabled';

  return (
    <Card
      className={cn(
        'p-5 transition-all',
        isEnabled
          ? 'bg-white border-green-200 shadow-sm'
          : 'bg-gray-50 border-gray-300 opacity-75'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{module.name}</h3>
            {isEnabled ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">{module.description}</p>
        </div>
      </div>

      {/* Dependencies */}
      {module.dependsOn && module.dependsOn.length > 0 && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
          <span className="font-medium">Requires:</span> {module.dependsOn.join(', ')}
        </div>
      )}

      {/* Required By */}
      {module.requiredBy && module.requiredBy.length > 0 && (
        <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          <span className="font-medium">Required by:</span> {module.requiredBy.join(', ')}
        </div>
      )}

      {/* Navigation Paths */}
      {showPaths && !isEnabled && module.navigationPaths.length > 0 && (
        <div className="mb-3 p-2 bg-gray-100 border border-gray-300 rounded">
          <div className="text-xs font-medium text-gray-700 mb-1">Hidden Navigation Paths:</div>
          <ul className="text-xs text-gray-600 space-y-0.5">
            {module.navigationPaths.map((path) => (
              <li key={path} className="font-mono">
                {path}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Toggle */}
      <div className="flex items-center justify-between pt-3 border-t">
        <Label htmlFor={`module-${module.id}`} className="text-sm font-medium text-gray-700">
          Status
        </Label>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              isEnabled
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'bg-gray-100 text-gray-700 border-gray-300'
            )}
          >
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
          <Switch
            id={`module-${module.id}`}
            checked={isEnabled}
            onCheckedChange={onToggle}
          />
        </div>
      </div>
    </Card>
  );
}
