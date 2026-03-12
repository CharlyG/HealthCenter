/**
 * Feature Flags Panel V2
 * 
 * Enable/disable specific features within modules for gradual capability adoption.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Flag, Zap, Beaker, Rocket, AlertTriangle, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  status: 'enabled' | 'disabled';
  maturityLevel: 'stable' | 'beta' | 'experimental';
  moduleAssociation: string;
}

interface FeatureFlagsPanelV2Props {
  onConfigChange: () => void;
}

export default function FeatureFlagsPanelV2({ onConfigChange }: FeatureFlagsPanelV2Props) {
  const [flags, setFlags] = useState<FeatureFlag[]>([
    {
      id: 'ai-documentation',
      name: 'AI Documentation Assistance',
      description: 'Use AI to suggest documentation content, auto-complete notes, and detect missing information',
      status: 'enabled',
      maturityLevel: 'beta',
      moduleAssociation: 'clinical-documentation',
    },
    {
      id: 'medication-interactions',
      name: 'Medication Interaction Alerts',
      description: 'Real-time alerts for drug-drug interactions, allergies, and contraindications',
      status: 'enabled',
      maturityLevel: 'stable',
      moduleAssociation: 'medications',
    },
    {
      id: 'auto-visit-reminders',
      name: 'Automated Visit Reminders',
      description: 'Automatically send SMS/email reminders to caregivers and patients before visits',
      status: 'enabled',
      maturityLevel: 'stable',
      moduleAssociation: 'scheduling',
    },
    {
      id: 'smart-visit-prep',
      name: 'Smart Visit Preparation Panel',
      description: 'AI-powered visit preparation with patient history, alerts, and contextual information',
      status: 'enabled',
      maturityLevel: 'beta',
      moduleAssociation: 'evv',
    },
    {
      id: 'command-center-alerts',
      name: 'Command Center Alerts',
      description: 'Real-time operational alerts in the Care Operations Command Center',
      status: 'enabled',
      maturityLevel: 'stable',
      moduleAssociation: 'admissions',
    },
    {
      id: 'advanced-qa-validation',
      name: 'Advanced QA Validation',
      description: 'Enhanced validation rules, automated compliance checking, and OASIS scoring validation',
      status: 'enabled',
      maturityLevel: 'beta',
      moduleAssociation: 'qa-review',
    },
    {
      id: 'predictive-scheduling',
      name: 'Predictive Scheduling',
      description: 'Machine learning-based schedule optimization and caregiver assignment suggestions',
      status: 'disabled',
      maturityLevel: 'experimental',
      moduleAssociation: 'scheduling',
    },
    {
      id: 'voice-documentation',
      name: 'Voice-to-Text Documentation',
      description: 'Dictate visit notes and clinical documentation using voice commands',
      status: 'disabled',
      maturityLevel: 'beta',
      moduleAssociation: 'clinical-documentation',
    },
    {
      id: 'automated-billing-validation',
      name: 'Automated Billing Validation',
      description: 'Pre-submission claims validation to reduce denials and rejections',
      status: 'disabled',
      maturityLevel: 'experimental',
      moduleAssociation: 'billing',
    },
    {
      id: 'care-plan-recommendations',
      name: 'Care Plan Recommendations',
      description: 'AI-suggested care plan goals and interventions based on patient conditions',
      status: 'disabled',
      maturityLevel: 'experimental',
      moduleAssociation: 'care-plans',
    },
    {
      id: 'telehealth-visits',
      name: 'Telehealth Visits',
      description: 'Video visit capabilities with integrated documentation',
      status: 'disabled',
      maturityLevel: 'beta',
      moduleAssociation: 'evv',
    },
    {
      id: 'real-time-collaboration',
      name: 'Real-time Collaboration',
      description: 'Multiple users editing the same document simultaneously with live sync',
      status: 'disabled',
      maturityLevel: 'experimental',
      moduleAssociation: 'clinical-documentation',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterMaturity, setFilterMaturity] = useState<'all' | 'stable' | 'beta' | 'experimental'>('all');

  const handleToggle = (flagId: string) => {
    setFlags(
      flags.map((f) =>
        f.id === flagId
          ? { ...f, status: f.status === 'enabled' ? 'disabled' : 'enabled' }
          : f
      )
    );
    onConfigChange();
  };

  // Get unique modules
  const modules = ['all', ...Array.from(new Set(flags.map((f) => f.moduleAssociation)))];

  // Filtering
  const filteredFlags = flags.filter((flag) => {
    if (filterModule !== 'all' && flag.moduleAssociation !== filterModule) return false;
    if (filterMaturity !== 'all' && flag.maturityLevel !== filterMaturity) return false;
    if (
      searchQuery &&
      !flag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !flag.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const enabledCount = flags.filter((f) => f.status === 'enabled').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Feature Flags</h2>
            <p className="text-sm text-gray-600">
              Control specific features within modules for gradual capability adoption
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {enabledCount}/{flags.length}
            </div>
            <div className="text-xs text-gray-600">Features Enabled</div>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Flag className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Gradual Feature Adoption</p>
              <p>
                Feature flags allow you to enable new capabilities gradually. Beta and experimental
                features may have incomplete functionality or require additional testing.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Modules</option>
            {modules.slice(1).map((mod) => (
              <option key={mod} value={mod}>
                {mod.replace(/-/g, ' ')}
              </option>
            ))}
          </select>

          <select
            value={filterMaturity}
            onChange={(e) => setFilterMaturity(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Maturity Levels</option>
            <option value="stable">Stable Only</option>
            <option value="beta">Beta Only</option>
            <option value="experimental">Experimental Only</option>
          </select>
        </div>

        <div className="text-xs text-gray-600">
          Showing {filteredFlags.length} of {flags.length} features
        </div>
      </Card>

      {/* Feature Flags Grid */}
      <div className="space-y-3">
        {filteredFlags.map((flag) => (
          <FeatureFlagCard
            key={flag.id}
            flag={flag}
            onToggle={() => handleToggle(flag.id)}
          />
        ))}
      </div>

      {filteredFlags.length === 0 && (
        <Card className="p-12 text-center">
          <Flag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No feature flags match your filters</p>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE FLAG CARD
// ═══════════════════════════════════════════════════════════════════════════

function FeatureFlagCard({
  flag,
  onToggle,
}: {
  flag: FeatureFlag;
  onToggle: () => void;
}) {
  const maturityConfig = {
    stable: { color: 'green', icon: Rocket, label: 'Stable' },
    beta: { color: 'blue', icon: Zap, label: 'Beta' },
    experimental: { color: 'amber', icon: Beaker, label: 'Experimental' },
  };

  const config = maturityConfig[flag.maturityLevel];
  const Icon = config.icon;
  const isEnabled = flag.status === 'enabled';

  return (
    <Card
      className={cn(
        'p-4 transition-all',
        isEnabled ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-gray-900">{flag.name}</h3>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                config.color === 'green'
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : config.color === 'blue'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-amber-100 text-amber-700 border-amber-300'
              )}
            >
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {flag.moduleAssociation.replace(/-/g, ' ')}
            </Badge>
          </div>

          <p className="text-sm text-gray-600 mb-2">{flag.description}</p>

          {flag.maturityLevel === 'experimental' && isEnabled && (
            <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-flex">
              <AlertTriangle className="w-3 h-3" />
              Experimental feature - use with caution in production
            </div>
          )}
        </div>

        <Switch checked={isEnabled} onCheckedChange={onToggle} />
      </div>
    </Card>
  );
}
